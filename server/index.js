const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
app.use(cors())
app.use(express.json())
const museums = [
    {
        id: 1,
        name: 'National Museum',
        city: 'Belgrade',
    },
    {
        id: 2,
        name: 'Museum of Contemporary Art',
        city: 'Belgrade',
    },
]

app.get('/api/v1/museums', (req, res) => {
    res.json(museums)
})

app.post('/api/v1/museums', (req, res) => {
    const { name, city } = req.body || {}
    if (!name || !city) {
        return res.status(400).json({
            message: 'Name and city are required',
        })
    }
    const newMuseum = {
        id:museums.length + 1,
        name,
        city,
    }
    museums.push(newMuseum)
    return  res.status(200).json(newMuseum)


})
app.patch('/api/v1/museums/:id', (req, res) => {
    const  id = Number(req.params.id)
    const { name, city } = req.body || {}
    const museum = museums.find((museum) => museum.id === id)
    if (!museum) {
        return res.status(404).json({})
    }
    if(name){
        museum.name = name
    }
    if(city){
        museum.city = city
    }
    res.json(museum)
})

app.delete('/api/v1/museums/:id', (req, res) => {
    const id = Number(req.params.id)
    const museum = museums.find((museum) => museum.id === id)
    if (!museum) {
        return res.status(404).json({})
    }
    res.status(200).json(museum)
})

app.listen(3000, () => {
    console.log('Backend is on port 3000')
})