const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const { images } = require("../assets/images");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        minlength: [2, "First name must be at least 2 characters long"],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        minlength: [2, "Last name must be at least 2 characters long"],
        trim: true,
    },
    emailId: {
        type: String,
        required: [true, "Email ID is required"],
        unique: true,
        lowercase: true,
        match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        validate(value) {
            if(!validator.isStrongPassword(value)) {
                throw new Error("Please enter the strong password.");
            }
        }
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [16, "Age cannot be less than 16"],
        max: [100, "Age cannot be more than 100"],
    },
    gender: {
        type: String,
        required: [true, "gender is required"],
        enum: ["male", "female"],
    },
    photoUrl: {
        type: String,
        default: function () {
            if(this.gender === "male") {
                return images?.malePhotoUrl
            } else {
                return images?.femalePhotoUrl
            }
        },
    },
    about: {
        type: String,
        default: "",
        maxLength: [100, "About can't be more than 100 characters."],
    },
    hobbies: {
        type: [String],
        validate: {
            validator: function (value) {
                return value.length <=10;
            },
            message: "You can add a maximum of 10 hobbies."
        }
    },
}, {
    timestamps: true,
});

// indexing DB for efficient querring, We already have indexed emailId field by providing "required: true", So "index: true" becomes optional.
userSchema.index({ firstName: 1, lastName: 1 });

userSchema.methods.getJWT = async function() {
    const token = await jwt.sign({id: this._id}, process.env.JWT_SECRET_KEY);
    return token;
};

const User = model("User", userSchema);
module.exports = User;