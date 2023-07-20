import React from "react";
import {FaSearch} from 'react-icons/fa';

function Dashboard()
{
    return (
        <>
        <div className="home-page">
           <div className="home-page-counting">
           <div className="home-page-search">
                <input type="text" placeholder="Search Users">
                </input>
                <button type="submit"><FaSearch></FaSearch></button>
                {/* <img src="search.png" width={20} height={20}></img> */}

            </div>
            <div className="home-page-choose">
            <select name="pets" id="pet-select">
                <option  value="online-user">Online Users</option>
                <option value="in-game">In Game</option>
                <option value="offline-user">Offline</option>
            </select>
            </div>
           </div>
            <div className="informationaboutuser" >
                <div className="container-user">
                    <div className="nameuser">
                        <img src="images.png" width={42} height={42}></img>
                        <h2>Oussama Dakhch</h2>
                    </div>
                    <div className="isconnected ingame">
                        <img src="ping-pong.png" width={20} height={20}></img>
                        <h2>In Game</h2>
                    </div>
                </div>
                    <div className="container-user">
                    <div className="nameuser">
                        <img src="user2.jpeg" width={42} height={42}></img>
                        <h2>User_192</h2>
                    </div>
                    <div className="isconnected online">
                    <img src="../new-moon.png" alt="Photo" width="10" height="10" />
                        <h2>Online</h2>
                    </div>
                    </div>
                    <div className="container-user">
                    <div className="nameuser">
                        <img src="user3.jpg" width={42} height={42}></img>
                        <h2>User_145</h2>
                    </div>
                    <div className="isconnected offline">
                    <img src="../yellowcircle.png" alt="Photo" width="10" height="10" />
                        <h2>Offline</h2>
                    </div>
                    </div>
                </div>
        </div>
        </>
    );
};

export default Dashboard;