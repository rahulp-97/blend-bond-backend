const express = require("express");
const { userAuth } = require("../middlewares/userAuth");
const { errorMessages, messages } = require("../utils/messages");
const { default: mongoose } = require("mongoose");
const { validateAllowedFields, isEmptyObj, validateUpdateProfileData } = require("../utils/utils");
const User = require("../models/user");

const router = express.Router();

// GET / pofile
// private route
router.get('/', userAuth, async (req, res) => {
    try {
        if (!req?.user) {
            return res.status(404).json({
                status: "error",
                message: errorMessages?.noToken,
            })
        }
        const { user } = req;

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

        return res.json({
            status: "success",
            message: messages?.getProfileSucceed,
            data: userData
        });
    } catch (error) {
        res.json({
            status: "error",
            message: `${errorMessages?.fetchProfileError} ${error?.message || error?.error}`,
        });
    }
});

router.patch("/edit", userAuth, async (req, res) => {
    try {
        const data = req.body;
        const reqUser = req.user;
        const userId = reqUser?._id?.toString();
        if (!userId.trim() || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: "error",
                message: errorMessages.invaldUserIdToUpdate
            });
        };
        if (isEmptyObj(data) || !data) {
            return res.status(400).json({
                status: "error",
                message: errorMessages.invaldUserDataToUpdate
            });
        };

        const isAllowedToUpdate = validateAllowedFields(data);
        if (!isAllowedToUpdate) {
            throw new Error(errorMessages?.updateNotAllowed);
        };

        const inputFieldErrors = validateUpdateProfileData(data);
        if(inputFieldErrors?.length > 0) {
            return res.status(400).json({
                status: "error",
                message: inputFieldErrors?.join(" ")
            })
        };

        const userData = {
            firstName: data?.firstName,
            lastName: data?.lastName,
            age: data?.age,
            gender: data?.gender,
            photoUrl: data?.photoUrl,
            about: data?.about,
            hobbies: data?.hobbies
        };

        await User.findByIdAndUpdate({ _id: userId }, userData, {
            runValidators: true,
        });
        return res.json({
            status: "success",
            message: messages?.updatedUser
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: `${errorMessages?.failedToUpdateUser}, ${err?.message || err?.error || err}`
        })
    }
});

module.exports = router;