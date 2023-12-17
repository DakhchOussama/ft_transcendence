import { useEffect } from "react";
import { discussionPanelSelectType } from '../components/Chat/interfaces/DiscussionPanel';
import { IBanContext } from "../app/context/BanContext";
import socket from "../app/socket/socket";


export function useHandleBan (BanContext:IBanContext, selectedDiscussion : discussionPanelSelectType, 
            disableChatTextBox : React.Dispatch<React.SetStateAction<boolean | undefined>>)
{
    useEffect(() => {
        const handleUserBanned = (banSignal: { room_id: string, agent_id:string }) => {
          if (banSignal.room_id === selectedDiscussion.id) {
            disableChatTextBox(true); 
          }
          BanContext.banUser(banSignal.room_id, banSignal.agent_id)
          socket.emit("suspendChannelUpdates", banSignal.room_id);
          
        };

        socket.on("userBanned", handleUserBanned);

        return () => {
          socket.off("userBanned", handleUserBanned);
        };
      }, [selectedDiscussion]);
    }

    
export function useHandleUnBan (BanContext:IBanContext, selectedDiscussion : discussionPanelSelectType, 
    disableChatTextBox : React.Dispatch<React.SetStateAction<boolean | undefined>>)
    {
        useEffect(() => {
          const handleUserUnBanned = (banSignal: { room_id: string, agent_id:string }) => {
            if (banSignal.room_id === selectedDiscussion.id) {
              disableChatTextBox(false); // Set the isBanned state to true when banned
            }
            BanContext.unbanUser(banSignal.room_id, banSignal.agent_id )
            socket.emit("resumeChannelUpdates", banSignal.room_id);
          };
      
            socket.on("userUnBanned", handleUserUnBanned);
        
            return () => {
              socket.off("userUnBanned", handleUserUnBanned);
            };
          }, [selectedDiscussion]);
        
    }
