const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { errorMessages, messages } = require("../utils/messages");


const userAuth = async (req, res, next) => {
    try {
        if (!req.cookies?.token) {
            return res.status(401).json({
                status: "error",
                message: errorMessages?.noToken,
                data: "unauthorized"
            })
        };

        const { token } = req.cookies;
        const decodedTokenValue = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decodedTokenValue?.id;

        if (!userId) {
            return res.status(400).json({
                status: "error",
                message: errorMessages?.inValidTokenValue
            })
        };

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: errorMessages?.authUserNotFound
            })
        };

        req.user = user;
        next();

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `${errorMessages?.authUserNotFound} ${error?.message || error?.error}`,
        })
    }
};

module.exports = {
    userAuth
};