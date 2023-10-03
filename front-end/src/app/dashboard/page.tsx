"use client";
import '@/styles/Dashboard.css'
import Structure from '@/app/Structure';
import DisplayComponent from '@/components/Dashboard/DisplayComponent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import Cookies from "js-cookie";
import { io } from 'socket.io-client';


function Dashboard() {
  const JwtToken = Cookies.get("access_token");
  useEffect(() => {
    
        const newSocket = io('http://localhost:3001', {
          transports: ['websocket']
        });
        const notificationData = {
          token: `Bearer ${JwtToken}`,
        }
        newSocket.emit('online', notificationData);
      return () => {
        newSocket.disconnect();
      };
  }, [JwtToken]);
  return (
    <Structure>
      <ToastContainer  position="top-center"></ToastContainer>
      <DisplayComponent></DisplayComponent>
    </Structure>
  );
}

export default  Dashboard;