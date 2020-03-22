import React, { useState, useEffect } from 'react';
import {} from 'antd';
import { authHelper, ajaxHelper } from '../../Utils';

const Profile = () => {
    useEffect(() => {
        authHelper.renewToken().then(result => {
            if(result) {
                ajaxHelper.post_retry();
            } else {
                authHelper.logout();
            }
        });
    }, []);
    
    return <>Profile</>
}

export default Profile;