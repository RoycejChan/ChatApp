const express = require("express");
const app = express();
const http = require("http");
const { Server } = require('socket.io');
const cors = require('cors');
// Initialize the Express app and configure CORS
app.use(cors({
    origin: "http://localhost:5173", // Allow requests from the frontend
    methods: ["GET", "POST"]
}));

// Create an HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Set the same origin for Socket.IO
        methods: ["GET", "POST"]
    }
});
// Handle new client connections
io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);

    let currentRoom = null; // Initialize user's current room

    const socketID = socket.id;

    // Function to handle displaying chat messages
    displaymsg(socket);

    
    let rooms = []

    // Handle joining a room and return user's unique socketID
    socket.on("joinroom", ({ username, room}) => {

        socket.join(room);
        currentRoom = room;
        io.to(room).emit("joinLog", ({ username }));

        const newUser = {
            "username": username,
            "room": room,
            "socketID": socketID
        }
        rooms.push(newUser);
        // Send the user's socketID to them
        socket.emit('socketID', socketID);
    });

    // Handle exiting a room
    socket.on("exitRoom", ({ username, room }) => {
        // Emit a message to inform everyone in the room about the user's exit
        io.to(currentRoom).emit("exitLog", { username });
        console.log(rooms);
        // Leave the room
        socket.leave(currentRoom);
        currentRoom = null;
    });
});

// Function to display chat messages
function displaymsg(socket) {
    socket.on('chatmsg', ({ message, username, room, userID }) => {
        // Get the room(s) the user is in
        const userRooms = Array.from(socket.rooms);

        // Send the message to everyone in the current room (including sender)
        socket.nsp.to(userRooms[1]).emit('chatmsg', { message, username, room, userID });
    });
}

// Start the server on port 3000
server.listen(3000, () => {
    console.log("Server listening on port 3000");
});
