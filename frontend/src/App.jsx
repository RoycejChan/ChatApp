import React, { useState, useEffect } from 'react';
import io from "socket.io-client";
import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
const ENDPOINT = "http://localhost:3000";
const pbURL = "http://127.0.0.1:8090"
// Declare the socket globally
const socket = io(ENDPOINT);

function App() {
  const [message, setMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [roomName, setRoomName] = useState("");
  const [room, setRoom] = useState(0);
  const [userActive, setUser] = useState(false);
  const [username, setUsername] = useState("");
  const [userlog, setuserLog] =useState([]);
  const [messages, setMessages] = useState([]);
  const [loginError, setLoginError] =useState("");
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [userId, setUserId] = useState(0);

  //FETCH MESSAGES FOR CHAT ROOM FROM POCKETBASE DB
  async function getMessages() {
    const msgs = await fetch(`${pbURL}/api/collections/${room}/records?page=1&perPage=30`);  
    const data = await msgs.json();
    return data && data.items;
  }
//SENDS MESSAGE TO DATABASE, calls chatmsg to display from database
  const sendMessage = async () => {
    const data = {
      "username": username,
      "message": message,
      "room": room,
      "socketID": userId
    };

    const record = await pb.collection(`${room}`).create(data);
    socket.emit('chatmsg', { message, username, room, userId });
  };
  useEffect(() => {
//DISPLAY MESSAGE FROM DB
    socket.on('chatmsg', ({ message, username, room, socketID}) => {

      if (message  != "" ) {
              //send new message to UI and add to messages state
          const newMsg = {
            "username": username,
            "message": message,
            "room": room,
            "socketID": socketID
          }
          setMessages((prevMessages) => [...prevMessages, newMsg]);
          console.log(usersInRoom);
        } else {
        console.log("please enter a message")
      }
    });

  socket.on("joinLog", (user) => {
    
    console.log(`${user.username} has entered room in ${user.room}: FROM SERVER`);
    const message = `${user.username} joined the room`;
    setuserLog((prevMessages) => [...prevMessages, message]);
    setUsersInRoom((prevUsers) => [...prevUsers, user.username]);
    setUserId(user.socketID)
  });

    socket.on("exitLog", (userLeft) => {
      console.log(`${userLeft.username} left the room`);
      const message = `${userLeft.username} joined the room`;
      setuserLog((prevMessages) => [...prevMessages, message]);
      setUsersInRoom((prevUsers) => prevUsers.filter(username => username !== userLeft.username));
    })
    // Clean up by removing event listeners when the component unmounts
    return () => {
      socket.off('chatmsg');
      socket.off('joinLog');
      socket.off('exitLog');
  };
  }, []);
    //END USE EFFECT 
  const exitRoom = () => {
    socket.emit("exitRoom", {username, room});

    setMessage("");
    setUsername("");
    setRoom(0)
    setUser(false);
    setSelectedRoom(0)
    setUsersInRoom([]);
  };
  const joinroom = (roomNumber) => {
    if (username == "") {
        setLoginError("Enter a username")
        return;
    } else if(username.length < 3 ) {    
        setLoginError("Username must be 3 or more characters")
        return;
     } else if(username.length > 15) {
        setLoginError("Username exceeds 15 character max")
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
      setUser(true);
      setLoginError("");


      socket.emit("createUser", {username, room:roomNumber});

    }
  };
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
            <div className="main-msging-app flex w-full h-full overflow-y-scroll bg-white ">

              {/* SIDEBAR */}
              <div className="sideBar h-full text-center bg-white border-r-2 border-zinc-00 pt-4 gap-6 flex-shrink-0">
                <h1 className="border-b-2 border-zinc-300 py-2">
                  {roomName} Room
                  <br />
                  Users
                </h1>
                <ul className="currentUsers flex flex-wrap flex-col justify-center p-2 gap-6">
                  <li className='flex flex-wrap justify-center'>
                    {username} 
                    <span className="text-green-400">(YOU)</span>
                  </li>
                  {usersInRoom.map((user) => (
                    <li className='flex flex-wrap justify-center'>
                      {user} 
                    </li>
                  ))}
                </ul>
              </div>
              {/* END SIDEBAR */}

              {/* MESSAGES CONTAINER */}

              <ul className="msgs-container p-4 flex flex-col gap-4 flex-grow overflow-y-auto">
                {messages.map((msg) => (
                  <li key={msg.id} className="message">

                    {msg.username}
                    <span className="bg-blue-500 p-3 rounded-full h-20 w-3/5 flex items-center flex-wrap pl-8" >
                      {msg.message}
                    </span>
                  </li>
                ))}

                  {userlog.map((message, index) => (
                    <li key={index} className="exit-message">
                      {message}
                    </li>
                  ))}
              </ul>

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
                  id="joinRoom"
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
