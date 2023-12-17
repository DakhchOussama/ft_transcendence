import { useEffect } from "react";
import socket from "../app/socket/socket";
import { discussionPanelSelectType } from "../components/Chat/interfaces/DiscussionPanel";

export function useHandleJoinDm(selectedDiscussion: discussionPanelSelectType) {
  useEffect(() => {
    const handleJoinDm = (dm_id: string) => {
      socket.emit("joinDm", dm_id);
    };

    socket.on("dmIsJoined", handleJoinDm);

    return () => {
      socket.off("dmIsJoined", handleJoinDm);
    };
  }, [selectedDiscussion]);
}
