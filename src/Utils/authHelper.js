import { ajaxHelper } from '../Utils';
import CryptoJS from 'crypto-js'

export const login = async (username, password) => {
    const res = await ajaxHelper.post('/api/auth', { user: username, password: CryptoJS.MD5(password).toString() } , false);
    // const res = await asyncRetry(
    //     ajaxHelper.post,
    //     {
    //         url: '/api/auth', 
    //         user: username, 
    //         password: CryptoJS.MD5(password).toString(), 
    //         authHeader: false
    //     }
    // );

    if(res.status === 200) {
        return res.data;
    } else {
        return {
            errorno: -1,
            msg: 'Unkown error.'
        }
    }
} 

export const logout = (history) => {
    localStorage.setItem('accessToken', null);
    localStorage.setItem('refreshToken', null);
    if(history) {
        history.push('/login');
    }  
    else {
        window.history.pushState(null, null , '/login');
    }
    window.location.reload();
}

export const renewToken = async () => {
    const res = await ajaxHelper.post_retry('/api/renewToken');

    if(res.status === 200) {
        const data = res.data;
        if(data && data.accessToken && data.refreshToken) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            console.log('Tokens have been renews!');
            return true;
        }
    }

    return false;
}

export const getUserInfo = () => {
    const accessToken = localStorage.getItem('accessToken');
    if(accessToken !== 'null') {
        // console.log(CryptoJS.enc.Base64.parse(accessToken.split('.')[1]).toString(CryptoJS.enc.Utf8));
        const userInfo = JSON.parse(CryptoJS.enc.Base64.parse(accessToken.split('.')[1]).toString(CryptoJS.enc.Utf8));
        delete userInfo.iat;
        delete userInfo.exp;

        return userInfo;
    }
    
    return null;
}

export default {
    logout,
    renewToken,
    login,
    getUserInfo
}