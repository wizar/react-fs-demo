import React, { Component } from 'react';
import { Icon, Menu, Table, TableRow, TableCell, Button, Modal, Header } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react';
import UserModal from './UserModal';

@inject('usersStore')
@observer
class Users extends Component {
  constructor(props, context) {
    super(props, context);

    this._columns = [
      'email',
      'firstName',
      'lastName'
    ];

    this.state = {
      removeModalOpen: false
    }
  }

  onRowClick = ({ id, firstName, lastName, email, roleId }) => {
    this.props.usersStore.currentUser = {
      isNew: false,
      id,
      firstName,
      lastName,
      email,
      roleId
    }

    this.props.usersStore.editing = true;
  }

  componentWillMount() {
    this.props.usersStore.loadPage();
    this.props.usersStore.getRoles();
  }

  openRemoveModal = (row) => {
    this.setState({
      removeModalOpen: true,
      currentUser: row
    });
  }

  closeRemoveModal = () => {
    this.setState({
      removeModalOpen: false,
      currentUser: undefined
    });
  }

  removeUser = () => {
    this.props.usersStore
      .removeUser(this.state.currentUser.id)
      .then(() => this.props.usersStore.reloadPage())
      .then(() => {
        this.setState({
          removeModalOpen: false,
          currentUser: undefined
        });
      });
  }

  render() {
    const data = this.props.usersStore;
    const paginator = [];

    for (let i = 1; i <= data.totalPages; i++) {
      paginator.push(<Menu.Item as='a' onClick={data.loadPage.bind(data, i)} active={data.curPageNum === i}>{i}</Menu.Item>);
    }

    return (
      <div>
        <UserModal/>

        <Modal basic size='small' open={this.state.removeModalOpen}>
          <Header icon='trash' content='Remove user' />
          <Modal.Content>
            <p>Are you sure you want to delete this user?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color='red' inverted onClick={this.closeRemoveModal}>
              <Icon name='remove' /> No
            </Button>
            <Button color='green' inverted onClick={this.removeUser}>
              <Icon name='checkmark' /> Yes
            </Button>
          </Modal.Actions>
        </Modal>

        <Table celled selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>First name</Table.HeaderCell>
              <Table.HeaderCell>Last name</Table.HeaderCell>
              <Table.HeaderCell>Remove</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {data.curPage.map(row => 
              <TableRow key={row.id} onDoubleClick={this.onRowClick.bind(this, row)}>
                {this._columns.map(col => {
                  return <TableCell key={row.id + '_' + col} content={row[col]} />
                })}
                <TableCell key={row.id + '_remove'} width='1' textAlign='center'>
                  <Icon link name='trash' size='big' onClick={this.openRemoveModal.bind(this, row)} />
                </TableCell>
              </TableRow>
            )}
          </Table.Body>

          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan='5'>
                <Menu floated='right' pagination>
                  <Menu.Item as='a' icon onClick={data.loadPrevPage} disabled={data.curPageNum === 1}>
                    <Icon name='left chevron' />
                  </Menu.Item>
                  
                  {paginator}

                  <Menu.Item as='a' icon onClick={data.loadNextPage} disabled={data.curPageNum === data.totalPages}>
                    <Icon name='right chevron' />
                  </Menu.Item>
                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </div>
    );
  }
}

export default Users;