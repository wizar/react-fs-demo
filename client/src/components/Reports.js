import React, { Component } from 'react';
import { Table, TableRow, TableCell } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react';
import hash from 'object-hash';

@inject('reportsStore')
@observer
class Reports extends Component {
  constructor(props, context) {
    super(props, context);

    this._columns = [
      'week',
      'distance',
      'speed'
    ];
  }

  componentWillMount() {
    this.props.reportsStore.loadReports();
  }

  handleSort = () => {
    this.props.reportsStore.changeSort();
    this.props.reportsStore.loadReports();
  }

  render() {
    const { reports } = this.props.reportsStore;
    return (
      <div>
        <Table celled sortable>
        <Table.Header>
            <Table.Row>
              <Table.HeaderCell sorted={this.props.reportsStore.sortDirection} onClick={this.handleSort}>Week</Table.HeaderCell>
              <Table.HeaderCell>Average distance</Table.HeaderCell>
              <Table.HeaderCell>Average speed (Km/h)</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {reports.map(row => 
              <TableRow key={hash(row)}>
                {this._columns.map(col => {
                  return <TableCell key={hash(row) + '_' + col} content={row[col]} />
                })}
              </TableRow>
            )}
          </Table.Body>


        </Table>
      </div>
    );
  }
}

export default Reports;