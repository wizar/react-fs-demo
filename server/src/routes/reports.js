const { Router } = require('express');
const permissions = require('../auth/permissions');
const { sequelize } = require('../data/db');

const router = new Router();

router.get('/report', permissions.isRegularUser(), (req, res, next) => {
  const { sortDirection = 'DESC' } = req.query;
  sequelize
    .query(`select
              yearweek(date) as yearweek,
              avg(distance) as distance,
              avg(time) as time,
              (avg(distance)/1000) / (avg(time)/3600) as speed
            from
              Records
            where
              userId = ${req.user.id}
            group by
              yearweek
            order by
              yearweek ${sortDirection};`, { type: sequelize.QueryTypes.SELECT})
    .then(rows => {
      return rows.map(row => {
        const yearAndWeek = '' + row.yearweek;
        row.year = yearAndWeek.substring(0, 4);
        row.week = yearAndWeek.substring(4, 6);
        return row;
      })
    })
    .then(rows => res.json({ report: rows }))
    .catch(error => next(error));
});

module.exports = router;