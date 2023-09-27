import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

let socket: Socket | null = null;

export function useWebSocket() {
  const [tablenotification, setTablenotification] = useState<any[]>([]);
  const [notificationrequest, setNotificationrequest] = useState(false);
  const JwtToken = Cookies.get("access_token");

  useEffect(() => {
    if (!socket && JwtToken) {
      socket = io("http://localhost:3001", {
        transports: ["websocket"],
        query: {
          token: `Bearer ${JwtToken}`,
        },
      });

      socket.on("connect", () => {
        console.log("Connected to WebSocket server");
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
      });

      socket.on("sendlist", (notificationlist: any) => {
        if (notificationlist) {
          setTablenotification(notificationlist);
        }
      });
    }

    function sendNotification(notificationData: any)
    {
      if (socket)
      {
          socket.on("notification", (notificationData) => {
            if (notificationData) {
              const transformedData = {
                id: notificationData.id,
                user2Username: notificationData.username,
                user2Avatar: notificationData.avatar,
                type: "ACCEPTED_INVITATION",
              };
            
              if (tablenotification && tablenotification.length > 0) {
                setNotificationrequest(true);
                setTablenotification((prevTablenotification) => [
                  ...prevTablenotification,
                  transformedData,
                ]);
              } else {
                setNotificationrequest(true);
                setTablenotification([transformedData]);
              }
            }
          });
      }
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [JwtToken]);

  return {
    socket,
    tablenotification,
    setTablenotification,
    notificationrequest,
  };
}
