import React from "react";

function Section()
{
    return (
        <div className="section-container">
            <div className="section-image">
            <img src="../abstract-wavy-background.jpg" alt="Photo" />
            </div>
            <div className="identification">
                <div className="identification-header one">
                <div className="identification-information">
                    <h3>Total Game</h3>
                    <p>151</p>
                </div>
                <hr></hr>
                <div className="identification-information">
                    <h3>Wins</h3>
                    <p>75</p>
                </div>
                <hr></hr>
                <div className="identification-information">
                    <h3>Loss</h3>
                    <p>82</p>
                </div>
                </div>
                <div className="identification-user">
            <img src="../user.jpg" alt="Photo" width={120} height={120} />
            <p id="nameuser">User-1032</p>
            </div>
                <div className="identification-header two">
                <div className="identification-information">
                    <h3>Location</h3>
                    <div className="location">
                    <img src="../morocco.png" alt="Photo" width={20} height={20} />
                        <p>MAR</p>
                    </div>
                </div>
                <hr></hr>
                <div className="identification-information rank">
                    <h3>Rank</h3>
                    <p>32</p>
                </div>
                </div>
            </div>
        </div>
    );
};

export default Section;