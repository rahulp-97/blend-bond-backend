const mongoose = require("mongoose");
const ConnectionRequest = require("../../models/connectionRequest");
const { messages, errorMessages } = require("../../utils/messages");

// /user/connections

const getConnections = async (req, res) => {
    try {
        const loggedInUser = req.user;
        const loggedInUserId = loggedInUser?._id?.toString();

        const userConnectionsArr = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUserId, status: "accepted" },
                { toUserId: loggedInUserId, status: "accepted" }
            ]
        }).populate("fromUserId", ["firstName", "lastName", "age", "gender", "photoUrl", "hobbies", "about"]).populate("toUserId", ["firstName", "lastName", "age", "gender", "photoUrl", "hobbies", "about"]);

        if (userConnectionsArr?.length === 0) {
            return res.json({
                status: "success",
                message: messages?.noConnections,
                data: []
            })
        };

        const userConnections = userConnectionsArr?.map(connection => {
            const fromUserId = connection?.fromUserId?._id?.toString();
            if (loggedInUserId === fromUserId) {
                const { _id, firstName, lastName, age, gender, photoUrl, hobbies, about } = connection?.toUserId;
                return { userId: _id?.toString(), firstName, lastName, age, gender, photoUrl, hobbies, about };
            } else {
                const { _id, firstName, lastName, age, gender, photoUrl, hobbies, about } = connection?.fromUserId;
                return { userId: _id?.toString(), firstName, lastName, age, gender, photoUrl, hobbies, about };
            }
        });

        return res.json({
            status: "success",
            message: messages?.getConnections,
            data: userConnections
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error?.message || error?.error
        });
    }
};

module.exports = getConnections;