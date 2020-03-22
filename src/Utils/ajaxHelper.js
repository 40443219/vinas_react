import axios from 'axios';
import { asyncRetry } from '../Utils';

const PUT_AUTH_HEADER = true;

export const post = (url, options = {}, authHeader = PUT_AUTH_HEADER) => {
    if(authHeader) {
        options.accessToken =  localStorage.getItem('accessToken');
        options.refreshToken = localStorage.getItem('refreshToken');
    }

    return axios.post(url, options).then((res) => {
        return res;
    }).catch((err) => {
        return err.response
    });
};

export const post_retry = (url, options = {}, authHeader = PUT_AUTH_HEADER, n = 3) => {
    if(authHeader) {
        options.accessToken =  localStorage.getItem('accessToken');
        options.refreshToken = localStorage.getItem('refreshToken');
    }

    return axios.post(url, options).then((res) => {
        return res;
    }).catch((err) => {
        if(n === 1) return err.response;

        return post_retry(url, options, authHeader, n - 1);
    });
}

export default {
    post,
    post_retry
};