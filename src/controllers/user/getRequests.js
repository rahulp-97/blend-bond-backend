const mongoose = require("mongoose");
const ConnectionRequest = require("../../models/connectionRequest");
const { errorMessages, messages } = require("../../utils/messages");

// user/requests/received
const getRequests = async (req, res) => {
    try {
        const loggedinUser = req.user;
        const loggedinUserId = loggedinUser?._id?.toString();

        const connectionRequestsArr = await ConnectionRequest.find({
            toUserId: loggedinUserId,
            status: "interested"
        }).populate("fromUserId", ["firstName", "lastName", "age", "gender", "photoUrl", "hobbies", "about"]);

        if (connectionRequestsArr?.length === 0) {
            return res.json({
                status: "success",
                message: messages?.noRequests,
                data: []
            })
        };

        const connectionRequests = connectionRequestsArr?.map(requestUser => {
            const reqId = requestUser?._id?.toString();
            const { _id, firstName, lastName, age, gender, photoUrl, hobbies, about } = requestUser?.fromUserId;
            return { reqId, userId: _id?.toString(), firstName, lastName, age, gender, photoUrl, hobbies, about };
        });

        return res.json({
            status: "success",
            message: messages?.getRequests,
            data: connectionRequests
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error?.message || error?.error
        });
    }
};

module.exports = { getRequests };