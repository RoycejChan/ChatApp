import React, { useState, useEffect } from 'react';
import io from "socket.io-client";
const ENDPOINT = "http://localhost:3000";

// Declare the socket globally
let socket = null;

function App() {
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState(0);
  const [userActive, setUser] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Initialize the socket connection
    socket = io(ENDPOINT);

                            
    //FUNCTIONS ONEFFECT

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

    socket.on('leaveChat', () => {
      console.log("You have left the chat room app");
      const msglist = document.getElementById("msglist");
      setMessage("");
      setRoom("");
      setUser(false);
    });

    socket.on('changeRoom', () => {
      console.log("Changed UI to current room");
      const msglist = document.getElementById("msglist");
      msglist.innerHTML = "";
      setMessage("");
      setRoom("");
    });

    //END FUNCTIONS

    // Clean up by removing event listeners when the component unmounts
    return () => {
      socket.off("connect");
      socket.off('chatmsg');
      socket.off('leaveChat');
      socket.off('changeRoom');
    };
  }, []);

  const sendMessage = () => {
    socket.emit('chatmsg', { message, username });
  };

  const joinroom = (room) => {
    if (room === 0) {
      console.log("Please enter a room");
      return;
    } else {
      socket.emit("joinroom", room);
      setUser(true);
    }
  };

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
