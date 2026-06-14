require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
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
        }
    }
)
const Museum = mongoose.model('Museum', museumSchema);

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
        res.status(201).json(museum);
    }catch(err){
        res.status(400).json(err);
    }
})

//Delete Museum

app.delete('/api/museums/:id', async (req, res) => {
    try {
        const museum = await Museum.findByIdAndDelete(req.params.id);
        if (!museum) {
            res.status(404).json({
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

app.listen(3000, () => {
console.log('Server started on port 3000');
})