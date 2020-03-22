import React, { useState, useEffect } from 'react';
import { Table, Button, Icon } from 'antd';
import { authHelper, ajaxHelper } from '../../Utils';

const RecycleBin = () => {
    const [dataSource, setDataSource] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const columns = [
        {
            title: 'Name',
            key: 'displayName',
            dataIndex: 'displayName'
        },
        {
            title: 'ServerName',
            key: 'name',
            dataIndex: 'name'
        },
        {
            title: 'Location',
            key: 'path',
            dataIndex: 'path'
        },
        {
            title: 'Drop time',
            key: 'dropTime',
            dataIndex: 'dropTime',
            render: (text, record) => (
                <>
                    { new Date(text).toLocaleString() }
                </>
            )
        }
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys) => setSelectedRowKeys(selectedRowKeys)
    }

    useEffect(() => {
        initPage();
    }, []);

    const initPage = () => {
        authHelper.renewToken().then((result) => {
            if(result) {
                ajaxHelper.post_retry('/api/user/recycleBin').then((res) => {
                    console.log(res);
                    setDataSource(res.data.data);
                });
            } else {
                authHelper.logout();
            }
        });
    }

    const restoreObjects = () => {
        if(selectedRowKeys.length > 0) {
            // setIsLoading(true);
            authHelper.renewToken().then((result) => {
                if(result) {
                    ajaxHelper.post_retry('/api/user/restore', {
                        objectList: selectedRowKeys
                    }).then((res) => {
                        setSelectedRowKeys([]);
                        initPage();
                        // setIsLoading(false);
                    });
                } else {
                    setSelectedRowKeys([]);
                    // setIsLoading(false);
                    authHelper.logout();
                }
            });
        }
    }

    const deleteObjects = () => {
        if(selectedRowKeys.length > 0) {
            // setIsLoading(true);
            authHelper.renewToken().then((result) => {
                if(result) {
                    ajaxHelper.post_retry('/api/user/delete', {
                        objectList: selectedRowKeys
                    }).then((res) => {
                        setSelectedRowKeys([]);
                        initPage();
                        // setIsLoading(false);
                    });
                } else {
                    setSelectedRowKeys([]);
                    // setIsLoading(false);
                    authHelper.logout();
                }
            });
        }
    }

    return (
        <div className="root">
            {/* Todo: Spin */}
            {/* <div>Recycle bin</div> */}

            <Button onClick={ () => deleteObjects() }><Icon type="stop" />Delete</Button>
            <Button onClick={ () => restoreObjects()}><Icon type="undo" />Restore</Button>
            
            <Table dataSource={ dataSource } columns={ columns } rowKey="name" rowSelection={ rowSelection } pagination={ false } />
        </div>
    );
}

export default RecycleBin;