const express = require('express')
const router = express.Router()
const { signup, login, logout, checkSession, updateProfile } = require('../controllers/authController')

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)
router.get('/session', checkSession)
router.put('/profile', updateProfile)

module.exports = router