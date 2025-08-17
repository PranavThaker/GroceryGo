const express = require('express')
const router = express.Router()
const adminMiddleware = require('../middleware/adminMiddleware')
const { getAllUsers, getAllProducts, getAllOrders } = require('../controllers/adminController')

// Apply admin middleware to all admin routes
router.use(adminMiddleware)

router.get('/users', getAllUsers)
router.get('/products', getAllProducts)
router.get('/orders', getAllOrders)

module.exports = router