import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, {useState, useEffect} from "react";
import Setting from "./Setting";
import NavBarCSS from './NavBar.module.css';
import { Socket, io } from "socket.io-client";
import Cookies from "js-cookie";


function NavBar()
{
    const [isVisible, setIsVisible] = useState(false);
    const [notification, setnotification] = useState(false);
    const [settingindex, setsettingindex] = useState(false);
    const [closeindex, setcloseindex] = useState(false);
    const [user, setUsers] = useState<any>(null);
    const [userFriend, setuserFriend] = useState<{ id: number; username: string; avatar: string; status: string }[]>([]);
    const [updateFriend, setupdateFriend] = useState<{id: number; username: string; avatar: string; status: string }[]>([]);
    const [searchUser, setsearchUser] = useState(false);
    const [searchQuery, setsearchQuery] = useState('');
    const [notificationrequest, setnotificationrequest] = useState(false);
    const [tablenotification, settablenotification] = useState<{ id: string; user2Username: string; user2Avatar: string; type: string}[]>([]);
    const [socket, setsocket] = useState<Socket| null>(null);
    const JwtToken = Cookies.get("access_token");

    function handleclickButtom(user_id: number)
    {
        if (user_id && socket)
        {
            const notificationData = {
                user_id: user_id,
                type: 'follow',
                recipient: socket.id,
            };
            socket.emit('sendNotification',notificationData);
        }
    }

    useEffect(() => {
      if (JwtToken)
      {
          fetch('http://localhost:3001/api/Dashboard', {
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
          .then((data) => setUsers(data))
          .catch((error) => {
            console.error('Error:', error);
          });
      }
    }, [user]);

    const handlesearchuser = (e: any) =>
    {
        const value = e.target.value;
        setsearchQuery(value);
        if (value.trim() !== '') {
            setsearchUser(true);
        }
        else {
            setsearchUser(false);
        }
    }

    function handlecloseindex()
    {
        setcloseindex(!closeindex);
        setsettingindex(false);
    }

    function handleeventimage()
    {
        setIsVisible(!isVisible);
    }

    function handlenotifaction()
    {
        setnotification(!notification);
        setnotificationrequest(false);
    }

    function handleme()
    {
        setcloseindex(false);
        setsettingindex(!settingindex);
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
    }, []);

    // useEffect(() => {
    //     if (!socket)
    //     {
    //         const socket = io('http://localhost:3001');

    //         socket.on('connect', () => {
    //             console.log('Connected to WebSocket server');
    //             setsocket(socket);
    //         });
    //         socket.on('disconnect', () => {
    //             console.log('Disconnected to WebSocket server');
    //         });
    //         socket.on('notification', (notificationData: any) => {
    //             // if (notificationData === socket.id)
    //             // {
    //                 setnotificationrequest(true);
    //                 settablenotification((prevTablenotification) => [
    //                     ...prevTablenotification,
    //                     notificationData,
    //                   ]);
    //             // }
    //         });
    //         socket.on('sendlist', (notificationlist: any) => {
    //             settablenotification(notificationlist);
    //         })
    //         return () =>{
    //             socket.disconnect();
    //         };
    //     }
    // }, [socket]);
    useEffect(() => {
        if (!socket) {
          const newSocket = io('http://localhost:3001', {
            transports: ['websocket'],
            query: {
                token: `Bearer ${JwtToken}`,
            }
          });
    
          newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
            setsocket(newSocket);
          });
    
          newSocket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
          });
    
          newSocket.on("notification", (notificationData) => {
            // if (notificationData === socket.id)
            // {
            setnotificationrequest(true);
            settablenotification((prevTablenotification) => [
              ...prevTablenotification,
              notificationData,
            ]);
            // }
          });
          newSocket.on("sendlist", (notificationlist) => {
            settablenotification(notificationlist);
          });
    
          return () => {
            newSocket.disconnect();
          };
        }
      }, []);

    useEffect(() => 
    {
        if (searchQuery !== '')
        {
            const filterFriends = userFriend.filter((friend) => 
                
                friend.username.toLowerCase() === searchQuery.toLowerCase()
            );
            setupdateFriend(filterFriends);
        }
    }, [searchQuery]);

    return (
        <>
        <div className={NavBarCSS.nav}>
            <div className={NavBarCSS.nav_search}>
            <div className={NavBarCSS.logo}>
              {/* onclick dahboard */}
                <img src="../myWhiteLogo.png" alt="Photo" width={114} height={106}/> 
            </div>
            <div className={NavBarCSS.btn_search}>
            <button type="submit"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg></button>
            <input type="text" placeholder="Search..." onChange={handlesearchuser}></input>
            {searchUser && (
                <div className={NavBarCSS.search}>
                {updateFriend.map((user) => (
                        <div className={NavBarCSS.search_user} key={user?.id}>
                        <div className={NavBarCSS.search_user_div}>
                            <div>
                            <img src={user.avatar} alt="Photo"/>
                            <p>{user.username}</p>
                            </div>
                            <FontAwesomeIcon icon={faUserPlus} onClick={() => handleclickButtom(user.id)} />
                            </div>
                        </div>
                ))}
                </div>
            )}
            </div>
            </div>
            <div className={NavBarCSS.nav_left}>
                <div className={NavBarCSS.nav_icon}>
                <div className={NavBarCSS.notification_msg}>
                    <span>2</span>
                    <img src="../chatroom.png" alt="Photo" width={20} height={20} />
                </div>
                <img src="../bell.png" alt="Photo" width={20} height={20} onClick={handlenotifaction} />
                {notificationrequest && (<div className={NavBarCSS.notification_request}><span></span></div>)}
                    {notification && (
                    <div className={NavBarCSS.click_icons}>
                        <>
                            {tablenotification.map((request) => {
                                {if (request.type === 'ACCEPTED_INVITATION') {
                                    return (<div className={NavBarCSS.click_icons_friend_request} key={request.id}>
                                        <div className={NavBarCSS.click_icons_friend_request_msg}>
                                        <img src={request.user2Avatar} alt="Photo"/>
                                        <div><p id="notification-nameuser">{request.user2Username}</p><p> send you a friend follow request.</p></div>
                                        </div>
                                        <div className={NavBarCSS.click_icons_friend_request_button}>
                                            <button onClick={() => socket?.emit('reponserequest', 'accept')}><img src="checkmark.png" alt="Photo"></img></button>
                                        </div>
                                    </div>)
                                }
                                }
                                {if (request.type === 'game') {
                                    return (
                                        <div className={NavBarCSS.click_icons_game_request} key={request.id}>
                                        <img src={request.user2Avatar} alt="Photo"/>
                                        <div><p id="notification-nameuser">{request.user2Username}</p><p> send you invitation to play with him</p></div>
                                        </div>
                                    )
                                }
                                }
                            })}
                        </>
                    </div>
                    )}
                </div>
                <div className={NavBarCSS.nav_name}>
                <p id={NavBarCSS.nameuser}>{user?.username}</p>
                <p id={NavBarCSS.online}><span>{user?.status}</span><img src="../new-moon.png" alt="Photo" width={10} height={10} /></p>
                </div>
         <div className={NavBarCSS.aa}>
         <img src={user?.avatar} alt="Photo" width={65} height={60} onClick={handleeventimage} />
            {isVisible && (
                <div className={NavBarCSS.click_img}>
                <div className={NavBarCSS.choice_first} onClick={handleme}>
                <img src="../setting.png" alt="Photo" width={18} height={18} />
                <div>
                    <button >
                        <span>Setting</span>
                    </button>
                </div>
                </div>
                <div className={NavBarCSS.choice_second}>
                <img src="../logout.png" alt="Photo" width={18} height={18} />
                    <span>Log Out</span>
                </div>
            </div>
            )}
         </div>
            </div>
        </div>
        {settingindex && ( !closeindex && (<Setting handleSettingData={handlecloseindex}></Setting>))}
        </>
    );
};


export default NavBar;
