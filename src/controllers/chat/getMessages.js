const Chat = require("../../models/chat");

const getMessages = async (req, res) => {
    try {
        if (!req.params?.targetUserId) {
            return res.status(404).json({
                status: "error",
                message: "no end user found."
            });
        };
        const { targetUserId } = req?.params;
        const userId = req?.user?._id;
        if (targetUserId?.toString() === userId?.toString()) {
            return res.status(400).json({
                status: "error",
                message: "sender and reciever can not be the same user."
            });
        };
        let chat = await Chat.findOne({
            participants: {
                $all: [userId, targetUserId]
            }
        }).populate({
            path: "messages.senderId",
            select: "firstName lastName"
        });
        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: []
            });
            await chat.save();
        }

        return res.json({
            status: "success",
            data: chat
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error?.message || error
        })
    }
};


module.exports = getMessages;