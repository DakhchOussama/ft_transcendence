"use client";

import SettingCss from "./Setting.module.css";
import React, {useEffect, useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import Cookies from "js-cookie";

interface Settingprops
{
    handleSettingData: (data: boolean) => void;
}

interface Data
{
    image: string,
    name: string,
    twofactor: string
}

const Setting: React.FC<Settingprops> = ({handleSettingData}) =>
{
    const [twofactor, settwofactor] = useState(false);
    const [selectedFile, setSelectedFile]: any = useState(null);
    const JwtToken = Cookies.get("access_token");
    const [user, setUsers] = useState<any>(null);
    const [image, setImage] = useState(user ? user.avatar : null);

    const handleFileChange = (event: any) => {
      setSelectedFile(event.target.files[0]);
      if (event.target.files[0])
      {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
        }
        reader.readAsDataURL(event.target.files[0]);
      }
    };

    useEffect(() => {
        if (JwtToken)
        {
            fetch('http://localhost:3001/api/Dashboard', {
              method: 'Get',
              headers: {
                'Authorization' : `Bearer ${JwtToken}`,
                'Content-Type': 'application/json',
              }
            })
            .then((response) => {
                if (!response.ok)
                    throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => {
                setUsers(data);
                setImage(data.avatar);
            })
            .catch((error) => {
              console.error('Error:', error);
            });
        }
      }, []);

    const handleUpload = async () => {
        if (selectedFile) {
          const formData = new FormData();
          formData.append('file', selectedFile);

          try {
            const response = await fetch('http://localhost:3001/upload/file', {
              method: 'POST',
              headers: {
                'Authorization' : `Bearer ${JwtToken}`,
                'Content-Type': 'application/json',
            },
              body: formData,
            });
    
            if (response.ok) {
              const data = await response.json();
              console.log('File uploaded successfully:', data);
            } else {
              console.error('File upload failed.');
            }
          } catch (error) {
            console.error('An error occurred during file upload:', error);
          }
        }
      };

    function handleTwoFactorClick(event : any)
    {
        event.preventDefault();
        settwofactor(true);
    }
    function handleImage(event: React.ChangeEvent<HTMLInputElement>)
    {
        const file = event.target.files?.[0];
        if (file)
        {
            const reader = new FileReader();
            reader.onloadend = () =>
            {
                if (typeof reader.result === 'string')
                    setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    function close()
    {
        handleSettingData(true);  
    };
        
    return (
        <div className={SettingCss.setting}>
            <div className={SettingCss.div_setting}>
                <div className={SettingCss.close_setting}>
                <img src="../close.png" alt="Photo" width="15" height="15" style={{cursor: 'pointer'}} onClick={close} /> 
                </div>
                <div className={SettingCss.setting_form}>
                    <img src={image} alt="Photo" width="100" height="100" />
                    <div className={SettingCss.choose_img}>
                        <label htmlFor="choose">Change photo profile</label>
                        <input type="file" onChange={handleFileChange} accept="image/*"  id="choose"></input>
                    </div>
                    <form>
                        <div className={SettingCss.two_factor}>
                            <FontAwesomeIcon icon={faShieldAlt} id={SettingCss.two_factor_icon} />
                            <button onClick={handleTwoFactorClick}>two-factor authentication</button>
                        </div>
                        <button onClick={handleUpload} id="conform">Confirm</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Setting;