'use strict'

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const generateToken = userId => {
    return jwt.sign({ id: userId }, process.env.SECRET, {
        expiresIn: 86400 // expires in 24 hours
    });
}

const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, process.env.SECRET, (error, decoded) => {
            if (error) return next(error);
            User.findById(decoded.id, (error, user) => {
                if (!user) {
                    error = new Error("User not found");
                    error.status = 404;
                    return next(error);
                } else {
                    req.loggedInUser = user;
                    return next();
                }
            });
        });
    } else {
        const error = new Error("No access token");
        error.status = 401;
        return next(error);
    }
}

module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;
