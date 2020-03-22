import React, { useState, useEffect } from 'react';
import { Breadcrumb, Table, Icon, Modal, Upload, message, Input, Button, Spin, Divider, Tree } from 'antd';
import './files.css';
import * as Mime from 'mime-types';

import DPlayer from 'react-dplayer';
import { ajaxHelper, authHelper } from '../../Utils';
import filesize from 'filesize';

const { Dragger } = Upload;
const { TreeNode } = Tree;

const Files = (props) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
    const [isEditDisplayNameModalVisible, setIsEditDisplayNameModalVisible] = useState(false);
    const [displayNameModalName, setDisplayNameModalName] = useState('');
    const [displayNameModalDisplayName, setDisplayNameModalDisplayName] = useState('');
    const [displayNameModalValue, setDisplayNameModalValue] = useState('');

    const [isDirectoryModalVisible, setIsDirectoryModalVisible] = useState(false);
    const [directoryModalValue, setDirectoryModalValue] = useState('');

    const [isMoveToModalVisible, setIsMoveToModalVisible] = useState(false);
    const [moveToModalValues, setMoveToModalValues] = useState([]);
    const [moveToModalLoadedKeys, setMoveToModalLoadedKeys] = useState([]);
    const [moveToModalExpandedKeys, setMoveToModalExpandedKeys] = useState([]);

    const [dirTreeData, setDirTreeData] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [DP, setDP] = useState(null);
    const [mediaURL, setMediaURL] = useState('');

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys) => { setSelectedRowKeys(selectedRowKeys) }
    }

    const draggerProps = {
        name: 'file',
        multiple: true,
        action: '/api/user/upload',
        method: 'post',
        // data: {
        //     parent: '/qwer'
        // },
        showUploadList: false,
        headers: {
            authorization: 'Bearer ' + localStorage.getItem('accessToken'),
            path: null
        },
        onChange(info) {
          const { status, response = null } = info.file;
          if (status !== 'uploading') {
            console.log(info.file, info.fileList);
          }
          if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
            navTo(dir.name);
          } else if (status === 'error') {
            if(response) {
                message.error(response.msg);
            } else {
                message.error(`${info.file.name} file upload failed.`);
            }
          } else if(status === 'uploading') {
            if(info.event) {
                console.log(info.event);
            }
          }
        },
        beforeUpload: async function() {
            const result = await authHelper.renewToken();
            if(result) {
                draggerProps.headers.authorization = 'Bearer ' + localStorage.getItem('accessToken');
                draggerProps.headers.path = dir.name
            } else {
                authHelper.logout();
            }
        }
    };

    // const dir = {
    //     root: '5d67hfrtghtrfbh',
    //     name: '89jhwskck8lwn0h',
    //     parent: 'd67hfrtghtrfbh',
    //     parents: [
    //         { name: '5d67hfrtghtrfbh', displayName: 'Home', type: 'directory' },
    //         { name: '89jhwskck8lwn0h', displayName: 'Video', type: 'directory' },
    //     ],
    //     children: [
    //         { name: '947hshsc7vtjhcj', displayName: 'sample.mp4', type: 'file' },
    //         { name: '94jfutkdkw34kck', displayName: 'README.txt', type: 'link' }
    //     ]
    // }

    // let dirTreeData = [
    //     { title: 'Home', key: '0' },
    //     { title: 'Home', key: '1' },
    //     { title: 'Home', key: '2' }
    // ];

    const renderTreeNodes = (data) => (
        data.map((item) => {
            // console.log(item);
            if(item.children) {
                // console.log('in');
                return (
                    <TreeNode selectable={ item.selectable } title={ item.title } key={ item.key } dataRef={ item }>
                        { renderTreeNodes(item.children) }
                    </TreeNode>
                );
            }

            return <TreeNode key={ item.key } { ...item } dataRef={ item } />;
        })
    )

    const onLoadData = (treeNode) => (
        new Promise((resolve) => {
            const node = treeNode.props.dataRef;
            // if (node.children) {
            //     resolve();
            //     return;
            // }
            
            setTimeout(() => {
                authHelper.renewToken().then((result) => {
                    if(result) {
                        ajaxHelper.post_retry('/api/user/files', {
                            name: node.key
                        }).then((res) => {
                            if(res.status === 200 && res.data) {
                                const data = res.data;
                                const dirTree = [];
                                for(const item of data.children) {
                                    if(item.type === 'directory') {
                                        if(selectedRowKeys.find((name) => name === item.name || name === dir.parent) === undefined) {
                                            dirTree.push({
                                                title: item.displayName,
                                                key: item.name
                                            });
                                        } else {
                                            dirTree.push({
                                                title: item.displayName,
                                                key: item.name,
                                                selectable: false
                                            });
                                        }
                                    }
                                }
                                // console.log(dirTree);
                                
                                node.children = dirTree;
                                setDirTreeData([ ...dirTreeData ]);
                            }
                        });
                    } else {
                        authHelper.logout();
                    }
                });
                
                // node.children = [
                //   { title: 'Child Node', key: `${treeNode.props.eventKey}-0` },
                //   { title: 'Child Node', key: `${treeNode.props.eventKey}-1` },
                // ];
                // dirTreeData = treeNode.props.dataRef
                // this.setState({
                //   treeData: [...this.state.treeData],
                // });

                resolve();
            }, 1000);
        })
    );

    const [dir, setDir] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        ajaxHelper.post_retry('/api/user/files')
        .then((res) => {
            if(res.status !== 401) {
                const resDir = res.data;
                // console.log(resDir)
                setDir(resDir);
                setIsLoading(false);
            } else {
                authHelper.renewToken()
                .then((result) => {
                    if(result) {
                        ajaxHelper.post_retry('/api/user/files')
                        .then((res) => {
                            if(res.status !== 401) {
                                const resDir = res.data;
                                // console.log(resDir)
                                setDir(resDir);
                                setIsLoading(false);
                            } else {
                                // Todo: warring
                            }
                        });
                    } else {
                        setIsLoading(false);
                        authHelper.logout();
                    }
                });
            }
        });
    }, []);

    useEffect(() => {
        console.log('Do something after directory has changed', dir);
        draggerProps.headers.path = (dir) ? ((dir.parent) ? dir.parent : dir.root) : null;
     }, [dir]);

    useEffect(() => {
        if(isMoveToModalVisible) {
            authHelper.renewToken().then((result) => {
                if(result) {
                    ajaxHelper.post_retry('/api/user/files').then((res) => {
                        if(res.status === 200 && res.data) {
                            const data = res.data;
                            // console.log(data.children);
                            const rootDirChildren = [];
                            const rootDirTree = [{
                                title: data.displayName,
                                key: data.name,
                                selectable: dir.parent !== null,
                                children: rootDirChildren
                            }];
                            
                            for(const item of data.children) {
                                if(item.type === 'directory') {
                                    if(selectedRowKeys.find((name) => name === item.name || name === dir.parent) === undefined) {
                                        rootDirChildren.push({
                                            title: item.displayName,
                                            key: item.name
                                        });
                                    } else {
                                        rootDirChildren.push({
                                            title: item.displayName,
                                            key: item.name,
                                            selectable: false
                                        });
                                    }
                                }
                            }
                            // console.log(rootDirChildren);
                            console.log(rootDirTree);

                            setDirTreeData([...rootDirTree]);
                            setMoveToModalExpandedKeys([data.name]);
                        }
                    });
                } else {
                    authHelper.logout();
                }
            });
        }
    }, [isMoveToModalVisible]);

    const isMedia = (displayName) => {
        const mediaTypeTable = [
            'video/mp4',
            'audio/mpeg'
        ];

        const sourceMime = Mime.lookup(displayName);

        // console.log(displayName)
        // console.log(sourceMime)
        // console.log(mediaTypeTable.filter((mediaType) => sourceMime === mediaType))

        if(mediaTypeTable.filter((mediaType) => sourceMime === mediaType).length > 0) {
            return true;
        }

        return false;
    }

    const bindDP = (dp) => {
        console.log(dp);
        setDP(dp);
    }

    const playMedia = (name) => {
        // Todo: CORS

        authHelper.renewToken().then((res) => {
            if(res) {
                const objectID = name;
                const url = `//192.168.2.6:8888/api/user/media/?objectID=${ objectID }&accessToken=${ localStorage.getItem('accessToken') }&refreshToken=${ localStorage.getItem('refreshToken') }`;
                setMediaURL(url);
                setIsVideoModalVisible(true);
            } else {
                authHelper.logout();
            }
        });
    }

    const downloadHandler = (objectID) => {
        // Todo: CORS

        authHelper.renewToken()
        .then((result) => {
            if(result) {
                const iframe = document.createElement('iframe');
                iframe.src = `//192.168.2.6:8888/api/user/getFile?objectID=${ objectID }&accessToken=${ localStorage.getItem('accessToken') }&refreshToken=${ localStorage.getItem('refreshToken') }`;
                iframe.style.display = 'none';
                // Todo: remove iframe by interval check
                document.body.appendChild(iframe);
            } else {
                // Todo: Error warning
            }
        })
        
    }

    const listArr = (dir) => {

        // console.log([
        //     // { name: dir.parent, displayName: '..' },
        //     ...dir.children
        // ])

        return (dir && dir.children) ? ([
                // { displayName: '..', name: dir.parent },
                ...dir.children
            ]) : ([]);
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'displayName',
            key: 'displayName',
            render: (text, record) => (
                <span>
                    { (record.type && record.type !== 'file') ? <a onClick={ () => navTo(record.name) }>{ text }</a> : <span>{ text }</span> }
                    {/* <a onClick={ () => (record.type !== 'file') ? navTo(record.name) : '' }></a> */}
                </span>
            )
        },
        {
            title: 'ServerName',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Owner',
            dataIndex: 'owner',
            key: 'owner',
            render: (text, record) => (
                <>
                    { record.owner ? text : 'Unknown' }
                </>
            )
        },
        {
            title: 'Group',
            dataIndex: 'group',
            key: 'group',
            render: (text, record) => (
                <>
                    { record.group ? text : '---' }
                </>
            )
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            render: (text, record) => (
                <>
                    { record.size ? <div style={{ textAlign: 'right' }}>{ filesize(record.size) }</div> : <div style={{ textAlign: 'center' }}>---</div> }
                </>
            )
        },
        {
            title: 'Last Modified',
            dataIndex: 'modifiedTime',
            key: 'modifiedTime',
            render: (text, record) => (
                <span style={{ float: 'right' }}>
                    { new Date(text).toLocaleString() }   
                </span>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
                    <Icon type="edit" onClick={ () => initDisplayNameModal(record) }></Icon>
                    { isMedia(record.displayName) ? <Icon type="play-circle" onClick={ () => playMedia(record.name) } /> : '' }
                    <Icon type="cloud-download" onClick={ () => downloadHandler(record.name) }></Icon>
                </span>
            )
        }
    ]

    const initDisplayNameModal = (record) => {
        setDisplayNameModalName(record.name);
        setDisplayNameModalDisplayName(record.displayName);
        setDisplayNameModalValue('');
        setIsEditDisplayNameModalVisible(true);
    }

    const initNewDirectoryModal = () => {
        setDirectoryModalValue('');
        setIsDirectoryModalVisible(true);
    }

    const initMoveToModal = () => {
        setMoveToModalValues([]);
        setIsMoveToModalVisible(true);
    }

    const navTo = (name) => {
        setIsLoading(true);
        authHelper.renewToken().then((result) => {
            if(result) {
                ajaxHelper.post_retry('/api/user/files', {
                    name
                }).then((res) => {
                   if(res.data) {
                       const data = res.data;
                    //    console.log(data.children.sort((a, b) => a.isDirectory ? -1 : (b.isDirectory ? 1 : 0)));
                       setDir(data);
                       setIsLoading(false);
                   } else {
                       // Todo: warring fecth error;
                   }
                });
            } else {
                authHelper.logout();
            }
        });
    }

    const editDisplayName = (name, value) => {
        // Todo: String validation

        return new Promise((resolve, reject) => {
            authHelper.renewToken().then((result) => {
                if(result) {
                    ajaxHelper.post_retry('/api/user/edit', {
                        action: 'editDisplayName',
                        objectID: name,
                        value
                    }).then((res) => {
                       if(res.status === 200 && res.data) {
                           const data = res.data;
                           if(data.errorno === 0) {
                               navTo(dir.name);
                           } else {
                               message.error(data.msg);
                           }
                       } else {
                           // Todo: warring fecth error;
                       }
                       resolve();
                    });
                } else {
                    resolve();
                    authHelper.logout();
                }
            });
        });
    }

    const createNewDirectory = (dir, value) => {
        // Todo: String validation

        return new Promise((resolve, reject) => {
            authHelper.renewToken().then((result) => {
                if(result) {
                    ajaxHelper.post('/api/user/createNewFolder', {
                        parentDir: dir,
                        value
                    }).then((res) => {
                        if(res.status === 200 && res.data) {
                            const data = res.data;
                            if(data.errorno === 0) {
                                resolve();
                                navTo(dir.name);
                            } else {
                                // resolve();
                                message.error(data.msg);
                            }
                        }
                    });
                } else {
                    resolve();
                    authHelper.logout();
                }
            });
        });
    }

    const dropObjects = () => {
        if(selectedRowKeys.length > 0) {
            setIsLoading(true);
            authHelper.renewToken().then((result) => {
                if(result) {
                    ajaxHelper.post('/api/user/drop', {
                        objectList: selectedRowKeys
                    }).then((res) => {
                        if(res.status === 200 && res.data) {

                        }
                        const data = res.data;
                        if(data)
                        setSelectedRowKeys([]);
                        navTo(dir.name);
                        setIsLoading(false);
                    });
                } else {
                    setSelectedRowKeys([]);
                    setIsLoading(false);
                    authHelper.logout();
                }
            });
        }
    };

    const moveObjects = () => {
        if(moveToModalValues.length === 1 && selectedRowKeys.length > 0) {
            setIsLoading(true);
            authHelper.renewToken().then((result) => {
                if(result) {
                    ajaxHelper.post('/api/user/moveTo', {
                        objectList: selectedRowKeys,
                        destination: moveToModalValues[0]
                    }).then((res) => {
                        if(res.status === 200 && res.data){
                            const data = res.data;
                            // Todo: warnning
                            if(data.errorno !== 0) {
                                navTo(dir.name);
                                message.error(data.msg);
                            } else {
                                navTo(moveToModalValues[0]);
                            }

                            setSelectedRowKeys([]);
                            setIsLoading(false);
                        }
                        setIsMoveToModalVisible(false);
                    });
                } else {
                    authHelper.logout();
                }
            });
        }
    }

    return (
        // <div>Files</div>

        <div className="root">
            <Spin size="large" spinning={ isLoading } delay="250">
                <Dragger { ...draggerProps }>
                    <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">
                        Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                        band files
                    </p>
                </Dragger>

                <span>Current location:&nbsp;&nbsp;</span>
                <Breadcrumb>
                    {
                        (dir && dir.parents.length > 0) ? (
                            dir.parents.map((item) => {
                                return <Breadcrumb.Item key={ item.name } onClick={ () => navTo(item.name) }><a>{ item.displayName }</a></Breadcrumb.Item>
                            })
                        ) : ''
                    }
                    {
                        (dir && dir.name)? (
                            <Breadcrumb.Item key={ dir.name } onClick={ () => navTo(dir.name) }><a>{ dir.displayName }</a></Breadcrumb.Item>
                        ) : '' // console.log(dir)
                    }
                </Breadcrumb>

                {/* {
                    selectedRowKeys.map((item) => {
                        return <div key={ item }>{ item }</div>
                    }) 
                } */}

                <Divider />

                <Button onClick={ () => initNewDirectoryModal() } ><Icon type="folder-add" />New Folder</Button>
                <Button onClick={ () => selectedRowKeys.length ? initMoveToModal() : '' }><Icon type="export" />Move to ...</Button>
                <Button onClick={ () => dropObjects() }><Icon type="delete" />Drop</Button>

                <Table rowSelection={ rowSelection } rowKey="name" pagination={ false } dataSource={ listArr(dir) } columns={ columns } />

                <Modal visible={ isVideoModalVisible } maskStyle={{ background: 'rgba(0, 0, 0, 0.85)' }} width={ '80%' } centered={ true } destroyOnClose={ true } closable={ false } footer={ null } onCancel={ () => { setIsVideoModalVisible(false) } }>
                    <DPlayer
                        options={{
                            lang: 'en',
                            video: { url: mediaURL }
                        }}
                        onLoad={ bindDP }
                    />
                </Modal>

                <Modal visible={ isEditDisplayNameModalVisible } title={ `Change "${ displayNameModalDisplayName.lastIndexOf('.') > 0 ? displayNameModalDisplayName.slice(0, displayNameModalDisplayName.lastIndexOf('.')) : displayNameModalDisplayName }" to` } maskStyle={{ background: 'rgba(0, 0, 0, 0.85)' }} centered={ true } destroyOnClose={ true } maskClosable={ false } closable={ false } footer={ null } onCancel={ () => { setIsEditDisplayNameModalVisible(false) } }>
                    <Input value={ displayNameModalValue } onChange={ (e) => setDisplayNameModalValue(e.target.value) } />
                    <div style={{ textAlign: 'right' }}>
                        <Button type="primary" onClick={ () => editDisplayName(displayNameModalName, displayNameModalValue).then((res) => setIsEditDisplayNameModalVisible(false)) }>Confirm</Button>
                        <Button type="danger" onClick={ () => setIsEditDisplayNameModalVisible(false) }>Cancel</Button>
                    </div>
                </Modal>

                <Modal visible={ isDirectoryModalVisible } title="Create Folder..." maskStyle={{ background: 'rgba(0, 0, 0, 0.85)' }} centered={ true } destroyOnClose={ true } maskClosable={ false } closable={ false } footer={ null } onCancel={ () => { setIsVideoModalVisible(false) } }>
                    <Input value={ directoryModalValue } onChange={ (e) => setDirectoryModalValue(e.target.value) } />
                    <div style={{ textAlign: 'right' }}>
                        <Button type="primary" onClick={ () => createNewDirectory(dir, directoryModalValue).then((res) => setIsDirectoryModalVisible(false) ) }>Confirm</Button>
                        <Button type="danger" onClick={ () => setIsDirectoryModalVisible(false) }>Cancel</Button>
                    </div>
                </Modal>

                <Modal visible={ isMoveToModalVisible } title="Move to..." maskStyle={{ background: 'rgba(0, 0, 0, 0.85)' }} centered={ true } destroyOnClose={ true } maskClosable={ false } closable={ false } footer={ null } onCancel={ () => { setIsMoveToModalVisible(false) } }>
                    <Tree switcherIcon={ <Icon type="down" /> } expandedKeys={ moveToModalExpandedKeys } selectedKeys={ moveToModalValues } showLine={ true } showIcon={ false } onSelect={ (selectedKeys, info) => setMoveToModalValues(selectedKeys) } loadData={ onLoadData } onExpand={ (expandedKeys) => setMoveToModalExpandedKeys([...expandedKeys]) } onLoad={ (loadedKeys) => console.log(loadedKeys) } >
                        {
                            renderTreeNodes(dirTreeData)
                        }
                    </Tree>
                    <div style={{ textAlign: 'right' }}>
                        <Button type="primary" onClick={ () => moveObjects() }>Confirm</Button>
                        <Button type="danger" onClick={ () => setIsMoveToModalVisible(false) }>Cancel</Button>
                    </div>
                </Modal>
            </Spin>
        </div>
    
    );
}

export default Files;