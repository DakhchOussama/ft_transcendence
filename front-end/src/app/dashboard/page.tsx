"use client";
import '@/styles/Dashboard.css'
import Structure from '@/app/Structure';
import DisplayComponent from '@/components/Dashboard/DisplayComponent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import Cookies from "js-cookie";
import  newSocket from '../../components/GlobalComponents/Socket/socket'


function Dashboard() {
  const JwtToken = Cookies.get("access_token");
  useEffect(() => {
        const statusData = {
            token: `Bearer ${JwtToken}`,
            status: 'online'
        }
        newSocket.on('connect', () => {});
        newSocket.emit('status', statusData);
  }, [JwtToken]);
  return (
    <Structure>
      <ToastContainer  position="top-center"></ToastContainer>
      <DisplayComponent></DisplayComponent>
    </Structure>
  );
  
}

export default  Dashboard;