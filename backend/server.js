const express = require('express')
const cors = require('cors')
const session = require('express-session')
const app = express()

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))
app.use(express.json())
app.use(session({
    secret: "thisissecretkey",
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}))

const connectDB = require('./config/db')
connectDB()

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/cart', require('./routes/cartRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))
app.use('/api/misc', require('./routes/miscRoutes'))

app.listen(5000, () => {
    console.log('Server is running on port 5000')
})