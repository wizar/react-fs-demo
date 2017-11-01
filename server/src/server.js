const express = require('express');
const bodyParser = require('body-parser');

const { sequelize, User, Role } = require('./data/db');

const authRoute = require('./routes/auth');
const commonRoute = require('./routes/common');
const usersRoute = require('./routes/users');
const recordsRoute = require('./routes/records');
const reportsRoute = require('./routes/reports');

const app = express();

app.use(bodyParser.json());
app.use('/api', authRoute);
app.use('/api', commonRoute);
app.use('/api', usersRoute);
app.use('/api', recordsRoute);
app.use('/api', reportsRoute);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Something goes bananas!' });
});

sequelize
  .sync({ force: true })
  .then(() => {
    return Promise.all([
      Role.getAdminRole(),
      Role.getManagerRole(),
      Role.getRegularRole()
    ]);
  })
  .then(() => {
    return User.register({
      firstName: 'admin',
      lastName: 'admin',
      email: 'admin@test.com',
      password: '123'
    })
    .then(admin => {
      return Role
        .getAdminRole()
        .then(role => admin.setRole(role));
    })
    .catch(error => {
      console.error(error);
    });
  })
  .then(() => {
    app.listen(3001, 'localhost', () => console.log('Server started'));
  });
