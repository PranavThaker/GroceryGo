const User = require('../models/userModel')

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const user = new User({ name, email, password })
        await user.save()
        res.status(201).json({ message: 'User created successfully', user })
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating user', error })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email, password })
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        }
        res.json({ message: "Login Successful", user: req.session.user })
    }
    catch (error) {
        res.status(400).json({ message: 'Error logging in', error })
    }
}

exports.logout = (req, res) => {
    req.session.destroy()
    res.json({ message: "Logged Out Successfully" })
}

exports.checkSession = (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user })
    } else {
        res.status(401).json({ message: "No active session" })
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body
        const user = await User.findByIdAndUpdate(
            req.session.user._id,
            { name, email, phone, address },
            { new: true }
        )
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            isAdmin: user.isAdmin
        }
        res.json({ message: 'Profile updated successfully', user: req.session.user })
    } catch (error) {
        res.status(400).json({ message: 'Error updating profile', error })
    }
}