const mongoose = require("mongoose");
const ConnectionRequest = require("../../models/connectionRequest");
const { errorMessages, messages } = require("../../utils/messages");
const { isEmpty } = require("validator");
const { isEmptyObj } = require("../../utils/utils");
const User = require("../../models/user");

const sendRequest = async (req, res) => {
    try {
        const fromUserId = req.user?._id?.toString();
        const { toUserId, status } = req?.params;
        const allowedStatus = ["interested", "ignored"];
        const isValidReqStatus = allowedStatus?.includes(status);

        if (!toUserId || typeof toUserId !== 'string' || !mongoose.Types.ObjectId.isValid(toUserId)) {
            return res.status(404).json({
                status: "error",
                message: errorMessages?.toUserNotFound
            });
        };

        if (!status || typeof status !== 'string' || !isValidReqStatus) {
            return res.status(400).json({
                status: "error",
                message: errorMessages?.inValidRequestStatusType
            });
        };

        if(fromUserId === toUserId) {
            return res.status(400).json({
                status: "error",
                message: errorMessages?.sameToAndFromUsers
            });
        };

        const receiverExists = await User.findById(toUserId);
        if(!receiverExists) {
            return res.status(404).json({
                status: "error",
                message: errorMessages?.toUserNotFound
            })
        };

        const requestExists = await ConnectionRequest.find({
            $or: [{
                fromUserId,
                toUserId
            }, {
                fromUserId: toUserId,
                toUserId: fromUserId
            }]
        });

        if (requestExists && !isEmptyObj(requestExists)) {
            return res.status(400).json({
                status: "error",
                message: errorMessages?.requestExists
            })
        };

        const sendReqObj = {
            fromUserId,
            toUserId,
            status
        };

        const request = new ConnectionRequest(sendReqObj);
        await request.save();

        return res.json({
            status: "success",
            message: `${messages?.connectionRequestSent} ${receiverExists?.firstName}`,
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `${errorMessages?.sendRequestError} ${error?.message || error?.error}`
        })
    }
};

module.exports = { sendRequest };