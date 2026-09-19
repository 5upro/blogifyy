const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();
const auth = async (req, res, next) => {
    try {
        const bearerToken = req.header('Authorization')?.replace('Bearer ', '');
        const cookieToken = req.cookies?.token;
        const token = bearerToken || cookieToken;
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET.trim());
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Admin access required' });
            }
            next();
        });
    } catch (error) {
        res.status(401).json({ message: 'Authorization failed' });
    }
};

module.exports = { auth, adminAuth };