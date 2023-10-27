const express = require("express");
const app = express();
const http = require("http");
const { Server } = require('socket.io');
const cors = require('cors');
app.use(cors({
    origin: "http://localhost:5173", // Allow requests from the frontend
    methods: ["GET", "POST"]
}));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Set the same origin for Socket.IO
        methods: ["GET", "POST"]
    }
});


//FIXME:ADDED user log when user leaves room it will show on everyone screen, like a feed, currently only shows on that persons feed not other, nvm it shows undefined has left room instead of username too
    //SHOW on dom for 5 seconds when user enters or leaves currentRoom

// TODO:
//organize, seperate functions and emits to seperate files

//TODO:POCKET BASE RELATED
//DONT DELETE, if user has same id as message, message will b on right like phone
//if from someone else displaay on left side,
//user leave or join logs will b on center (emit.to room)
//add users list to whoeveres in the room.
//on sendmessage(), send socket it, but i need to get it first on join room function or page load.
//HIDE MESSAGES SCROLL BAR

io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
    displaymsg(socket);
    
    let currentRoom = null; //INITIAL STATE OF ROOM USER IS IN


    //JOIN ROOM
    socket.on("joinroom", (room) => {
        socket.join(room);
        currentRoom = room;
    });
    //EXIT ROOM
    socket.on("exitRoom", ({username}) => {
        socket.leave(currentRoom);
        socket.emit("leaveChat", username);
        currentRoom = null;
    });

});

function displaymsg(socket) {
    socket.on('chatmsg', ({ message,username }) => {
        // Get the room(s) the user is in
        const userRooms = Array.from(socket.rooms);
        // send the message to everyone in current room (including sender)
        const socketID = socket.id;
        socket.nsp.to(userRooms[1]).emit('chatmsg', {message,username, socketID});
    })

}


server.listen(3000, () => {
    console.log("Server listening port 3000");
});
