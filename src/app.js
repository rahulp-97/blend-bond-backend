require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/connectDB");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/userAuth");
const { errorMessages, messages } = require("./utils/messages");
const { default: mongoose } = require("mongoose");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const emailRouter = require("./routes/email");

const app = express();

const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:5173"], // Allowed origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow cookies to be sent with requests
};

app.use(cors(corsOptions));
// built-in middlewares to parse the incoming request payloads based on the payload data type:
app.use(express.json());
app.use(cookieParser());


app.use(authRouter);
app.use("/profile", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);
app.use("/email", emailRouter);

// TO-DO move to suitable router based on frontend functionality:

app.get("/user/:emailId", async (req, res) => {
    try {
        if (!req.params?.emailId.trim()) {
            return res.status(400).json({
                status: "error",
                message: "Email id is required."
            })
        };
        const { emailId } = req.params;
        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found."
            });
        }
        const userData = {
            firstName: user?.firstName,
            lastName: user?.lastName,
            emailId: user?.emailId,
            age: user?.age,
            gender: user?.gender
        };
        return res.json({
            status: "success",
            message: "user fetched successfully.",
            data: userData
        });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({
            status: "error",
            message: err?.message || "Internal server error"
        });
    }
});


connectDB().then(() => {
    app.listen(8000, () => {
        console.log("server is running on 8000", "http://localhost:8000");
    });
});