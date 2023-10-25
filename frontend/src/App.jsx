import React, { useState, useEffect } from 'react';
import io from "socket.io-client";

const socket = io.connect("http://localhost:3000");

function App() {
  const [message, setMessage] = useState(''); // State to store the message
  const [room, setRoom] = useState(0); // room user is in
  const [userActive, setUser] = useState(false);
  // const usersInputs = document.getElementsByClassName('userInputs');


  
  // listens to server for 'chatmsg'
  socket.on('chatmsg', (msg) => {
    if (msg  != "" ) {
        const msglist = document.getElementById("msglist");
        const inputmsg = document.createElement('li');
        inputmsg.textContent = msg;
        msglist.appendChild(inputmsg);
                // Add an onclick event to the li element
        inputmsg.onclick = () => {
            console.log(`You clicked: ${msg}`);
        }      
    } else {
      console.log("please enter a message")
    }
});
//EMPTY UI WHEN USER LEAVES ENTIRE CHAT APP
socket.on('leaveChat', () => {
  console.log("You have left the chat room app")
  const msglist = document.getElementById("msglist");
  msglist.innerHTML = ""
})

//UPDATE UI TO CURRENT CHAT APP TODO:
socket.on('updateUI', () => {
    console.log("Changed UIS to current room")
    const msglist = document.getElementById("msglist");
    msglist.innerHTML = ""
  })
                                    // EMIT FUNCTIONS
    // send message to server
  const sendMessage = () => {
    socket.emit('chatmsg', message);
  };
    //join room, if user doesnt enter room number, don't auto join
  const joinroom = (room) => {
    if (room === 0) {
      console.log("Please enter a room")
      return;
    } else {
    socket.emit("joinroom", room);
    setUser(true);
    }
  };
  //leave room
  const leaveroom = () => {
    socket.emit("leaveroom", room);
  };



  return (
    <>
  
    {userActive ? 
    <div>
      <h1>WELCOME TO THE CHAT ROOM</h1>
      <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className='userInputs'
        />

        <button onClick={sendMessage}>Send Message</button>
        

        <ul id="msglist">

        </ul>
      </div> : <h1>JOIN A ROOM TO START CHATTING</h1>
    }




      <input type="number"
      onChange={(e) => setRoom(e.target.value)}
      className='userInputs'
      />
      <button onClick={()=>joinroom(room)}>join room</button>
      <button onClick={()=>leaveroom()}>leave room</button>
      <p className='userLogs'></p>
      
    </>
    
  );
}

export default App;
