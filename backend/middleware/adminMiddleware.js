const adminMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.session.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }

    next();
};

module.exports = adminMiddleware; 