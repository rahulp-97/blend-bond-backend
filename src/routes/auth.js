const express = require("express");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { randomInt } = require("crypto");
const { validateSigninData, getHashedPasswrd, validateSignupData, sendEmailTemplate, validateVerifyData } = require("../utils/utils");
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
            isVerified: user?.isVerified,
            age: user?.age,
            gender: user?.gender,
            hobbies: user?.hobbies,
            photoUrl: user?.photoUrl,
            about: user?.about
        };

        if (!user?.isVerified) {
            const otp = String(randomInt(100000, 1000000));
            user.otp = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000;

            const savedUser = await user.save();
            const responseData = {
                firstName: savedUser?.firstName,
                lastName: savedUser?.lastName,
                emailId: savedUser?.emailId,
                age: savedUser?.age,
                isVerified: savedUser?.isVerified,
                gender: savedUser?.gender,
                hobbies: savedUser?.hobbies,
                photoUrl: savedUser?.photoUrl,
                about: savedUser?.about
            };

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // use false for STARTTLS; true for SSL on port 465
                auth: {
                    user: process.env?.NODE_MAILER_GMAIL_SENDER,
                    pass: process.env?.GMAIL_APP_PASS,
                }
            });

            const emailTemplate = sendEmailTemplate(otp, responseData?.firstName);

            const mailOptions = {
                from: process.env?.NODE_MAILER_GMAIL_SENDER,
                to: emailId,
                subject: 'Account verification | Blend Bond',
                html: emailTemplate
            };

            // // SEND verification email:
            const info = await transporter.sendMail(mailOptions);

            return res.status(200).json({
                status: "success",
                message: "Please verify your account.",
                verificationStatus: `unverified | ${info?.response}`,
                data: responseData
            });
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
        const otp = String(randomInt(100000, 1000000));

        const userData = {
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            otp,
            otpExpires: Date.now() + 10 * 60 * 1000,
            age: ageNumber,
            gender,
            photoUrl,
            about,
            hobbies
        };

        // Save unverified user with otp & its expiry:
        const user = new User(userData);
        const savedUser = await user.save();

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // use false for STARTTLS; true for SSL on port 465
            auth: {
                user: process.env?.NODE_MAILER_GMAIL_SENDER,
                pass: process.env?.GMAIL_APP_PASS,
            }
        });

        const emailTemplate = sendEmailTemplate(otp, savedUser?.firstName);

        const mailOptions = {
            from: process.env?.NODE_MAILER_GMAIL_SENDER,
            to: emailId,
            subject: 'Account verification | Blend Bond',
            html: emailTemplate
        };

        // // SEND verification email:
        const info = await transporter.sendMail(mailOptions);

        // const token = await user?.getJWT();

        // res.cookie("token", token, {
        //     maxAge: 60 * 60 * 1000
        // });

        const responseData = {
            firstName: savedUser?.firstName,
            lastName: savedUser?.lastName,
            emailId: savedUser?.emailId,
            age: savedUser?.age,
            isVerified: savedUser?.isVerified,
            gender: savedUser?.gender,
            hobbies: savedUser?.hobbies,
            photoUrl: savedUser?.photoUrl,
            about: savedUser?.about
        };

        return res.json({
            status: "success",
            message: messages?.registrationSucceed,
            verification: info?.response,
            data: responseData,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: `Registration failed, ${err?.message || err?.error || err}`
        });
    }
});

// POST /verify
// @protected
router.post("/verify", async (req, res) => {
    try {
        const validationErrors = validateVerifyData(req.body);
        if (validationErrors?.length > 0) {
            return res.status(400).json({
                status: "error",
                message: validationErrors?.join(" ")
            })
        }
        const { emailId, otp } = req.body;
        const trimmedOtp = otp?.trim();

        const userExists = await User.findOne({ emailId });
        if (!userExists) {
            return res.status(404).json({
                status: "error",
                message: "Please register yourself first!",
                verificationStatus: "nouser"
            })
        };
        if (userExists?.isVerified) {
            return res.status(400).json({
                status: "error",
                message: "You have already a verified account, Please login.",
                verificationStatus: "verified"
            })
        };
        if (userExists?.otp !== trimmedOtp) {
            return res.status(400).json({
                status: "error",
                message: "Invalid OTP!",
                verificationStatus: "invalidotp"
            })
        };
        if (Date.now() > userExists.otpExpires) {
            return res.status(400).json({
                status: "error",
                message: "Your OTP is expired!",
                verificationStatus: "expiredotp"
            })
        };

        userExists.isVerified = true;
        userExists.otp = undefined;
        userExists.otpExpires = undefined;
        await userExists.save();

        const responseData = {
            firstName: userExists?.firstName,
            lastName: userExists?.lastName,
            emailId: userExists?.emailId,
            age: userExists?.age,
            isVerified: userExists?.isVerified,
            gender: userExists?.gender,
            hobbies: userExists?.hobbies,
            photoUrl: userExists?.photoUrl,
            about: userExists?.about
        };

        const token = await userExists?.getJWT();
        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000
        });


        return res.status(200).json({
            status: "success",
            message: "Verification successfull.",
            data: responseData
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `There is an error while verifying you, Please try again later. ${error?.message || error?.error}`
        })
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