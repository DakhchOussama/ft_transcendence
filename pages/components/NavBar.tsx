import React from "react";
import Image from "next/image";

function NavBar()
{
    return (
        <div className="nav">
            <div className="nav-search">
            <img src="../myWhiteLogo.png" alt="Photo" width={100} height={90} />
            {/* <div className20="btn-search">
            <input type="text" placeholder="Want to find someone?"></input>
            <img src="../search.png" alt="Photo" width={20} height={20} />
            </div> */}
            </div>
            <div className="nav-left">
                <div className="nav-icon">
                <img src="../chatroom .png" alt="Photo" width={20} height={20} />
                <img src="../bell.png" alt="Photo" width={20} height={20} />
                </div>
                <div className="nav-name">
                <p id="nameuser">User-1032</p>
                <p id="online"><span>Online</span><img src="../new-moon.png" alt="Photo" width={10} height={10} /></p>
                </div>
            <img src="../user.jpg" alt="Photo" width={65} height={60} />
            {/* <div className="click-img">
                <div className="click-img choice first">
                <img src="../setting.png" alt="Photo" width={20} height={20} />
                    <p>Setting</p>
                </div>
                <div className="click-img choice">
                <img src="../logout.png" alt="Photo" width={20} height={20} />
                    <p>Log Out</p>
                </div>
            </div> */}
            </div>
        </div>
    );
};

export default NavBar;