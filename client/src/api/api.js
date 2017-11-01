import superagent from 'superagent';
import commonStore from '../stores/commonStore';
import authStore from '../stores/authStore';
import toastr from 'toastr';

const tokenInject = (req) => {
  req.set('Authorization', `JWT ${commonStore.token}`);
}

const errorHandler = ({ response, status }) => {
  if (status === 401) {
    toastr['error']('Wrong password or email!');
    return authStore.logout();
  }

  if (response && response.body && response.body.error) {
    toastr['error'](response.body.error);
  }
}

const requestHelper = {
  get: (path, data) => 
    superagent
      .get(`/api${path}`)
      .query(data)
      .use(tokenInject)
      .on('error', errorHandler),

  post: (path, data) =>
    superagent
      .post(`/api${path}`)
      .send(data)
      .use(tokenInject)
      .on('error', errorHandler),

  put: (path, data) =>
    superagent
      .put(`/api${path}`)
      .send(data)
      .use(tokenInject)
      .on('error', errorHandler),

  delete: (path) =>
    superagent
      .delete(`/api${path}`)
      .use(tokenInject)
      .on('error', errorHandler)
}

const Auth = {
  signup: (data) => requestHelper.post('/register', data),
  login: (email, password) => requestHelper.post('/login', { email, password }),
  current: () => requestHelper.get('/user')
}

const Records = {
  getRecords: (offset, limit = 50, sort = 'DESC') => requestHelper.get('/records', { offset, limit, sort }),
  addRecord: (data) => requestHelper.put('/records', data),
  editRecord: (id, data) => requestHelper.post(`/records/${id}`, data),
  getAllRecords: (offset, limit = 50, sort = 'DESC') => requestHelper.get('/records/all', {offset, limit, sort}),
  removeRecord: (id) => requestHelper.delete(`/records/${id}`)
}

const Reports = {
  getReports: (sortDirection = 'DESC') => requestHelper.get('/report', {sortDirection})
}

const Users = {
  getUsers: (offset, limit = 50) => requestHelper.get('/users', { offset, limit }),
  addUser: (data) => requestHelper.put('/user', data),
  updateUser: (data) => requestHelper.post(`/user/${data.user.id}`, data),
  getRoles: () => requestHelper.get('/roles'),
  removeUser: (id) => requestHelper.delete(`/user/${id}`)
}

export { Auth, Records, Reports, Users };