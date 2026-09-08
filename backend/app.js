const express = require('express')
const cors = require('cors')
const session = require('express-session')
const dotenv = require('dotenv')
dotenv.config()

const app = express()

const SESSION_SECRET = process.env.SESSION_SECRET || 'grocerygo_session_secret'
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN

app.use(cors({
    origin: CLIENT_ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(session({
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}))

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/cart', require('./routes/cartRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))
app.use('/api/misc', require('./routes/miscRoutes'))

module.exports = app
