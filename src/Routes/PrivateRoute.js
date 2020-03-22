import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, ...rest}) => {
    const isAuth = () => {
        // return axios.get('/api/login').then((res) => {
        //     const result = res.data;
        //     if(!result || !result.login) {
        //         return false;
        //     } else {
        //         return true;
        //     }
        // });

        let accessToken = localStorage.getItem('accessToken');
        if(accessToken !== null ) {
            return true;
        } else {
            return false;
        }
    };

    const gotoLogin = (history, pathMatch) => {
        // window.alert(JSON.stringify(pathMatch.path));
        history.push(`/login${ pathMatch.path }`);
        window.location.reload();
    }

    return (
        <Route 
            { ...rest }
            render={
                (props) => (
                    isAuth() ? (
                        <Component { ...props } />
                    ) : (
                        // Force reload
                        gotoLogin(props.history, props.match)

                        // Return Login page, match route (Care of nested Route display)
                        // <Redirect 
                        //     to="/login"
                        // />
                    )
                )
            }
        />
    );
}

export default PrivateRoute;