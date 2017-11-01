import { observable, computed, action } from 'mobx';
import { Reports } from '../api/api'; 

class ReportsStore {
  @observable reports = [];
  @observable sortDirection = 'descending';

  @computed get directionShort() {
    if (this.sortDirection === 'descending') {
      return 'DESC';
    }

    return 'ASC';
  }

  @action changeSort = () => {
    this.sortDirection = this.sortDirection === 'ascending' ? 'descending' : 'ascending';
  }

  @action setReports = (rows) => {
    this.reports = rows.map(report => {
      return {
        week: `${report.year}/${report.week}`,
        distance: (+report.distance).toFixed(2),
        speed: (+report.speed).toFixed(2)
      }
    })
  }

  @action loadReports = () => {
    Reports
      .getReports(this.directionShort)
      .then(response => response.body.report)
      .then(this.setReports);
  }
}

export default new ReportsStore();