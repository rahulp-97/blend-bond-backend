const socket = require('socket.io');
const crypto = require("crypto");
const Chat = require("../models/chat");


// TODO: secure room id
function getSecretRoomId({ userId, targetUserId }) {
    return crypto.createHash("sha256").update([userId, targetUserId].sort().join("_")).digest("hex");
};

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:5173"],
        }
    });

    io.on("connection", (socket) => {
        socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
            const room = getSecretRoomId({ userId, targetUserId });
            console.log(`${firstName} has joined the room: ${room}`);
            socket.join(room);
        });

        socket.on("sendMessage", async ({ firstName, userId, targetUserId, text, time }) => {
            try {
                const room = getSecretRoomId({ userId, targetUserId });

                let chat = await Chat.findOne({
                    participants: {
                        $all: [
                            userId,
                            targetUserId
                        ]
                    }
                });

                if (!chat) {
                    chat = new Chat({
                        participants: [ userId, targetUserId ],
                        messages: []
                    })
                } else {
                    chat.messages.push({
                        senderId: userId,
                        text
                    });
                }
                await chat.save();

                io.to(room).emit("messageReceived", { firstName, text, time });
            } catch (error) {
                console.error(error?.message || error);
            }
        });

        socket.on("disconnect", () => { });
    });
};

module.exports = initializeSocket;