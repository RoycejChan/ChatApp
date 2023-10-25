const express = require("express");
const app = express();
const http = require("http");
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors({
    origin: "http://localhost:5174", // Allow requests from the frontend
    methods: ["GET", "POST"]
}));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5174", // Set the same origin for Socket.IO
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
    displaymsg(socket);

    socket.on("joinroom", (room) => {
        socket.join(room);
        console.log(`${socket.id} joined ${room}`);
    });
    socket.on("leaveroom", (room) => {
        socket.leave(room);
        console.log(`${socket.id} left ${room}`);
    });

});

function displaymsg(socket) {
    socket.on('chatmsg', (message) => {
        // Get the room(s) the user is in
        const userRooms = Array.from(socket.rooms);

        console.log(`User in rooms: ${userRooms.join(', ')}`);
        console.log(`Received message from ${socket.id}: ${message}`);

        // Broadcast the message to everyone in current room (including sender)
        socket.nsp.to(userRooms[1]).emit('chatmsg', message);
    })
}


server.listen(3000, () => {
    console.log("Server listening port 3000");
});
