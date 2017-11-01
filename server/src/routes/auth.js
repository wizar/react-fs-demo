const { Router } = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const { BadRequestError, InternalError, UnauthorizedError } = require('../util/http-errors');
const passportConfig = require('../auth/passport');
const { jwtSecret, expiresIn } = require('../config/commonConfig');
passportConfig(passport);

const router = new Router();
router.use(passport.initialize());

router.post('/register', (req, res, next) => {
  passport.authenticate('local-signup', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (info && info.error) {
      return next(info.error);
    }

    if (!user) {
      return next(new BadRequestError('Missing credentials'));
    }

    const { id, email, firstName, lastName, roleId } = user;
    
    res.json({
      user: {
        id,
        email,
        firstName,
        lastName,
        roleId
      }
    });
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (info && info.error) {
      return next(info.error);
    }

    if (!user) {
      return next(new BadRequestError('Missing credentials'));
    }

    req.logIn(user, err => {
      if (err) {
        return next(err);
      }

      const { id, roleId } = user; // TODO: Can we store roleId in token?
      const token = jwt.sign({ id, roleId }, jwtSecret, { expiresIn });
      res.json({ token });
    });
  })(req, res, next);
})

module.exports = router;