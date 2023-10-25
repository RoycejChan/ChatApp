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

//DONE TODOS
// -- HIDE MESSAGEINPUT MAKE USER NOT BE ABLE TO TYPE A MESSAGE UNTIL A ROOM IS ENTERED. 
// --WHEN USER ENTERES ANOTHER ROOM, LEAVE BUTTON WILL BE TIED TO CURRENT ROOM AND CLICKING IT WILL LEAVE CURRENT ROOM WITHOUT HAVINGTO INPUT ROOM NUMBER
// --IF USER ENTERS ANOTHER ROOM, USER = LEAVE CURRENT ROOM, ENTER NEW ROOM && , IF USER LEAVES ROOM WITHOUT JOINING, set currentRoom = null
// -- USER HAS TO ENTER ROOM NUMBER TO JOIN CHAT ROOM
// DELETE CURRENT ROOM MESSAGES WHEN ENTERING NEW ONE
//IF USER TRIES TO ENTER ROOM THEY ARE ALREADY IN, return


// TODO:
//UPDATE MESSAGES TO CURENT ROOM WHEN SWITCHING ROOMS
//SHOW on dom for 5 seconds when user enters or leaves currentRoom
//DELETE messages only if they were the sender
//DELETE html inputs everytime user switches, leaves, or join room



io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
    displaymsg(socket);

    let currentRoom = null; //INITIAL STATE OF ROOM USER IS IN
    socket.on("joinroom", (room) => {


        if (currentRoom == room) {
            console.log("you are already in this room")
            return;
        }else if(currentRoom) {
            socket.emit("updateUI", (currentRoom));
            socket.leave(currentRoom);
            console.log(`${socket.id} left ${currentRoom}`);
        } 
        
        socket.join(room);
        currentRoom = room;
        console.log(`${socket.id} joined ${room}`);
    });


    socket.on("leaveroom", () => {
        socket.leave(currentRoom);
        socket.emit("leaveChat");
        console.log(`${socket.id} left ${currentRoom}`)
        currentRoom = null;
    });

});

function displaymsg(socket) {
    socket.on('chatmsg', (message) => {
        // Get the room(s) the user is in
        const userRooms = Array.from(socket.rooms);

        console.log(`User in rooms: ${userRooms.join(', ')}`);
        console.log(`Received message from ${socket.id}: ${message}`);

        // send the message to everyone in current room (including sender)
        socket.nsp.to(userRooms[1]).emit('chatmsg', message);
    })
}


server.listen(3000, () => {
    console.log("Server listening port 3000");
});
