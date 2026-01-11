require("dotenv").config();
const http = require("http");
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
const chatRouter = require("./routes/chat");
const initializeSocket = require("./utils/sockets");


const app = express();
const server = http.createServer(app);

initializeSocket(server);

const PORT = process.env.PORT || 8000;
const allowedOrigin = process.env.NODE_ENV === "production" ? process.env.FRONTEND_PROD_URL : [process.env.FRONTEND_DEV_URL1, process.env.FRONTEND_DEV_URL2];

const corsOptions = {
    origin:  allowedOrigin, // Allowed origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow cookies to be sent with requests
};

app.use(cors(corsOptions));
// built-in middlewares to parse the incoming request payloads based on the payload data type:
app.use(express.json());
app.use(cookieParser());

// TO-DO: schedule cron jobs- send Emails weekly:
// require("./utils/cronjobs");


app.use(authRouter);
app.use("/profile", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);
app.use("/email", emailRouter);
app.use("/chat", chatRouter);

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
    server.listen(PORT, () => {
        console.log(`server is running on ${PORT}`)
    })
}).catch((err) => {
    console.log(`Error while connecting to DB: ${err?.error || err?.message}`)
});