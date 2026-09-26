const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { hasActivePremium } = require('../utils/premium');
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

const optionalAuth = async (req, res, next) => {
    const bearerToken = req.header('Authorization')?.replace('Bearer ', '');
    const cookieToken = req.cookies?.token;
    const token = bearerToken || cookieToken;

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET.trim());
        req.user = await User.findById(decoded.userId).select('-password');
    } catch (error) {
        req.user = undefined;
    }

    next();
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

const premiumAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (!hasActivePremium(req.user)) {
                return res.status(402).json({
                    message: 'This feature is available on the Pro plan.',
                    code: 'PREMIUM_REQUIRED'
                });
            }
            next();
        });
    } catch (error) {
        res.status(401).json({ message: 'Authorization failed' });
    }
};

module.exports = { auth, optionalAuth, adminAuth, premiumAuth };