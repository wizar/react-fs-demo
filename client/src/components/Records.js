import React, { Component } from 'react';
import { Icon, Menu, Table, TableRow, TableCell, Button, Modal, Header } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react';
import RecordModal from './RecordModal';
import moment from 'moment';

@inject('recordsStore')
@observer
class Records extends Component {
  constructor(props, context) {
    super(props, context);
    this._columns = [];

    if (this.props.extendedView) {
      this._columns.push('email');
    } 

    this._columns = this._columns.concat([
      'date',
      'distance',
      'time',
      'avgSpeed'
    ]);

    this.state = {
      removeModalOpen: false
    }
  }

  componentWillMount() {
    this.props.recordsStore.loadPage(1, this.props.extendedView);
  }

  onRowClick = ({ id, email, date, distance, time }) => {
    this.props.recordsStore.setCurrentNew(false);
    this.props.recordsStore.setCurrentId(id);
    this.props.recordsStore.setCurrentEmail(email);
    this.props.recordsStore.setCurrentDate(moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD'));
    this.props.recordsStore.setCurrentDistance(distance);
    this.props.recordsStore.setCurrentTime(time);

    this.props.recordsStore.setEditing(true);
  }

  openRemoveModal = (row) => {
    this.setState({
      removeModalOpen: true,
      currentRecord: row
    });
  }

  closeRemoveModal = () => {
    this.setState({
      removeModalOpen: false,
      currentRecord: undefined
    });
  }

  removeRecord = () => {
    this.props.recordsStore
      .removeRecord(this.state.currentRecord.id)
      .then(() => this.props.recordsStore.reloadPage(this.props.extendedView))
      .then(() => {
        this.setState({
          removeModalOpen: false,
          currentRecord: undefined
        });
      });
  }

  handleSort = () => {
    this.props.recordsStore.changeSort();
    this.props.recordsStore.reloadPage(this.props.extendedView);
  }

  render() {
    const data = this.props.recordsStore;
    const paginator = [];
    let footerWidth = 5;
    let extendCol;

    for (let i = 1; i <= data.totalPages; i++) {
      paginator.push(<Menu.Item as='a' onClick={data.loadPage.bind(data, i, this.props.extendedView)} active={data.curPageNum === i}>{i}</Menu.Item>);
    }

    if (this.props.extendedView) {
      extendCol = <Table.HeaderCell>Email</Table.HeaderCell>;
      footerWidth = 6;
    }

    return (
      <div className="records-view">
        <RecordModal allowChangeUser={this.props.extendedView} />
        
        <Modal basic size='small' open={this.state.removeModalOpen}>
          <Header icon='trash' content='Remove record' />
          <Modal.Content>
            <p>Are you sure you want to delete this record?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color='red' inverted onClick={this.closeRemoveModal}>
              <Icon name='remove' /> No
            </Button>
            <Button color='green' inverted onClick={this.removeRecord}>
              <Icon name='checkmark' /> Yes
            </Button>
          </Modal.Actions>
        </Modal>

        <Table celled selectable sortable>
          <Table.Header>
            <Table.Row>
              {extendCol}
              <Table.HeaderCell sorted={this.props.recordsStore.sortDirection} onClick={this.handleSort}>Date</Table.HeaderCell>
              <Table.HeaderCell>Distance</Table.HeaderCell>
              <Table.HeaderCell>Time</Table.HeaderCell>
              <Table.HeaderCell>Average speed (Km/h)</Table.HeaderCell>
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
              <Table.HeaderCell colSpan={footerWidth}>
                <Menu floated='right' pagination>
                  <Menu.Item as='a' icon onClick={data.loadPrevPage.bind(data, this.props.extendedView)} disabled={data.curPageNum === 1}>
                    <Icon name='left chevron' />
                  </Menu.Item>
                  
                  {paginator}

                  <Menu.Item as='a' icon onClick={data.loadNextPage.bind(data, this.props.extendedView)} disabled={data.curPageNum === data.totalPages}>
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

export default Records;