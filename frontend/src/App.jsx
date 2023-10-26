import React, { useState, useEffect } from 'react';
import io from "socket.io-client";
const ENDPOINT = "http://localhost:3000";
const pbURL = "http://127.0.0.1:8090"
// Declare the socket globally
let socket = null;

function App() {
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState(0);
  const [userActive, setUser] = useState(false);
  const [username, setUsername] = useState("");
  const [userlog, setuserLog] =useState("");
  const [messages, setMessages] = useState([]);




  //FETCH MESSAGES FOR CHAT ROOM FROM POCKETBASE DB
  async function getMessages() {
    const res = await fetch(`${pbURL}/api/collections/chatroom/records?page=1&perPage=30`);  
    const data = await res.json();  
    return data && data.items;
  }


  //
  async function messageContainer() {
    const messages = await getMessages();
    console.log(messages);
    setMessages(messages);
  }

  
  useEffect(() => {
    // Initialize the socket connection
    socket = io(ENDPOINT);

          
    //FUNCTIONS ONEFFECT

    socket.on('chatmsg', ({ message, username }) => {
      if (message  != "" ) {
          messageContainer();
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

    


    socket.on('changeRoom', () => {
      console.log("Changed UI to current room");
      const msglist = document.getElementById("msglist");
      msglist.innerHTML = "";
      setMessage("");
      setRoom("");
    });
    socket.on('leaveChat', ({username}) => {
      console.log("You have left the chat room app");
      let log = `${username} has left the room`;
      setuserLog(log);
      setMessage("");
      setRoom("");
      setUser(false);
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

  const joinroom = (roomNumber) => {
    if (username == "") {
      console.log("Please enter a room");
      const errmsg = document.getElementById("login-error")
      errmsg.innerHTML = "Please enter a username";
      return;
    } else {
      setRoom(roomNumber)
      socket.emit("joinroom", roomNumber);
      setUser(true);
    }
  };

  const exitRoom = () => {
    socket.emit("exitRoom", ( {room, username}));
  };
  



  return (
    <>





     {/* DISPLAY APP ONLY WHEN USER ENTERS ROOM */}
    {userActive ? 
    <div className='chatroom-container flex flex-col text-7xl gap-12'>
          <h1>WELCOME TO THE CHAT ROOM</h1>
          <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='userInputs'
          />

          <button onClick={sendMessage}>Send Message</button>
        
          <input type="string"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          />
          
              <button onClick={()=>joinroom(1)}>Casual Chat room</button>
              <button onClick={()=>joinroom(2)}>In-Game Chat Room</button>
              <button onClick={()=>joinroom(3)}>AFK room</button>

          <button onClick={()=>exitRoom()} >EXIT CHAT ROOM</button>
          <ul id="msglist">

          </ul>
          <p className='userLogs'>{userlog}</p>

          {messages.map((msg) => {
                return <p key={msg.id}>{msg.message}</p>
              })}

      </div> 

      : 
      //DISPLAY WHEN USER ENTERS SITE 
      
          <div className='start-container mt-32 flex flex-col items-center'>

            <h1 className='h-28 bg-blue-700 text-center flex items-center justify-center text-2xl w-full'>Chat.io 💬</h1>

              <div className="joinInputs flex flex-col w-full items-center justify-center gap-8 h-full bg-purple-700">

              <label>Username</label>
              <input type="string"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              className='userInputs w-5/6 p-4'
              placeholder='Enter your username ...'
              />

              <button onClick={()=>joinroom(1)}>Casual Chat room</button>
              <button onClick={()=>joinroom(2)}>In-Game Chat Room</button>
              <button onClick={()=>joinroom(3)}>AFK room</button>

              <p id="login-error"></p>

              </div>
          </div>
    }

    </>
    
  );
}

export default App;
