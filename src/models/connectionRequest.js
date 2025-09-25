// const mongoose = require("mongoose");
const { Schema, model, default: mongoose } = require("mongoose");

const connectionRequestSchema = new Schema({
    fromUserId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "missing request sender"],
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "missing request receiver"],
    },
    status: {
        type: String,
        required: [true, "missing request status"],
        enum: {
            values: ["interested", "ignored", "accepted", "rejected"],
            message: "incorrect status type"
        }
    }
}, {
    timestamps: true
});

// indexing DB for efficient querring
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// middleware for mongodb: before creating new request DB item, This middleware will be called.
connectionRequestSchema.pre("save", function() {
    if(this.fromUserId?.toString() === this.toUserId?.toString()) {
        throw new Error("Cannot send connection request to yourself.")
    }
});

const ConnectionRequest = model("ConnectionRequest", connectionRequestSchema);
module.exports = ConnectionRequest;