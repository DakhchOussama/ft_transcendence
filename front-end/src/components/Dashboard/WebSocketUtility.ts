import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";

let socket : any;

export function useWebSocket() {
  const [tablenotification, setTablenotification] = useState([]);
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

      socket.on("sendlist", (notificationlist : any) => {
        if (notificationlist) {
          setTablenotification(notificationlist);
        }
      });

      socket.on("notification", (notificationData : any) => {
            if (notificationData)
            {
                
            }
      });
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
  };
}
