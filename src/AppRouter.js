import React, { useState } from 'react';
import App from './App';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import PrivateRoute from './Routes/PrivateRoute';
// import axios from 'axios';
// import CryptoJS from 'crypto-js';
import { authHelper } from './Utils';

const Page404 = () => {
    return (<>404 not found</>);
}

const Login = (props) => {
    const [isLogin, setIsLogin] = useState(localStorage.getItem('accessToken') === 'null' && localStorage.getItem('refreshToken') === null);
    const [errMSG, setErrMSG] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const fakeLogin = () => {
        setErrMSG('');

        authHelper.login('testUser', 'test123').then((result) => {
            if(!result.errorno) {
                if(result.accessToken){
                    localStorage.setItem('accessToken', result.accessToken);
                }
                if(result.refreshToken){
                    localStorage.setItem('refreshToken', result.refreshToken);
                }
                setIsLogin(true);
            } else {
                setErrMSG(result.msg);
            }
        });
    }

    const login = () => {
        setErrMSG('');

        authHelper.login(username, password).then((result) => {
            if(!result.errorno) {
                if(result.accessToken){
                    localStorage.setItem('accessToken', result.accessToken);
                }
                if(result.refreshToken){
                    localStorage.setItem('refreshToken', result.refreshToken);
                }
                setIsLogin(true);
            } else {
                setErrMSG(result.msg);
            }
        });
    }

    return (
        // <>{ JSON.stringify(props.match.params.path) }</>
        <>
            {/* { JSON.stringify(isLogin) } */}

            {
                isLogin ?  (
                    props.match.params.path ? (
                        <Redirect to={ `/${props.match.params.path}` } />
                    ) : (
                        <Redirect to='/user/' />
                    )
                ) : (
                    <>
                        <button onClick={ () => fakeLogin() }>fake login</button>
                        <div style={{ margin: '0 auto', width: '25%', marginTop: '25%', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                            <input value={ username } type="text" placeholder="username" onChange={ (e) => setUsername(e.target.value) } />
                            <input value={ password } type="password" placeholder="password" onChange={ (e) => setPassword(e.target.value) } />
                            <button onClick={ () => login() }>login</button>
                            <div>{ errMSG }</div>
                        </div>
                    </>
                )
            }
        </>
    )
}

const Index = (props) => {
    return (
        <Redirect to='/login/user/' />
    );
}

const AppRouter = () => {
    return (
        <Router>
            <Switch>
                <PrivateRoute path="/" exact component={ Index } />
                <PrivateRoute path="/user" component={ App } />
                <Route path="/login/:path([\w/]+)" component={ Login } />
                <Route path="/login" component={ Login } />
                <Route component={ Page404 } />
            </Switch>
        </Router>
    );
}

export default AppRouter;