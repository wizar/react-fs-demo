import React, { Component } from 'react';

import Header from './Header';
import Main from './Main';

//styles
import 'toastr/package/build/toastr.min.css';
import 'semantic-ui-css/semantic.min.css';
import './App.css';

class App extends Component {

  render() {
    return (
      <div className="app">
        <Header />
        <Main />
      </div>
    );
  }
}

export default App;
