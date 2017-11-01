import React, { Component } from 'react';
import { Button, Modal, Form } from 'semantic-ui-react';
import { inject, observer } from 'mobx-react';
import InputMask from 'react-input-mask';

@inject('recordsStore', 'commonStore')
@observer
class RecordModal extends Component {

  openRecordModal = () => {
    this.props.recordsStore.resetRecord();
    this.props.recordsStore.setEditing(true);
  }

  closeRecordModal = () => {
    this.props.recordsStore.resetRecord();
    this.props.recordsStore.setEditing(false);
  }

  handleEmailChange = (evt) => {
    this.props.recordsStore.setCurrentEmail(evt.target.value);
  }

  handleDateChange = (evt) => {
    this.props.recordsStore.setCurrentDate(evt.target.value);
  }

  handleDistanceChange = (evt) => {
    this.props.recordsStore.setCurrentDistance(evt.target.value);
  }

  handleTimeChange = (evt) => {
    this.props.recordsStore.setCurrentTime(evt.target.value);
  }

  handleSubmitRecord = (evt) => {
    evt.preventDefault();
    let actionPromise;

    if (this.props.recordsStore.currentRecord.isNew) {
      actionPromise = this.props.recordsStore.addRecord();
    } else {
      actionPromise = this.props.recordsStore.updateRecord();
    }

    actionPromise
      .then(this.closeRecordModal)
      .then(() => this.props.recordsStore.reloadPage(this.props.allowChangeUser))
  }

  render() {
    const { isNew, email, date, distance, time } = this.props.recordsStore.currentRecord;
    const { isAdmin } = this.props.commonStore.user;
    const title = isNew ? 'Add new record' : 'Edit record';
    return (
      <div>
        <Button onClick={this.openRecordModal}>Add new record</Button>
        <Modal size='tiny'
               open={this.props.recordsStore.editing}
               onClose={this.closeRecordModal}
               closeIcon={true}>
          <Modal.Header>{title}</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmitRecord} >
              {(() => {
                if (this.props.allowChangeUser && isAdmin) {
                  return <Form.Input
                            fluid
                            type='email'
                            placeholder='Email'
                            value={email}
                            required
                            onChange={this.handleEmailChange}
                          />
                }
              })()}
              <Form.Input
                fluid
                type='date'
                value={date}
                required
                onChange={this.handleDateChange}
              />
              <Form.Input
                fluid
                type='number'
                placeholder='Distance'
                value={distance}
                required
                onChange={this.handleDistanceChange}
              />
              <Form.Input
                fluid
                placeholder='Time'
                control={InputMask}
                mask='99:99:99'
                value={time}
                required
                onChange={this.handleTimeChange}
              />
              <Button type='submit'>Submit</Button>
            </Form>
          </Modal.Content>
        </Modal>
      </div>
    )
  }
}

export default RecordModal;