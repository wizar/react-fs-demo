import { observable, action } from 'mobx';
import { Auth } from '../api/api'; 
import commonStore from './commonStore';

class AuthStore {
  @observable error = '';
  @observable loading = false;
  @observable authorized = false;
  
  @observable data = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  }

  @action signup = () => {
    this.loading = true;
    this.error = null;

    return Auth
      .signup(this.data)
      .then(this.login)
  }

  @action login = () => {
    this.loading = true;
    this.error = null;

    return Auth
      .login(this.data.email, this.data.password)
      .then(response => response.body.token)
      .then(commonStore.setToken)
      .then(() => {
        this.setLoading(false);
        this.setAuthorized(true);
      })
      .then(commonStore.getCurrentUser);
  }

  @action reset = () => {
    this.error = null;
    this.loading = false;
    this.data.email = '';
    this.data.password = '';
  }

  @action logout = () => {
    this.setAuthorized(false);
    commonStore.removeToken();
  }

  @action setLoading = (value) => this.loading = value;
  @action setAuthorized = (value) => this.authorized = value;

}

const authStore = new AuthStore();

export default authStore;