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
//10/25//2023
//DONE TODOS
// -- HIDE MESSAGEINPUT MAKE USER NOT BE ABLE TO TYPE A MESSAGE UNTIL A ROOM IS ENTERED. 
// --WHEN USER ENTERES ANOTHER ROOM, LEAVE BUTTON WILL BE TIED TO CURRENT ROOM AND CLICKING IT WILL LEAVE CURRENT ROOM WITHOUT HAVINGTO INPUT ROOM NUMBER
// --IF USER ENTERS ANOTHER ROOM, USER = LEAVE CURRENT ROOM, ENTER NEW ROOM && , IF USER LEAVES ROOM WITHOUT JOINING, set currentRoom = null
// -- USER HAS TO ENTER ROOM NUMBER TO JOIN CHAT ROOM
// DELETE CURRENT ROOM MESSAGES WHEN ENTERING NEW ONE
//IF USER TRIES TO ENTER ROOM THEY ARE ALREADY IN, return
//DELETE html inputs everytime user switches, leaves, or join room
//INCLUDE USERNAME FOR USER TO JOIN CHAT
//TIE USERNAME TO MESSAGE SENT
//added useeffect to react on even listeners bc socket.io declared multiple socket connections and display li tags multiple times.

//CHANGE LEEAVE CHROOM TO LEAVE CHAT ROOM
//FIXME:ADDED user log when user leaves room it will show on everyone screen, like a feed, currently only shows on that persons feed not other, nvm it shows undefined has left room instead of username too
    //SHOW on dom for 5 seconds when user enters or leaves currentRoom
//FIXME: ERROR <p> message if user doesnt enter login input


// TODO:
//UPDATE MESSAGES TO CURENT ROOM WHEN SWITCHING ROOMS
//DELETE messages only if they were the sender
//INCLUDE POCKET BASE FOR USER NAME AND MESSAGES ?
//ADD CSS


io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
    displaymsg(socket);
    
    let currentRoom = null; //INITIAL STATE OF ROOM USER IS IN
    socket.on("joinroom", (room) => {


        if (currentRoom == room) {
            console.log("you are already in this room")
            return;
        }else if(currentRoom) {
            //LEAVE CURRENT ROOM
            socket.emit("changeRoom", (currentRoom));
            socket.leave(currentRoom);
            console.log(`${socket.id} left ${currentRoom}`);
        } 
            //JOIN NEW ROOM
        socket.join(room);
        currentRoom = room;
        console.log(`${socket.id} joined ${room}`);
    });


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
        console.log(username);
        console.log(`Received message from ${username}: ${message}`);

        // send the message to everyone in current room (including sender)
        socket.nsp.to(userRooms[1]).emit('chatmsg', { message,username });
    })
}


server.listen(3000, () => {
    console.log("Server listening port 3000");
});
