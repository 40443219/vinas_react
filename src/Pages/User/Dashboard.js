import React from 'react';

import helperTest from '../../Tests/helperTest';
import { Button } from 'antd';

const Dashboard = (props) => {
    const postTest = helperTest.postTest

    return (
        <>
            <div>Dashboard</div>
            <Button onClick={ () => postTest() }>Post test</Button>
        </>
    );
}

export default Dashboard;