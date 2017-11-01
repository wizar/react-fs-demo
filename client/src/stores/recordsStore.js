import { observable, computed, action } from 'mobx';
import { Records } from '../api/api';
import moment from 'moment';

class RecordsStore {
  @observable curPage = [];
  @observable curPageNum = 1;
  @observable pageLimit = 10;
  @observable totalCount = 0;

  @observable editing = false;

  @observable sortDirection = 'descending';

  @observable currentRecord = {
    isNew: true,
    id: '',
    email: '',
    date: '',
    distance: '',
    time: ''
  }

  @action setEditing = (value) => {
    this.editing = value;
  }

  @action setCurrentId = (value) => {
    this.currentRecord.id = value;
  }

  @action setCurrentEmail = (value) => {
    this.currentRecord.email = value;
  }

  @action setCurrentDate = (value) => {
    this.currentRecord.date = value;
  }

  @action setCurrentTime = (value) => {
    this.currentRecord.time = value;
  }

  @action setCurrentDistance = (value) => {
    this.currentRecord.distance = value;
  }

  @action setCurrentNew = (value) => {
    this.currentRecord.isNew = value;
  }

  @computed get curOffset() {
    return (this.curPageNum - 1) * this.pageLimit;
  }

  @computed get totalPages() {
    return Math.ceil(this.totalCount / this.pageLimit);
  }

  @computed get directionShort() {
    if (this.sortDirection === 'descending') {
      return 'DESC';
    }

    return 'ASC';
  }

  @action changeSort = () => {
    this.sortDirection = this.sortDirection === 'ascending' ? 'descending' : 'ascending';
  }

  @action reloadPage = (getAll) => {
    return this.loadPage(this.curPageNum, getAll);
  }

  @action loadPage = (pageNum = 1, getAll) => {
    let recordsPromise;
    this.setCurrentPageNum(pageNum);

    if (getAll) {
      recordsPromise = Records.getAllRecords(this.curOffset, this.pageLimit, this.directionShort);
    } else {
      recordsPromise = Records.getRecords(this.curOffset, this.pageLimit, this.directionShort);
    }

    return recordsPromise
      .then(response => response.body.records)
      .then(({ count, rows }) => {
        this.setTotalCount(count);
        this.setCurPage(rows);
      });
  }

  @action loadNextPage = (getAll) => {
    return this.loadPage(++this.curPageNum, getAll);
  }

  @action loadPrevPage = (getAll) => {
    return this.loadPage(--this.curPageNum, getAll);
  }

  @action setTotalCount = (value) => this.totalCount = value;

  @action setCurrentPageNum = (value) => this.curPageNum = value;

  @action setCurPage = (rows) => {
    this.curPage = rows.map(record => {
      const userEmail = record.User && record.User.email || '';
      return {
        id: record.id,
        date: moment(record.date).format('DD.MM.YYYY'),
        distance: record.distance,
        time: moment.utc(record.time * 1000).format('HH:mm:ss'),
        avgSpeed: ((record.distance / 1000) / (record.time / (60 * 60))).toFixed(2),
        email: userEmail
      }
    });
  }

  @action resetRecord = () => {
    this.currentRecord = {
      isNew: true,
      email: '',
      date: '',
      distance: '',
      time: ''
    }
  }

  @action addRecord = () => {
    return Records
      .addRecord({
        email: this.currentRecord.email,
        date: moment(this.currentRecord.date).toISOString(),
        distance: +this.currentRecord.distance,
        time: moment.duration(this.currentRecord.time).asSeconds()
      })
      .then(this.resetRecord);
  }

  @action updateRecord = () => {
    return Records
      .editRecord(this.currentRecord.id, {
        email: this.currentRecord.email,
        date: moment(this.currentRecord.date).toISOString(),
        distance: +this.currentRecord.distance,
        time: moment.duration(this.currentRecord.time).asSeconds()
      })
      .then(this.resetRecord)
  }

  @action removeRecord = (id) => {
    return Records
      .removeRecord(id);
  }

}

export default new RecordsStore();