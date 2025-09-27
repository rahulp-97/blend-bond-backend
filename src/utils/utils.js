const validator = require("validator");
const bcrypt = require("bcrypt");

module.exports.isEmptyObj = (obj) => {
    return obj === undefined || obj === null || Object.keys(obj)?.length === 0;
};

module.exports.sendEmailValidation = (data) => {
    const errors = [];
    if (!data?.toEmailId || typeof data?.toEmailId !== "string" || !/.+@.+\..+/.test(data?.toEmailId)) {
        errors.push("A valid email ID is required.");
    }

    return errors;
}

module.exports.ALLOWED_FIELDS = ["userid", "firstname", "lastname", "age", "gender", "photourl", "about", "hobbies"];

module.exports.validateAllowedFields = (data) => {
    if (data?.gender) {
        if (data?.gender !== "male" && data?.gender !== "female") {
            return false;
        }
    };
    return Object.keys(data)?.every(field => this?.ALLOWED_FIELDS?.includes(field?.toLowerCase()));
};

module.exports.getUserData = (user) => {
    const userData = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        age: user?.age,
        gender: user?.gender,
        photoUrl: user?.photoUrl,
        about: user?.about,
        hobbies: user?.hobbies
    };
    return userData;
}

module.exports.getHashedPasswrd = async (password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
};

module.exports.validateUpdateProfileData = (data) => {
    const errors = [];

    // Check required fields
    if (!data?.firstName || typeof data?.firstName !== "string" || !data?.firstName.trim()) {
        errors.push("First name is required and must be a valid user input.");
    }

    if(data?.firstName.trim() && typeof data?.firstName == "string" && data?.firstName?.length < 2) {
        errors.push("First name must be atleast 2 characters.")
    }

    if (!data?.lastName || typeof data?.lastName !== "string" || !data?.lastName.trim()) {
        errors.push("Last name is required and must be a valid user input.");
    }

    if(data?.lastName.trim() && typeof data?.lastName == "string" && data?.lastName?.length < 2) {
        errors.push("Last name must be atleast 2 characters.")
    }

    if (!data?.age || typeof data?.age !== "number" || data?.age < 16 || data?.age > 100) {
        errors.push("Age is required.");
    }

    if (data?.age && data?.age < 16) {
        errors.push("You must be atleast 16 years old to register.");
    }

    if (data?.age && data?.age > 100) {
        errors.push("Please enter the valid age.");
    }

    if (!data?.gender || (data?.gender !== "male" && data?.gender !== "female")) {
        errors.push("Gender is required and must be either 'male' or 'female'.");
    }

    // Optional fields validation
    if (data?.hobbies && (!Array.isArray(data?.hobbies) || data?.hobbies.length > 10)) {
        errors.push("Hobbies must be a maximum of 10 items.");
    }

    if (data?.photoUrl && typeof data?.photoUrl !== "string") {
        errors.push("Photo URL must be a valid user input.");
    }

    if (data?.about && typeof data?.about !== "string") {
        errors.push("About must be a valid user input.");
    }

    return errors;
};

module.exports.validateSigninData = (data) => {
    const errors = [];
    if (!data?.emailId || typeof data?.emailId !== "string" || !/.+@.+\..+/.test(data?.emailId)) {
        errors.push("A valid email ID is required.");
    };

    if (!data?.password || !data?.password?.trim() || typeof data?.password !== "string" || data?.password?.trim()?.length < 6) {
        errors.push("Password is required and must be at least 6 characters long.");
    };

    return errors;
};

module.exports.validateSignupData = (data) => {
    const errors = [];

    // Check required fields
    if (!data?.firstName || typeof data?.firstName !== "string" || !data?.firstName.trim()) {
        errors.push("First name is required and must be a valid user input.");
    }

    if (!data?.lastName || typeof data?.lastName !== "string" || !data?.lastName.trim()) {
        errors.push("Last name is required and must be a valid user input.");
    }

    if (!data?.emailId || typeof data?.emailId !== "string" || !/.+@.+\..+/.test(data?.emailId)) {
        errors.push("A valid email ID is required.");
    }

    if (!data?.password || typeof data?.password !== "string" || data?.password.length < 6) {
        errors.push("Password is required and must be at least 6 characters long.");
    }

    if (data?.password && !validator.isStrongPassword(data?.password)) {
        errors.push("Please enter the strong password. It should contin minimum one capital letter, small letter & numeric character.");
    }

    if (!data?.age || parseInt(data?.age) < 16 || parseInt(data?.age) > 100) {
        errors.push("Age is required.");
    }

    if (data?.age && data?.age < 16) {
        errors.push("You must be atleast 16 years old to register.");
    }

    if (data?.age && data?.age > 100) {
        errors.push("Please enter the valid age.");
    }

    if (!data?.gender || (data?.gender !== "male" && data?.gender !== "female")) {
        errors.push("Gender is required and must be either 'male' or 'female'.");
    }

    // Optional fields validation
    if (data?.hobbies && (!Array.isArray(data?.hobbies) || data?.hobbies.length > 10)) {
        errors.push("Hobbies must be a maximum of 10 items.");
    }

    if (data?.photoUrl && typeof data?.photoUrl !== "string") {
        errors.push("Photo URL must be a valid user input.");
    }

    if (data?.about && typeof data?.about !== "string") {
        errors.push("About must be a valid user input.");
    }

    return errors;
};

module.exports.validateVerifyData = (data) => {
    const errors = [];

    if (!data?.emailId || typeof data?.emailId !== "string" || !/.+@.+\..+/.test(data?.emailId)) {
        errors.push("A valid email ID is required.");
    };

    const trimmedOtp = data?.otp?.trim();

    if(!trimmedOtp || !(trimmedOtp?.length === 6)) {
        errors.push("Please enter the valid otp");
    };

    return errors;
}

// send email template ui:
module.exports.sendEmailTemplate = (otp, firstName) => {
    return `
      <div style="
        max-width:500px;
        margin:0 auto;
        font-family:Arial,sans-serif;
        border:1px solid #ddd;
        border-radius:8px;
        overflow:hidden;">
        <div style="background:black;color:#fff;padding:16px;text-align:center;">
          <h2 style="margin:0;">Blend bond</h2>
        </div>
        <div style="padding:20px;">
          <p style="font-size:16px;color:#333;">Hi, ${firstName ? firstName : ''}</p>
          <p style="font-size:16px;color:#333;">Use the following code to verify your account:</p>
          <div style="
            font-size:28px;
            font-weight:bold;
            text-align:center;
            margin:20px 0;
            letter-spacing:4px;
            color:#4A90E2;">
            ${otp}
          </div>
          <p style="font-size:14px;color:#666;">This code will expire in 10 minutes.</p>
          <p style="font-size:14px;color:#666;">Thank you,<br>Blend bond Team</p>
        </div>
      </div>`
};