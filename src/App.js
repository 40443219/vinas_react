import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from 'react-router-dom';
import { Layout, Icon, Avatar, Menu, Popover, Row, Col } from 'antd';
import 'antd/dist/antd.css';
import './App.css';
import PrivateRoute from './Routes/PrivateRoute'; 
import { version } from '../package.json';
import Index from './Pages/User/Index'; 
import Dashboard from './Pages/User/Dashboard';
import Files from './Pages/User/Files';
import RecycleBin from './Pages/User/RecycleBin';
import Settings from './Pages/User/Settings';
import { authHelper } from './Utils';

const { Header, Content, Sider, Footer } = Layout;
const { SubMenu } = Menu;

const App = (props) => {
  const [hideSider, setHideSider] = useState(false);
  const [content, setContent] = useState('Content');
  const [user, setUser] = useState({
    userName: 'UnKnown',
    displayName: 'Unknown',
    roles: []
  });

  const [userCardDetail, setUserCardDatail] = useState((<div>Groups: 'UnKnown'</div>));

  useEffect(() => {
    const userInfo = authHelper.getUserInfo();
    if(userInfo) {
      setUser({
        userName: userInfo.username,
        displayName: userInfo.displayName,
        roles: [...userInfo.roles]
      });
    }
  }, []);

  useEffect(() => {
    setUserCardDatail((<div>Groups: { user.roles.map((role, idx) => <div key={ role.name }>{ idx + 1 }: { role.displayName }</div> ) }</div>));
  }, [user]);

  const handleMenuClick = (e) => {
    // setContent(e.item.props.children[1]);
  }

  return (
    <Router>
      <Layout>
        <Header className="header">
          <Row type="flex" align="middle" style={{ height: '100%'}}>
            <Col span={4}>
              <Icon type="menu" style={{ float: 'left', padding: '0 10px 0 0', fontSize: '24px', color: 'rgba(255, 255, 255, 0.65)' }} onClick={ () => setHideSider(!hideSider) }/>
              <Link to="/">
                <div className="logo">Vinas</div>
              </Link>
            </Col>
            <Col span={12}>
            </Col>
            <Col span={8}>
              <Row>
                <Col style={{ float: 'right' }}>
                  <Popover content={ userCardDetail } title={ <span> { user.displayName } <a onClick={ () => authHelper.logout(props.history) }>logout</a></span> }>
                    <div style={{ color: 'rgba(255, 255, 255, 0.65)'}}><Avatar size={32} icon="user" />&nbsp;&nbsp;{ user.userName }</div>
                  </Popover>
                </Col>
              </Row>
            </Col>
          </Row>
        </Header>
        <Layout>
          <Sider className="sider" collapsed={ hideSider } collapsedWidth={0}>
            <Menu mode="inline" theme="dark" onClick={ handleMenuClick }>
              <Menu.Item>
                <Link to="/user/dashboard">
                  <Icon type="dashboard" />
                  Dashboard
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to="/user/files">
                  <Icon type="folder" />
                  Files
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to="/user/media">
                  <Icon type="picture" />
                  Media
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to="/user/recycle-bin">
                  <Icon type="delete" />
                  Recycle bin
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to="/user/settings">
                  <Icon type="setting" />
                  Settings
                </Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Content className="content"
          >
            {/* {content} */}
            <PrivateRoute path="/" exact component={ Index } />
            <PrivateRoute path="/user" exact component={ Index } />
            <PrivateRoute path="/user/dashboard" component={ Dashboard } />
            <PrivateRoute path="/user/files" component={ Files } />
            <PrivateRoute path="/user/recycle-bin" component={ RecycleBin } />
            <PrivateRoute path="/user/settings" component={ Settings } />
          </Content>
        </Layout>
        <Layout>
          <Footer className="footer">
            Vinas React Client v{ version } - Powered By ISUCA148
          </Footer>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
