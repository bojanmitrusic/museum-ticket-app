require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB')
    })
    .catch((err) => {
        console.log('MongoDB connection error:', err.message)
    })

const museumSchema= new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        city:{
            type:String,
            required:true,
            trim:true
        },
        description:{
            type:String,
            required:true,
            trim:true
        },
        location:{
            type:String,
            required:true,
            trim:true
        }
    }
)

const UserSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        lastName:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            trim:true
        },
        password:{
            type:String,
            required:true,
            minlength:6,
        },
        role:{
            type:String,
            enum:['user','admin'],
            default: 'user'
        }
    }
)
const Museum = mongoose.model('Museum', museumSchema);
const User = new mongoose.model('User', UserSchema);

// Get museums
app.get('/api/museums', async (req, res) => {
    try {
        const museums = await Museum.find()
        res.status(200).json(museums)
    }catch(err){
        res.status(400).json(err)
    }
})

// Create museum
app.post('/api/museums', async (req, res) => {
    try{
        const museum = await Museum.create(req.body);
        res.status(200).json(museum)
    }catch(err){
        res.status(400).json(err);
    }
})

//Delete Museum

app.delete('/api/museums/:id', async (req, res) => {
    try {
        const museum = await Museum.findByIdAndDelete(req.params.id);
        if (!museum) {
          return   res.status(404).json({
                message: 'Museum not found'
            })

        }
        return res.status(200).json(museum);
    }catch(err){
        res.status(400).json(err);
    }
})
//Patch

app.patch('/api/museums/:id', async (req, res) => {
    try {
        const museum = await Museum.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )

        if (!museum) {
            return res.status(404).json({
                message: 'Museum not found'
            })
        }

        return res.status(200).json(museum)
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
})

// User registration
app.post('/api/auth/register', async (req, res) => {
    try{
        const {name,lastName,email,password}=req.body;
        if(!name || !lastName || !email || !password ){
            return res.status(400).json({
                message: 'All fields are required'
            })
        }
        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.status(400).json({
                message: 'User already exists'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            lastName,
            email,
            password: hashedPassword,

        })
        return res.status(201).json({
            message: 'User successfully registered',
            user:{
                id:user._id,
                name:user.name,
                lastName:user.lastName,
                email:user.email,
                role:user.role,
            }

        })
    }catch(err){
        return res.status(500).json({
            message: err.message
        });
    }
})

// User Login
app.post('/api/auth/login', async (req, res) => {
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({
                message: 'Email and password are required'
            })
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({
                message: 'Invalid email or password.'
            })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }
        const token = jwt.sign({
            id: user._id,
            role:user.role,

        },
            process.env.JWT_SECRET, {expiresIn: '15m'})
        return res.status(200).json({
            message: 'Login successfully',
            token,
            user:{
                id:user._id,
                name:user.name,
                lastName:user.lastName,
                email:user.email,
                role:user.role,

            }
        })
    }catch(err){
        return res.status(500).json({
            message: err.message
        })
    }
})

app.listen(port, () => {
console.log('Server started on port 3000');
})