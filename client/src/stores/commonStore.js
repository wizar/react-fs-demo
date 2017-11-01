import { observable, action } from 'mobx';
import { Auth } from '../api/api'; 

class CommonStore {
  @observable token = localStorage.getItem('app_token');
  @observable user = {};
  @observable isAdmin = false;
  @observable isManager = false;

  @action setToken = token => {
    this.token = token;
    localStorage.setItem('app_token', token);
  }

  @action removeToken = () => {
    localStorage.removeItem('app_token');
  }

  @action getCurrentUser = () => {
    return Auth
      .current()
      .then(response => {
        this.user = response.body;
      });
  }
}

const commonStore = new CommonStore();

export default commonStore;