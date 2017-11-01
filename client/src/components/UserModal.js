import React, { Component } from 'react';
import { Button, Modal, Form, Dropdown } from 'semantic-ui-react';
import { inject, observer } from 'mobx-react';

@inject('usersStore')
@observer
class UserModal extends Component {
  handleEmailChange = evt => this.props.usersStore.currentUser.email = evt.target.value;
  handleFirstNameChange = evt => this.props.usersStore.currentUser.firstName = evt.target.value;
  handleLastNameChange = evt => this.props.usersStore.currentUser.lastName = evt.target.value;
  handlePasswordChange = evt => this.props.usersStore.currentUser.password = evt.target.value;
  handleRoleChange = (evt, data) => this.props.usersStore.currentUser.roleId = data.value;

  onAddNewUser = evt => {
    this.props.usersStore.resetUser();
    this.props.usersStore.editing = true;
  }

  closeModal = evt => {
    this.props.usersStore.resetUser();
    this.props.usersStore.editing = false;
  }

  handleSubmit = evt => {
    evt.preventDefault();
    let actionPromise;

    if (this.props.usersStore.currentUser.isNew) {
      actionPromise = this.props.usersStore.addUser();
    } else {
      actionPromise = this.props.usersStore.updateUser();
    }

    actionPromise
      .then(this.closeModal)
      .then(this.props.usersStore.reloadPage)
  }

  render() {
    const { isNew, email, firstName, lastName, password, roleId } = this.props.usersStore.currentUser;
    const { roles } = this.props.usersStore;
    const title = isNew ? 'Add new user' : 'Edit user';

    return (
      <div>
        <Button onClick={this.onAddNewUser}>Add new user</Button>
        <Modal size='tiny'
               open={this.props.usersStore.editing}
               onClose={this.closeModal}
               closeIcon={true}>
          <Modal.Header>{title}</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit} >
              <Form.Input
                fluid
                type='email'
                placeholder='Email'
                value={email}
                required
                onChange={this.handleEmailChange}
              />
              <Form.Input
                fluid
                value={firstName}
                placeholder='First name'
                required
                onChange={this.handleFirstNameChange}
              />
              <Form.Input
                fluid
                value={lastName}
                placeholder='Last name'
                required
                onChange={this.handleLastNameChange}
              />
              <Form.Input
                fluid
                value={password}
                type='password'
                placeholder='Password'
                required={isNew}
                onChange={this.handlePasswordChange}
              />
              <Form.Input
                fluid
                value={roleId}
                control={Dropdown}
                placeholder='Select role'
                selection
                options={roles}
                required
                onChange={this.handleRoleChange}
              />
              <Button type='submit'>Submit</Button>
            </Form>
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

export default UserModal;