const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "sender id is required"],
    },
    text: {
        type: String,
        required: [true, "message text is required"],
    }
}, {
    timestamps: true
});

const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "user id is required"]
        }
    ],
    messages: [messageSchema]
});

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;