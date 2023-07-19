import React from "react";

function Aside()
{
    return (
        <>
        <aside>
            <div className="myaside">
                <div className="myaside1">
                <img src="../new-moon.png" alt="Photo" width={10} height={10} />
                <p>Connected</p>
                </div>
                <div className="myaside2">
                <img src="../new-moon.png" alt="Photo" width={10} height={10} />
                <p><span>20</span>Players online</p>
                </div>
            </div>
            <hr></hr>
            <div className="myaside">
                <div className="myaside1 aside">
                    <h3>Dashboard</h3>
                    <img src="../up-arrow.png" alt="Photo" width={20} height={20} />
                </div>
                <div className="homepage">
                <img src="../home.png" alt="Photo" width={20} height={20} />
                    <button>Home page</button>
                </div>
                <div className="homepage">
                <img src="../bar-chart.png" alt="Photo" width={20} height={20} />
                    <button>statictic</button>
                </div>
                <div className="homepage">
                <img src="../group.png" alt="Photo" width={20} height={20} />
                    <button>Friends</button>
                </div>
                <div className="homepage">
                <img src="../history.png" alt="Photo" width={20} height={20} />
                    <button>History</button>
                </div>
            </div>
            <hr></hr>
            <div className="myaside">
                <div className="myaside1 aside">
                    <h3>Users</h3>
                    <img src="../up-arrow.png" alt="Photo" width={20} height={20} />
                </div>
                <div className="homepage">
                    <img src="../add-user (3).png" alt="Photo" width={20} height={20} />
                    <button>Add Users</button>
                </div>
            </div>
            <hr></hr>
            <div className="myaside">
                <div className="myaside1 aside">
                    <h3>Game PLay</h3>
                    <img src="../up-arrow.png" alt="Photo" width={20} height={20} />
                </div>
                <div className="homepage">
                    <img src="../games (1).png" alt="Photo" width={20} height={20} />
                    <button>let's Play</button>
                </div>
            </div>
            <hr></hr>
            <div className="myaside">
                <div className="myaside1 aside">
                    <h3>Chat</h3>
                    <img src="../up-arrow.png" alt="Photo" width={20} height={20} />
                </div>
                <div className="homepage">
                    <img src="../space (1).png" alt="Photo" width={20} height={20} />
                    <button>Chat Space</button>
                </div>
            </div>
        </aside>
        </>
    );
};

export default Aside;