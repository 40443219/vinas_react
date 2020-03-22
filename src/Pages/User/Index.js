import React from 'react';
import { Redirect } from 'react-router-dom';

const Index = (props) => {
    return (
        <>
            <Redirect to="/user/dashboard" />
        </>
    );
}

export default Index;