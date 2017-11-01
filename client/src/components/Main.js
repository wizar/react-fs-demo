import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Container, Segment } from 'semantic-ui-react';

import Signup from './Signup';
import Records from './Records';
import Reports from './Reports';
import Users from './Users';
import Tabs from './Tabs';

import './Main.css';

class Main extends Component {
  render() {
    return (
      <div className='page-container'>
        <Container>
          <Tabs />
          <Segment>
            <Switch>
              <Route exact path='/' component={Signup}/>
              <Route path='/records' component={Records}/>
              <Route path='/reports' component={Reports}/>
              <Route path='/users' component={Users}/>
              <Route path='/all-records' render={() => (<Records key='all-records' extendedView={true} />)}/>
            </Switch>
          </Segment>
        </Container>
      </div>
    );
  }
}

export default Main;