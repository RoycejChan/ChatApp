import React, { useState, useEffect } from 'react';
import io from "socket.io-client";
const ENDPOINT = "http://localhost:3000";
const pbURL = "http://127.0.0.1:8090"
// Declare the socket globally
let socket = null;

function App() {
  const [message, setMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [room, setRoom] = useState(0);
  const [userActive, setUser] = useState(false);
  const [username, setUsername] = useState("");
  const [userlog, setuserLog] =useState("");
  const [messages, setMessages] = useState([]);
  const [loginError, setLoginError] =useState("");



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


  const setRoomNumber = (roomNumber) => {
    if (roomNumber === selectedRoom) {
            // Deselect the button if it's already selected
      setSelectedRoom(0);
      setRoom(0);
    } else {
      setSelectedRoom(roomNumber);
      setRoom(roomNumber);
      console.log(room);
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
    <div className={userActive ? 'black overflow-hidden' : 'purple overflow-hidden'}>
     {/* DISPLAY APP ONLY WHEN USER ENTERS ROOM */}
    {userActive ? 
    <div className="what"> {/* ".1px solid transparent border, dont know why not having this causes big gap on top of screen, deleting tailwind fixes it. idk ??" */}
      <div className='chatroom-container bg-red-100 flex flex-col text-xl gap-2 border-4 my-12 mx-auto rounded-lg shadow-2xl shadow-blue-600'>
        <h1 className='text-center flex items-center justify-center text-4xl w-full h-28 mt-4'>Chat.io 💬</h1>
            
        <div className="main-msging-app">
            <ul id="msglist">
              {messages.map((msg) => {
                  return <li key={msg.id}>{msg.message}{msg.created}</li>
                })}
            </ul>

            <div className="sideBar">
              <button onClick={sendMessage}>Send Message</button>
            
              <input type="string"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              />
              
                  <button onClick={()=>joinroom(1)}>
                  Casual Chat room
                    </button>
                  <button onClick={()=>joinroom(2)}>In-Game Chat Room</button>
                  <button onClick={()=>joinroom(3)}>AFK room</button>

              <button onClick={()=>exitRoom()} >EXIT CHAT ROOM</button>
              <p className='userLogs'>{userlog}</p>

            </div>
            </div>


            <textarea
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className='userInputs'
            />
           

        </div> 
      </div>

      : 
      //DISPLAY WHEN USER ENTERS SITE 
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
              <div className="start-btns flex justify-around w-full gap-6  text-lg ">
            <button
            onClick={() => setRoomNumber(1)}
            className={`flex-1 ${isButtonSelected(1) ? 'bg-blue-950' : 'bg-blue-700'} rounded-lg text-white text-xl h-12 hover:scale-95`}
          >
            Casual Chat room
          </button>
          <button
            onClick={() => setRoomNumber(2)}
            className={`flex-1 ${isButtonSelected(2) ? 'bg-blue-950' : 'bg-blue-700'} rounded-lg text-white text-xl h-12 hover:scale-95`}
          >
            In-Game Chat Room
          </button>
          <button
            onClick={() => setRoomNumber(3)}
            className={`flex-1 ${isButtonSelected(3) ? 'bg-blue-950' : 'bg-blue-700'} rounded-lg text-white text-xl h-12 hover:scale-95`}
          >
            AFK room
          </button>
              </div>

              <button 
                className='w-full bg-blue-800 h-16 rounded-lg text-white text-lg mb-5 hover:bg-blue-950 hover:scale-95'
                onClick={()=>joinroom(room)}
                >
                Join Room
              </button>
              
              <p id="login-error" className='text-red-900 -mt-7 '>{loginError}</p>
              
              </div>
              </div>
        </div>
    }
    </div>

    </>
    
  );
}

export default App;
