import React from "react";

function Dashboard()
{
    return (
        <>
        <div className="home-page">
            <div className="home-page-search">
                <input type="text" placeholder="Search Users"></input>
                <img src="search.png" width={20} height={20}></img>
            </div>
            <div className="home-page-choose">
            <select name="pets" id="pet-select">
                <option value="">Online Users</option>
                <option value="dog">In Game</option>
                <option value="cat">Offline</option>
            </select>
            </div>
            <div className="informationaboutuser" >
                <div className="">
                    <div className="nameuser">
                        <img src="images.png" width={30} height={30}></img>
                        <h2>Oussama Dakhch</h2>
                    </div>
                    <div className="isconnected">
                        <img src="ping-pong.png" width={30} height={30}></img>
                        <h2>In Game</h2>
                    </div>
                    <div className="nameuser">
                        <img src="images.png" width={30} height={30}></img>
                        <h2>User_192</h2>
                    </div>
                    <div className="isconnected">
                    <img src="../new-moon.png" alt="Photo" width="10" height="10" />
                        <h2>Online</h2>
                    </div>
                    <div className="nameuser">
                        <img src="images.png" width={30} height={30}></img>
                        <h2>User_145</h2>
                    </div>
                    <div className="isconnected">
                        <img src="ping-pong.png" width={30} height={30}></img>
                        <h2>OFFLINE</h2>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default Dashboard;