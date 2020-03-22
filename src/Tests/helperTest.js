import { ajaxHelper, authHelper } from '../Utils/';

/**
 * For testing 
 **/
const postTest = async () => {
    let res = await ajaxHelper.post('/api/authTest');

    if(res.status === 401) {
        // res = await ajaxHelper.post('/api/renewToken');

        // if(res.status !== 200) {
        //     authHelper.logout(props.history);
        // } else {
        //     const data = res.data;
        //     if(data && data.accessToken && data.refreshToken) {
        //         localStorage.setItem('accessToken', data.accessToken);
        //         localStorage.setItem('refreshToken', data.refreshToken);
        //         console.log('Tokens have been renews!')
        //     }
        // }

        const renewTokenResult = await authHelper.renewToken();
        if(renewTokenResult) {
            console.log('RenewTokenResult === true');
        } else {
            console.log('RenewTokenResult === false');
            authHelper.logout();
        }
    } else {
        console.log('AcccessToken is valid!');
    }
}

export default {
    postTest
}