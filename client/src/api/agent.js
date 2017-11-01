import superagent from 'superagent';

export default function(method, url) {
  const token = window.localStorage.getItem('app_token');
  return superagent(method, url).set('Authorization', `JWT ${token}`);
}