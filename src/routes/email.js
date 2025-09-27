const express = require("express");
const { Resend } = require("resend");
const nodemailer = require("nodemailer");
const { randomInt } = require("crypto");
const { sendEmailValidation, sendEmailTemplate } = require("../utils/utils");

const router = express.Router();

const resend = new Resend(process.env?.RESEND_API_KEY);

// using nodemailer:
router.post("/sendEmail", async (req, res) => {
    try {
        const validationErrors = sendEmailValidation(req.body);
        if (validationErrors?.length > 0) {
            return res.status(400).json({
                status: "error",
                message: validationErrors?.join(" ")
            })
        };

        const { toEmailId } = req.body;

        const otp = String(randomInt(100000, 1000000));
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // use false for STARTTLS; true for SSL on port 465
            auth: {
                user: process.env?.NODE_MAILER_GMAIL_SENDER,
                pass: process.env?.GMAIL_APP_PASS,
            }
        });

        const emailTemplate = sendEmailTemplate(otp);

        const mailOptions = {
            from: process.env?.NODE_MAILER_GMAIL_SENDER,
            to: toEmailId,
            subject: 'Account verification | Blend Bond',
            html: emailTemplate
        };

        const info = await transporter.sendMail(mailOptions);
        return res.json({
            status: "success",
            message: "email sent successfully.",
            data: info?.response
        });

    } catch (error) {
        return res.json({
            status: "error",
            message: `Error sending email: ${error?.message || error?.error || error}`,
        });
    }
});


// using RESEND service:

// router.post("/sendEmail", async (req, res) => {
//     try {
//         const validationErrors = sendEmailValidation(req.body);
//         if(validationErrors?.length > 0) {
//             return res.status(400).json({
//                 status: "error",
//                 message: validationErrors?.join(" ")
//             })
//         };

//         const { toEmailId } = req.body;

//         const otp = String(randomInt(100000, 1000000));

//         const { data, error } = await resend.emails.send({
//             from: "Acme <onboarding@resend.dev>",
//             to: [toEmailId],
//             subject: "Account verification | Blend Bond",
//             html: `<p>Please use this 6 digit code to verify yourself: <strong>${otp}</strong></p>`
//         });

//         if(error) {
//             return res.status(500).json({
//             status: "error",
//             error
//         })
//         };

//         return res.json({
//             status: "success",
//             message: "email sent successfully.",
//             data
//         })
//     } catch (error) {
//         res.status(500).json({
//             status: "error",
//             message: error?.message || error?.error || error
//         })
//     }
// });


module.exports = router;