const express = require('express')
const router = express.Router()

router.get('/home', (req, res) => {
    res.send('Welcome to GroceryGo API')
})

router.get('/about', (req, res) => {
    res.send('About GroceryGo: Your one-stop grocery shopping solution.')
})

module.exports = router