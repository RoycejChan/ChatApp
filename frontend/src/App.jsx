import React, { useState, useEffect } from 'react';
import io from "socket.io-client";

const socket = io.connect("http://localhost:3000");

function App() {
  const [message, setMessage] = useState(''); // State to store the message
  const [room, setRoom] = useState(0); // room user is in
  const [userActive, setUser] = useState(false);
  const [username, setUsername] = useState("");

//DISPLAYS MESSAGE W/USERNAME TO THE DOM
  socket.on('chatmsg', ({ message, username }) => {
    if (message  != "" ) {
        const msglist = document.getElementById("msglist");
        const inputmsg = document.createElement('li');
        inputmsg.textContent = `${message} from ${username}`;
        msglist.appendChild(inputmsg);
                // Add an onclick event to the li element
        inputmsg.onclick = () => {
            console.log(`You clicked: ${message}`);
        }      
    } else {
      console.log("please enter a message")
    }
});


//EMPTY UI WHEN USER LEAVES ENTIRE CHAT APP
socket.on('leaveChat', () => {
  console.log("You have left the chat room app")
  const msglist = document.getElementById("msglist");
  setMessage("");
  setRoom("");
  setUser(false);
})
//CHANGE ROOM USER IS IN
//UPDATE UI TO CURRENT CHAT APP TODO:
socket.on('changeRoom', () => {
    console.log("Changed UIS to current room")
    const msglist = document.getElementById("msglist");
    msglist.innerHTML = ""
    setMessage("");
    setRoom("");
  })
    // send message to server
  const sendMessage = () => {
    socket.emit('chatmsg', {message,username});
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
          {/* DISPLAY APP ONLY WHEN USER ENTERS ROOM */}
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
          {/* END CONDITIONAL RENDER */}


    {/* USER INPUTS FOR NAVIGATING THROUGH  */}

      <input type="string"
      onChange={(e) => setUsername(e.target.value)}
      value={username}
      />

      <input type="number"
      onChange={(e) => setRoom(e.target.value)}
      className='userInputs'
      value={room}
      />
      <button onClick={()=>joinroom(room)}>join room</button>
      <button onClick={()=>leaveroom()}>leave room</button>
    {/* END USE NAVIGATION */}

      {/* CHAT MESSAGES  */}
      <p className='userLogs'></p>
      
    </>
    
  );
}

export default App;
