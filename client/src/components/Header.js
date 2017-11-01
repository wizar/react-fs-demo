import React, { Component } from 'react';
import { Menu, Form, Button, Input } from 'semantic-ui-react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';

@inject('authStore')
@observer
class LoginInline extends Component {
  render() {
    if (!this.props.authStore.authorized) {
      return (
        <Menu.Item>
          <Form>
            <Form.Group inline>
              <Form.Input>
                <Input type="email" placeholder="Email" onChange={this.props.onEmailChange} />
              </Form.Input>
              <Form.Input>
                <Input type="password" placeholder="Passwrod" onChange={this.props.onPasswordChange} />
              </Form.Input>
              <Button onClick={this.props.onLogin}>Login</Button>
            </Form.Group>
          </Form>
        </Menu.Item>
      );
    }
    
    return (null);
  }
}

@inject('authStore', 'commonStore')
@observer
class LogoutInline extends Component {
  render() {
    if (this.props.authStore.authorized) {
      return (
        <Menu.Item>
          <Button onClick={this.props.onLogout}>Logout</Button>
        </Menu.Item>
      )
    }
    
    return (null);
  }
}

@inject('authStore', 'commonStore')
@withRouter
class Header extends Component {

  handleEmailChange = (evt) => {
    this.props.authStore.data.email = evt.target.value
  };

  handlePasswordChange = (evt) => {
    this.props.authStore.data.password = evt.target.value
  };

  handleLogin = () => {
    this.props.authStore
      .login()
      .then(() => this.props.authStore.reset())
      .then(() => this.props.history.push('/records'));
  };

  handleLogout = () => {
    this.props.authStore.logout();
    this.props.history.push('/');
  }

  componentWillMount() {
    if (this.props.commonStore.token) {
      this.props.authStore.setAuthorized(true);
      this.props.commonStore
        .getCurrentUser()
        .then(() => {
          if (this.props.location.pathname === '/') {
            this.props.history.push('/records');
          }
        });

    } else {
      this.props.history.push('/');
    }
  }

  render() {
    return (
      <Menu className="header">
        <Menu.Item header>React demo app</Menu.Item>
        <Menu.Menu position='right'>
          <LoginInline onEmailChange={this.handleEmailChange}
                       onPasswordChange={this.handlePasswordChange}
                       onLogin={this.handleLogin} />

          <LogoutInline onLogout={this.handleLogout} />
        </Menu.Menu>
      </Menu>
    );
  }
}

export default Header;