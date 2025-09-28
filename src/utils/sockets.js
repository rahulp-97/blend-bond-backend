const socket = require('socket.io');
const crypto = require("crypto");


// TODO: secure room id
function getSecretRoomId ({ userId, targetUserId }) {
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

        socket.on("sendMessage", ({ firstName, userId, targetUserId, text, time }) => {
            const room = getSecretRoomId({ userId, targetUserId });

            io.to(room).emit("messageReceived", { firstName, text, time });
        });

        socket.on("disconnect", () => { });
    });
};

module.exports = initializeSocket;