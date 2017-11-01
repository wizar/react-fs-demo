import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'mobx-react';

import './index.css';
import App from './components/App';

import authStore from './stores/authStore';
import commonStore from './stores/commonStore';
import recordsStore from './stores/recordsStore';
import reportsStore from './stores/reportsStore';
import usersStore from './stores/usersStore';

const stores = {
  authStore,
  commonStore,
  recordsStore,
  reportsStore,
  usersStore
}

ReactDOM.render(
  <Provider {...stores} >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
  , document.getElementById('root'));
