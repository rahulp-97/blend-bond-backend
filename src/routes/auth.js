const express = require("express");
const bcrypt = require("bcrypt");
const { validateSigninData, getHashedPasswrd, validateSignupData } = require("../utils/utils");
const User = require("../models/user");
const { errorMessages, messages } = require("../utils/messages");

const router = express.Router();

// POST /login
// @public
router.post("/login", async (req, res) => {
    try {
        const validationErrors = validateSigninData(req.body);
        if (validationErrors?.length > 0) {
            return res.status(400).json({
                status: "error",
                message: validationErrors?.join(" ")
            })
        };
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: errorMessages?.userNotFound
            })
        };

        const isCorrectPassword = await bcrypt.compare(password, user?.password);

        if (!isCorrectPassword) {
            return res.status(400).json({
                status: "error",
                message: errorMessages?.incorrectPassword
            })
        };

        const userData = {
            firstName: user?.firstName,
            lastName: user?.lastName,
            emailId: user?.emailId,
            age: user?.age,
            gender: user?.gender,
            hobbies: user?.hobbies,
            photoUrl: user?.photoUrl,
            about: user?.about
        };
        // Handling below logic at userSchema level:
        // const token = await jwt.sign({ id: user?._id }, process.env.JWT_SECRET_KEY, {
        //     expiresIn: '1h'
        // });

        // this will refer to the current user & so generate it's jwt accordingly.
        const token = await user?.getJWT();

        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000
        });

        return res.json({
            status: "success",
            message: messages?.loggedin,
            data: userData
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `${errorMessages?.loginError} ${error?.message || error?.error || error}`
        });
    }
});

// POST /signup
// @public
router.post("/signup", async (req, res) => {
    try {
        const validationErrors = validateSignupData(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: "error",
                message: "Validation failed",
                errors: validationErrors?.join(" "),
            });
        };
        const { firstName, lastName, emailId, password, age, gender, photoUrl, about, hobbies } = req.body;

        const userExists = await User.findOne({ emailId });
        if (userExists) {
            return res.status(400).json({
                status: "error",
                message: errorMessages?.userExists
            })
        };

        const ageNumber = parseInt(age);

        const hashedPassword = await getHashedPasswrd(password);
        const userData = { firstName, lastName, emailId, password: hashedPassword, age: ageNumber, gender, photoUrl, about, hobbies };

        const user = new User(userData);
        const savedUser = await user.save();

        const token = await user?.getJWT();

        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000
        });

        const responseData = {
            firstName: savedUser?.firstName,
            lastName: savedUser?.lastName,
            emailId: savedUser?.emailId,
            age: savedUser?.age,
            gender: savedUser?.gender,
            hobbies: savedUser?.hobbies,
            photoUrl: savedUser?.photoUrl,
            about: savedUser?.about
        };

        return res.json({
            status: "success",
            message: messages?.registrationSucceed,
            data: responseData
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: `Registration failed, ${err?.message || err?.error || err}`
        });
    }
});

// GET /logout
// @public
router.get("/logout", async (req, res) => {
    try {
        res.cookie("token", null, {
            httpOnly: true,
            expires: new Date(0)
        });
        return res.status(200).json({
            status: "success",
            message: messages?.loggedOut
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `${errorMessages?.logoutError} ${error?.message || error?.error}`
        })
    }
});

module.exports = router;