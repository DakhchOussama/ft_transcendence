import React, {useEffect, useState} from "react";
import {FaSearch} from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Socket, io } from "socket.io-client";
import Cookies from "js-cookie";
import { showToast } from "./ShowToast";
function AddUser()
{
    const [searchQuery, setsearchQuery] = useState('');
    const [userFriend, setuserFriend] = useState<{ id: string; username: string; avatar: string; status: string }[]>([]);
    const [updateFriend, setupdateFriend] = useState<{id: string; username: string; avatar: string; status: string }[]>([]);
    const [socket, setsocket] = useState<Socket| null>(null);
    const [clickedUsers, setClickedUsers] = useState<string[]>([]);
    const JwtToken = Cookies.get("access_token");
    
    useEffect(() => {
        if (!socket) {
            const newSocket = io('http://localhost:3001', {
              transports: ['websocket'],
              query: {
                  token: `Bearer ${JwtToken}`,
              }
            });
      
            newSocket.on('connect', () => {
              setsocket(newSocket);
            });
      
            newSocket.on('disconnect', () => {
            });
    
          return () => {
            newSocket.disconnect();
          };
        }
      }, [JwtToken]);
    

    function handleclickButtom(user_id: string, username: string)
    {
        if (user_id && socket)
        {
            const notificationData = {
                user_id: user_id,
                type: 'FRIENDSHIP_REQUEST',
                token: `Bearer ${JwtToken}`,
            }
            if (notificationData)
            {
                socket.emit('sendNotification',notificationData);
                showToast(`Friend Request To ${username}`, "success");
                setClickedUsers(prevClickedUsers => [...prevClickedUsers, user_id]);
            }
        }
    }
    useEffect(() => {
        fetch('http://localhost:3001/api/Dashboard/allUsers', {
            method: 'Get',
            headers: {
              'Authorization' : `Bearer ${JwtToken}`,
              'Content-Type': 'application/json',
            }
          })
            .then((response) => {
                if (!response.ok)
                    throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => setuserFriend(data))
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [JwtToken]);

    useEffect(() => 
    {
        if (searchQuery === '')
            setupdateFriend(userFriend);
        else
        {
            const filterFriends = userFriend.filter((friend) => 
                friend.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setupdateFriend(filterFriends);
        }
    }, [searchQuery, userFriend]);
    return (
        <div className="usercomponent">
            <div className="userheader">
                <h3>Users</h3>
                <hr></hr>
            </div>
            <div className="Add-user">
                <div className="add-user-button">
                <div>
                <input type="text" placeholder="Find Friend" onChange={(e) => setsearchQuery(e.target.value)} />
                <button type="submit"><FaSearch></FaSearch></button>
                </div>
                </div>
                <div className="add-user-list">
                    {updateFriend.map((friend) => 
                    (
                        <section className="add-user-list-card" key={friend.id}>
                                <div className="add-user-card ingame" key={friend.id}>
                                <div className="add-user-card-inde">
                                <img src={friend.avatar} alt="Photo" />
                                <p>{friend.username}</p>
                                </div>
                                <div>
                                </div>
                                <div>
                                {clickedUsers.includes(friend.id) ? (
                                    <div id="btn-pedding" style={{ cursor: 'none', backgroundColor: '#BFBEBD' }}>
                                    <FontAwesomeIcon icon={faUserPlus} />
                                    <button>Pending</button>
                                    </div>
                                    ) : (
                                    <div>
                                    <FontAwesomeIcon icon={faUserPlus} />
                                    <button onClick={() => handleclickButtom(friend.id, friend.username)}>Add User</button>
                                    </div>
                                )}
                                </div>
                               </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default AddUser;