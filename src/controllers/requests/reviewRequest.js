const mongoose = require("mongoose");
const ConnectionRequest = require("../../models/connectionRequest");
const { errorMessages, messages } = require("../../utils/messages");

// request/reviewRequest/:status/:requestId
const reviewRequest = async (req, res) => {
    try {
        const loggedinUser = req.user;
        const loggedinUserId = loggedinUser?._id?.toString();
        const { status, requestId } = req.params;
        const allowedStatus = ["accepted", "rejected"];
        const isValidStatus = allowedStatus?.includes(status);

        if (!status || !isValidStatus) {
            return res.status(400).json({
                status: "error",
                message: errorMessages?.inValidRequestStatusType
            });
        };
        if(!requestId || typeof requestId !== 'string' || !mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({
                status: "error",
                message: errorMessages?.invalidReqId
            });
        };

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedinUserId,
            status: "interested"
        });
        if(!connectionRequest) {
           return res.status(404).json({
                status: "error",
                message: errorMessages?.noRequestFound
            })
        };
        connectionRequest.status = status;
        await connectionRequest.save();

        const successMsg = messages?.connectionReqReviewed?.split(" | ");

        return res.json({
            status: "success",
            message: `${successMsg?.[0]} ${status} ${successMsg?.[1]}`
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `${error?.message || error?.error}`
        });
    }
};

module.exports = { reviewRequest };