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

let socketID = null;
// Handle new client connections
io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
    socketID = socket.id;
    // Function to handle displaying chat messages
    displaymsg(socket);

    

// On the server side
socket.on("createUser", ({ username, room }) => {
    const user = { 
        username: username, 
        socketID: socket.id,
        room: room,
     };
    socket.join(room);

    // Emit an update to all users in the room
    io.to(room).emit("joinLog", user);
});

// Handle exiting a room
socket.on("exitRoom", ({username, room}) => {
      const userLeft = {
        username: username,
        room: room,
    };
    io.to(room).emit("exitLog", userLeft); // Emit to the entire room
    socket.leave(room);

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
