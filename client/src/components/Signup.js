import React, { Component } from 'react';
import { Grid, Header, Form, Button } from 'semantic-ui-react';
import { inject } from 'mobx-react';

import './Signup.css';

@inject('authStore')
class Signup extends Component {

  handleFirstNameChange = (evt) => {
    this.props.authStore.data.firstName = evt.target.value;
  }

  handleSurnameChange = (evt) => {
    this.props.authStore.data.lastName = evt.target.value;
  }

  handleEmailChange = (evt) => {
    this.props.authStore.data.email = evt.target.value;
  }

  handlePasswordChange = (evt) => {
    this.props.authStore.data.password = evt.target.value;
  }

  handleSubmit = (evt) => {
    evt.preventDefault();
    this.props.authStore.signup()
      .then(() => this.props.history.push('/records'));
  }

  render() {
    return (
      <div className='signup-form'>
        <Grid
          textAlign='center'
          className='signup-form__grid'
          style={{ height: '100%' }}
          verticalAlign='middle'
        >
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as='h2' color='teal' textAlign='center'>
              Create an account
            </Header>
            <Form size='large' onSubmit={this.handleSubmit}>
              <Form.Input
                fluid
                placeholder='First name'
                required
                onChange={this.handleFirstNameChange}
              />
              <Form.Input
                fluid
                placeholder='Surname'
                required
                onChange={this.handleSurnameChange}
              />
              <Form.Input
                fluid
                placeholder='E-mail address'
                required
                onChange={this.handleEmailChange}
              />
              <Form.Input
                fluid
                placeholder='Password'
                type='password'
                required
                onChange={this.handlePasswordChange}
              />

              <Button color='teal' fluid size='large'>Create an account</Button>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default Signup;