import { observable, computed, action } from 'mobx';
import { Users } from '../api/api'; 

class UsersStore {
  @observable curPage = [];
  @observable curPageNum = 1;
  @observable pageLimit = 10;
  @observable totalCount = 0;

  @observable editing = false;

  @observable currentUser = {
    isNew: false,
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleId: ''
  }

  @observable roles = [];

  @computed get curOffset() {
    return (this.curPageNum - 1) * this.pageLimit;
  }

  @computed get totalPages() {
    return Math.ceil(this.totalCount / this.pageLimit);
  }

  @action reloadPage = (getAll) => {
    return this.loadPage(this.curPageNum, getAll);
  }

  @action loadPage = (pageNum = 1) => {
    this.setCurrentPageNum(pageNum);

    return Users
      .getUsers(this.curOffset, this.pageLimit)
      .then(response => response.body.users)
      .then(({ count, rows }) => {
        this.setTotalCount(count);
        this.setCurPage(rows);
      });
  }

  @action setTotalCount = (value) => this.totalCount = value;
  
  @action setCurrentPageNum = (value) => this.curPageNum = value;

  @action setCurPage = (rows) => {
    this.curPage = rows;
  }

  @action loadNextPage = () => {
    return this.loadPage(++this.curPageNum);
  }

  @action loadPrevPage = () => {
    return this.loadPage(--this.curPageNum);
  }

  @action resetUser = () => {
    this.currentUser = {
      isNew: true,
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roleId: ''
    }
  }

  @action addUser = () => {
    return Users
      .addUser({ user: this.currentUser})
      .then(this.resetUser)
  }

  @action updateUser = () => {
    return Users
      .updateUser({ user: this.currentUser})
      .then(this.resetUser)
  }

  @action getRoles = () => {
    return Users
      .getRoles()
      .then(response => response.body.roles)
      .then(roles => {
        this.roles = roles.map(role => {
          return {
            text: role.name,
            value: role.id
          }
        })
      });
  }

  @action removeUser = (id) => {
    return Users
      .removeUser(id)
  }
}

export default new UsersStore();