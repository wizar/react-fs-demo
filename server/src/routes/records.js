const { Router } = require('express');
const permissions = require('../auth/permissions');
const { User, Record } = require('../data/db');
const { BadRequestError } = require('../util/http-errors');

const router = new Router();

router.get('/records', permissions.isRegularUser(), (req, res, next) => {
  const { limit = 50, offset = 0, sort = 'DESC' } = req.query;
  
  Record
    .findAndCountAll({
      where: { userId: req.user.id },
      limit: +limit,
      offset: +offset,
      order: [['date', sort]]
    })
    .then(records => res.json({ records }))
    .catch(error => {
      next(error);
    });
});

router.get('/records/all', permissions.isAdmin(), (req, res, next) => {
  const { limit = 50, offset = 0, sort = 'DESC' } = req.query;

  Record.findAndCountAll({ 
    limit: +limit,
    offset: +offset,
    order: [['date', sort]],
    include: [{
      model: User,
      attributes: ['email', 'firstName', 'lastName']
    }]
  })
  .then(records => res.json({ records }))
  .catch(error => {
    next(error);
  });
});

router.get('/records/:id', permissions.isRegularUser(), (req, res, next) => {
  const { id } = req.params;
  let queryChain;

  if (req.isAdmin) {
    queryChain = Record.findById(id).then(id => [id]);
  } else {
    queryChain = req.user.getRecords({ where: { id } });
  }

  queryChain
    .spread(record => {
      if (!record) {
        throw new Error('No such record found!');
      }

      res.json(record);
    })
    .catch(error => {
      next(error);
    });
});

router.put('/records', permissions.isRegularUser(), (req, res, next) => {
  const { date, distance, time, email } = req.body;
  let userPromise;

  if (req.isAdmin && email) {
    userPromise = User.findOne({ where: { email } });
  } else {
    userPromise = Promise.resolve(req.user);
  }

  userPromise
    .then(user => {
      if (!user) {
        throw new BadRequestError('Can\'t find user with this email');
      }
      
      return user.createRecord({
        date: Date.parse(date),
        distance,
        time 
      });
    })
    .then(record => res.json(record))
    .catch(error => {
      next(error);
    });
})

router.post('/records/:id', permissions.isRegularUser(), (req, res, next) => {
  const { date, distance, time, email } = req.body;

  Record
    .findOne({ where: { id: req.params.id } })
    .then(record => {
      const updateObj = {
        date,
        distance,
        time
      };

      if (req.isAdmin && email) {
        return User
          .findOne({ where: { email } })
          .then(user => {
            if (!user) {
              throw new BadRequestError('Can\'t find user with this email');
            }
            updateObj.userId = user.id;
            return record.update(updateObj);
          })
      }

      return record.update(updateObj);
    })
    .then(record => res.json({ record }))
    .catch(error => {
      next(error);
    });
});

router.delete('/records/:id', permissions.isRegularUser(), (req, res, next) => {
  let recordsPromise;
  
  if (req.isAdmin) {
    recordsPromise = Record.findById(req.params.id).then(record => [record]);
  } else {
    recordsPromise = req.user.getRecords({ where: { id: req.params.id } })
  }

  recordsPromise
    .spread(record => {
      if (!record) {
        throw new Error('No such records found!');
      }
  
      return record.destroy();
    })
    .then(() => res.json({ message: 'Record removed' }))
    .catch(error => {
      next(error);
    });
});

router.post('/generate', permissions.isRegularUser(), (req, res, next) => {
  let now = new Date();
  let nowTs = now.getTime();
  
  for(let i = 0; i < 100; i++) {
    let distance = Math.floor(Math.random() * 1000);
    let newDate = new Date();
    newDate.setTime(nowTs);
    req.user.createRecord({
      date: newDate,
      distance,
      time: Math.floor(distance / 40)
    });

    nowTs += 24 * 60 * 60 * 1000;
    // now.setTime(nowTs);
  }

  res.json({});

})

module.exports = router;