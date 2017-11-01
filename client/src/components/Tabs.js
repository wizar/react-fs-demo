import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

@inject('authStore', 'commonStore')
@withRouter
@observer
class Tabs extends Component {

  handleRecordsClick = () => {
    this.props.history.push('/records');
    console.log(this.props.location.pathname);
  }

  handleReportsClick = () => {
    this.props.history.push('/reports');
  }

  handleUsersClick = () => {
    this.props.history.push('/users');
  }

  handleAllRecordsClick = () => {
    this.props.history.push('/all-records');
  }

  render() {
    if (this.props.authStore.authorized) {
      const { location, commonStore } = this.props;
      const additionalTabs = [];

      if (commonStore.user.isManager) {
        additionalTabs.push(<Menu.Item name='users' active={location.pathname === '/users'} onClick={this.handleUsersClick} />);
      }

      if (commonStore.user.isAdmin) {
        additionalTabs.push(<Menu.Item name='all-records' active={location.pathname === '/all-records'} onClick={this.handleAllRecordsClick} />);
      }

      return (
        <div>
          <Menu pointing secondary>
            <Menu.Item name='records' active={location.pathname === '/records'} onClick={this.handleRecordsClick} />
            <Menu.Item name='reports' active={location.pathname === '/reports'} onClick={this.handleReportsClick} />
            {additionalTabs}
          </Menu>
        </div>
      );
    }

    return (null);
  }
}

export default Tabs;