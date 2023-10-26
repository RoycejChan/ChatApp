import React, { useState, useEffect } from 'react';
import io from "socket.io-client";
import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
const ENDPOINT = "http://localhost:3000";
const pbURL = "http://127.0.0.1:8090"
// Declare the socket globally
let socket = null;

function App() {
  const [message, setMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [roomName, setRoomName] = useState("");
  const [room, setRoom] = useState(0);
  const [userActive, setUser] = useState(false);
  const [username, setUsername] = useState("");
  const [userlog, setuserLog] =useState("");
  const [messages, setMessages] = useState([]);
  const [loginError, setLoginError] =useState("");



  //FETCH MESSAGES FOR CHAT ROOM FROM POCKETBASE DB
  async function getMessages() {
    const res = await fetch(`${pbURL}/api/collections/${room}/records?page=1&perPage=30`);  
    const data = await res.json();
    return data && data.items;
  }


  //


  const sendMessage = async () => {
    const data = {
      "username": username,
      "message": message,
      "room": room
    };

    const record = await pb.collection(`${room}`).create(data);
    socket.emit('chatmsg', { message, username });
  };



  useEffect(() => {
    // Initialize the socket connection
    socket = io(ENDPOINT);
    //FUNCTIONS ONEFFECT
    socket.on('chatmsg', ({ message, username }) => {
      if (message  != "" ) {
          //APPEND TO MSG UL as LI
          const msglist = document.getElementById("msglist");
          const inputmsg = document.createElement('li');
          inputmsg.textContent = `${username}: ${message} `;
          msglist.appendChild(inputmsg);
      } else {
        console.log("please enter a message")
      }
    });
    
    socket.on('leaveChat', ({username}) => {
      let log = `${username} has left the room`;
      setuserLog(log);
      setMessage("");
      setRoom("");
      setUser(false);
    });

    // Clean up by removing event listeners when the component unmounts
    return () => {
      socket.off("connect");
      socket.off('chatmsg');
      socket.off('leaveChat');
    };
  }, []);

    //END USE EFFECT 




  const setRoomNumber = (roomNumber, roomname) => {
    if (roomNumber === selectedRoom) {
            // Deselect the button if it's already selected
      setSelectedRoom(0);
      setRoom(0);
    } else {
      setSelectedRoom(roomNumber);
      setRoom(roomNumber);
      setRoomName(roomname);
    }
  }

  const isButtonSelected = (roomNumber) => {
    return roomNumber === selectedRoom;
  };

  const joinroom = (roomNumber) => {
    if (username == "") {
      setLoginError("Enter a username")
      return;
    } else if(username.length < 3 ) {    
      setLoginError("Username must be 3 or more characters")
      return;   
  }else if ( room === 0 ) {
      setLoginError("Choose a room to chat in")
      return;
   }else {
      async function messageContainer() {
        const messages = await getMessages();
        setMessages(messages);
      }
      messageContainer();
      setRoom(roomNumber)
      socket.emit("joinroom", roomNumber);
      setUser(true);
      setLoginError("");
    }
  };

  const exitRoom = () => {
    socket.emit("exitRoom", ( {room, username}));
    setUsername("");
  };


  return (
    <>
        <div className={userActive ? 'black overflow-hidden' : 'purple overflow-hidden'}> 

        {/* DISPLAY APP ONLY WHEN USER ENTERS ROOM */}
        {userActive ? 
        <div className="what"> {/* ".1px solid transparent border, dont know why not having this causes big gap on top of screen, deleting tailwind fixes it. idk ??" */}
          <div className='chatroom-container bg-red-100 flex flex-col text-xl gap-2 border-4 my-12 mx-auto rounded-lg'>
            
            {/* CONTAINER HEADER */}
            <div className="header flex">
              <h1 className='text-center flex items-center justify-center text-4xl w-full h-28 mt-4'>Chat.io 💬</h1>
              <button 
                onClick={()=>exitRoom()} 
                className='p-10'>
                  ✖️
              </button>
            </div>
            {/* END CONTAINER HEADER */}

            {/* MAIN MIDDLE SECTION W/MESSAGES && USERS */}
            <div className="main-msging-app flex w-full h-full">
                <div className="sideBar h-full text-center bg-white border-r-2 border-zinc-00 pt-4 gap-6">
                      <h1 className='border-b-2 border-zinc-300 py-2'>
                        {roomName} Room
                        <br />
                        Users
                      </h1>

                    {/* DISPLAY USERES IN CURRENT ROOM */}
                      <ul className="currentUsers">
                        <li>{username} <span className='text-green-400'>(YOU)</span></li>
                      </ul>

                </div>
              <ul id="msglist" 
                  className='msgs-container bg-white p-4 overflow-y-scroll'>
                  {messages.map((msg) => {
                      return <li key={msg.id}>{msg.username}:{msg.message}</li>
                  })}
              </ul>
            {/* LOG OF USERS COMING IN AND OUT
            <p className='userLogs'>{userlog}</p> */}

            </div>
            {/* END MAIN MIDDLE SECTION W/MESSAGES && USERS */}

            {/* USER MESSAGE INPUT CONTAINER */}
            <div className="message-container flex">
                <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className='userMsgInput p-4 w-full rounded-lg m-2 text-right focus:outline-none'
                        placeholder='Send a message ..'
                />
                <button 
                  onClick={sendMessage} 
                  className='px-8 hover:-translate-y-4 hover:duration-150 active:-translate-y-8 focus:duration-75'>
                  🚀
                </button>
            </div>        
            {/* END USER MESSAGE INPUT CONTAINER */}

            </div> 
          </div>

          : 
          // DISPLAY WHEN USER ENTERS SITE 
              <div className='what'> {/* ".1px solid transparent border, dont know why not having this causes big gap on top of screen, deleting tailwind fixes it. idk ??" */}
                  
                  <div className='start-container mt-20 bg-blue-200 rounded-lg shadow-lg shadow-white mx-auto'>
                        <h1 className='text-center flex items-center justify-center text-4xl w-full h-28 mt-4'>Chat.io 💬</h1>

                          <div className="joinInputs flex flex-col w-full items-center justify-around h-full px-16">
                          
                                  <input type="string"
                                    onChange={(e) => setUsername(e.target.value)}
                                    value={username}
                                    className='userInputs w-full p-6 rounded-xl border-2 border-purple-400 focus:border-purple-500 focus:outline-none'
                                    placeholder='Username'
                                  />

                                  {/* ROOM BUTTONS */}
                                  <div className="start-btns flex justify-around w-full gap-6  text-lg ">
                                        <button
                                          onClick={() => setRoomNumber(1, "Casual Chat")}
                                          className={`flex-1 ${isButtonSelected(1) ? 'bg-blue-950' : 'bg-blue-700'} rounded-lg text-white text-xl h-12 hover:scale-95`}>
                                          Casual Chat room
                                        </button>
                                      <button
                                          onClick={() => setRoomNumber(2, "In Game Chat")}
                                          className={`flex-1 ${isButtonSelected(2) ? 'bg-blue-950' : 'bg-blue-700'} rounded-lg text-white text-xl h-12 hover:scale-95`}>
                                          In-Game Chat Room
                                      </button>
                                      <button
                                        onClick={() => setRoomNumber(3, "AFK")}
                                        className={`flex-1 ${isButtonSelected(3) ? 'bg-blue-950' : 'bg-blue-700'} rounded-lg text-white text-xl h-12 hover:scale-95`}>
                                        AFK room
                                      </button>
                                  </div>
                                  {/* END ROOM BUTTONS */}
                                  {/* JOIN ROOM */}
                                  <button 
                                    className='w-full bg-blue-800 h-16 rounded-lg text-white text-lg mb-5 hover:bg-blue-950 hover:scale-95'
                                    onClick={()=>joinroom(room)}>
                                    Join Room
                                  </button>
                                  <p id="login-error" className='text-red-900 -mt-7'>{loginError}</p>
                          </div>
                      </div>
            </div>
        } 
        {/* End conditional render*/}
        </div> {/* BACKGROUND COLOR DIV */}
    </>
    
  );
}

export default App;
