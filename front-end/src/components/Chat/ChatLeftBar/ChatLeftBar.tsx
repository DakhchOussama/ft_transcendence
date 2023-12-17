'use client';

import SideBarItem from "./SideBarItem/SideBarItem";
import style from '../../../styles/ChatStyles/ChatLeftBar.module.css';
import channelsIcon from '../../../../public/chatIcons/icons/left-bar/channel-icon.png';
import dmIcon from '../../../../public/chatIcons/icons/left-bar/dm-icon.png';
import createChannelIcon from '../../../../public/chatIcons/icons/left-bar/chat-bubble-icon.png';
import chatSpaceIcon from '../../../../public/chatIcons/icons/left-bar/chat-space.png';
import clsx from "clsx";


interface ChatSpaceProps{
    handleNavigation: () => void,
    activateShrinkMode: boolean
}
function  ChatSpace ({handleNavigation, activateShrinkMode}: ChatSpaceProps)
{
    return (
        <div className={style.chat_space} onClick={handleNavigation}>
            <div className={style.chat_space__icon}>
                <img src={chatSpaceIcon.src} alt="icon " />
            </div>
            {
                activateShrinkMode === false &&
                <div className={style.chat_space__name}>
                    Chat Space
                </div>
            }
        </div>
    )
}


export function ChatLeftBar({activateShrinkMode}: {activateShrinkMode:boolean}) {
    const leftBarClass = clsx({
        [style.chat_left_bar__side_bar]: activateShrinkMode === false,
        [style.chat_left_bar__side_bar_shrink_mode]: activateShrinkMode === true,
      });
    
    const navigateToCreateChannel = () => {
        window.location.href = '/chat/CreateChannel';
    }

    const navigateToChannels = () => {
        window.location.href = '/chat/Channels';
    }

    const navigateToDm = () => {
        window.location.href = '/chat/DirectMessaging';
    }

    const navigateToMainChat = () => {
        window.location.href = '/chat/';
    }
    return (
            <div className={leftBarClass}>
                <div>
                    <ChatSpace handleNavigation={navigateToMainChat} activateShrinkMode={activateShrinkMode}/>
                </div>
                <div>
                    <SideBarItem handleNavigation={navigateToCreateChannel} data={{icon: createChannelIcon.src, name: 'Create Channel'}} activateShrinkMode={activateShrinkMode}/>
                    <SideBarItem handleNavigation={navigateToChannels} data={{icon:channelsIcon.src , name: 'Channel'}} activateShrinkMode={activateShrinkMode}/>
                    <SideBarItem handleNavigation={navigateToDm} data={{icon: dmIcon.src, name: 'Direct Messaging'}} activateShrinkMode={activateShrinkMode}/>
                </div>
            </div>
    )
}
