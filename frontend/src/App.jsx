import React, { useState, useEffect } from 'react';
import io from "socket.io-client";

const socket = io.connect("http://localhost:3000");

function App() {
  const [message, setMessage] = useState(''); // State to store the message
  const [room, setRoom] = useState(0); // room user is in
  // listens to server for 'chatmsg'
  socket.on('chatmsg', (msg) => {
      console.log("YOOOO")
      const msglist = document.getElementById("msglist");
      const inputmsg = document.createElement('li');
      inputmsg.textContent = msg;
      msglist.appendChild(inputmsg);
    });
// TODO:

    // send message to server
  const sendMessage = () => {
    socket.emit('chatmsg', message);
  };
    //join room 
  const joinroom = (room) => {
    socket.emit("joinroom", room);
  };
  //leave room
  const leaveroom = (room) => {
    socket.emit("leaveroom", room);
  };
  return (
    <>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>Send Message</button>
      

      {/* MESSAGES CONTAINER */}
      <ul id="msglist">

      </ul>



      <input type="number"
      onChange={(e) => setRoom(e.target.value)}
      />
      <button onClick={()=>joinroom(room)}>join room</button>
      <button onClick={()=>leaveroom(room)}>leave room</button>

      
    </>
    
  );
}

export default App;
