import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Tabs } from 'antd';
import { ajaxHelper, authHelper } from '../../Utils';
// import SettingsContext from '../../Contexts/SettingsContext';

const { TabPane } = Tabs;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, module: props.item };
    }

    static getDerivedStateFromError(error) {
        // 更新 state 以至於下一個 render 會顯示 fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // 你也可以把錯誤記錄到一個錯誤回報系統服務
        // logErrorToMyService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // 你可以 render 任何客製化的 fallback UI
            
            return <div>Error loading "{ this.state.module }" module </div>;
        }

        return this.props.children;
    }
}

const Settings = () => {
    const [rawSettingTree, setRawSettingTree] = useState(null);
    const [settingTree, setSettingTree] = useState(null);

    console.log('init');

    useEffect(() => {
        console.log('callback 1');
        authHelper.renewToken()
            .then((result) => {
                if (result) {
                    ajaxHelper.post_retry('/api/user/settings').then(async (res) => {
                        if (res.status === 200 && res.data) {
                            const data = res.data;
                            // setRawSettingTree(await renderTree(data.rawSettingTree));
                            setRawSettingTree(data.rawSettingTree);
                        }
                    });
                } else {
                    authHelper.logout();
                }
            }
            );
    }, []);

    useEffect(() => {
        if (rawSettingTree) {
            const _settingTree = [];
            rawSettingTree.map((item) => {
                const Component = lazy(() => import(`../Setting/${item.title}.js`));
                _settingTree.unshift({
                    title: item.title,
                    key: item.title,
                    Component
                });
            });

            setSettingTree(_settingTree);
        }
    }, [ rawSettingTree ]);


    const renderTree = () => {
        if(settingTree) {
            return (
                <Tabs>
                    {
                        settingTree.map((item, idx) => {
                                return (
                                        <TabPane tab={ item.title } key={ item.key }>
                                            {/* <SettingsContext.Provider value={{ settingTree[idx] }}> */}
                                                <ErrorBoundary item={ item.title }>
                                                    <Suspense fallback={<div>loading...</div>}>
                                                        <item.Component></item.Component>
                                                    </Suspense>
                                                </ErrorBoundary>
                                            {/* </SettingsContext.Provider> */}
                                        </TabPane>
                                    
                                )
                        })
                    }
                </Tabs>
            );
        } else {
            return '';
        }

        // if (rawSettingTree) {
        //     // return rawSettingTree.map((item) => {
        //     //     const Component = lazy(() => import(`../Setting/${item.title}.js`);
        //     //     return <div key={ item.title }><ErrorBoundary item={ item.title }><Suspense fallback={<div>loading...</div>}><Component></Component></Suspense></ErrorBoundary></div>;
        //     // });

        //     return (
        //         <SettingsContext.Provider value={{ rawSettingTree, setRawSettingTree }}>
        //             <Tabs>
        //                 {
        //                     rawSettingTree.map((item) => {
        //                         const Component = lazy(() => import(`../Setting/${item.title}.js`));
        //                             return (
        //                                 <TabPane tab={ item.title } key={ item.title }>
        //                                     <ErrorBoundary item={ item.title }>
        //                                         <Suspense fallback={<div>loading...</div>}>
        //                                             <Component></Component>
        //                                         </Suspense>
        //                                     </ErrorBoundary>
        //                                 </TabPane>
        //                             )
        //                     })
        //                 }
        //             </Tabs>
        //         </SettingsContext.Provider>
        //     );
        // } else {
        //     return ''
        // }
    }

    return (
        <>
            {
                renderTree()
            }
        </>
    );
}

export default Settings;