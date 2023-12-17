'use client'

import React, { useState } from "react";
import style from "../../../../styles/ChatStyles/LeaveChannel.module.css";
import CheckboxList from "../CheckBoxList/CheckBoxList";
import { useFindUserContacts, useUserContacts } from "../../../../app/context/UsersContactBookContext";
import socket from "../../../../app/socket/socket";

interface LeaveChannelProps {
  selectedDiscussion: string,
  userGrade: 'Member' | 'Admin' | 'Owner',
  channelUsers: string[] | undefined,
}

export function LeaveChannel({selectedDiscussion, userGrade, channelUsers }: LeaveChannelProps) {
  const [showDropDownList, setShowDropDownList] = useState(false);
  const userData = useUserContacts();

  const handleSendingLeavingSignal = () => {
    socket.emit('leaveChannel', selectedDiscussion)
    window.location.reload()
  }

  const handleClickLeave = () => {
    if (userGrade === 'Owner' && channelUsers?.length !== 1)
      setShowDropDownList(!showDropDownList);
    else
      handleSendingLeavingSignal()  
} ;

  return (
    <div className={style.channel_quitting_section}>
      <h3>This section provides a way to leave the channel.</h3>
      <button onClick={handleClickLeave}>Leave Channel</button>
      {userGrade === 'Owner' && ( channelUsers?.length !== 1) && (
        <>
            <div >
             {showDropDownList && 
              <>
                <h3>You can&apos;t leave the channel until you select your successor to be the channel Owner:</h3>
                <CheckboxList
                selectedDiscussion={selectedDiscussion}
                confirmSelection={handleSendingLeavingSignal}
                options={channelUsers
                  ?.map((user_id) => userData.get(user_id)?.username)
                  .filter(Boolean)} // Filter out any undefined usernames
              />
            </>
            }
          </div>
        </>
      )}
      {/* Add transfer and leave buttons */}
    </div>
  );
}
