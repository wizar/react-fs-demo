const { User, Role } = require('../data/db');
const { BaseHttpError, BadRequestError, InternalError, UnauthorizedError } = require('../util/http-errors');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const passportJwt = require('passport-jwt');
const ExtractJwt = passportJwt.ExtractJwt
const JwtStrategy = passportJwt.Strategy;

const { jwtSecret } = require('../config/commonConfig');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User
      .findById(id)
      .then(user => {
        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      })
      .catch(err => done(err, false));
  });

  function checkRoles(id) {
    return User
      .findById(id)
      .then(user => {
        if (!user) {
          throw new UnauthorizedError('No such user found!');
        }

        const isAdmin = Role.isAdmin(user);
        const isManager = Role.isManager(user)

        return Promise.all([isAdmin, isManager, Promise.resolve(user)]);
      });
  }

  passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, function(req, email, password, done) {
    const { firstName, lastName } = req.body;

    Role
      .getRegularRole()
      .then(role => {
        return User.register({
          firstName,
          lastName,
          email,
          password,
          roleId: role.id
        })
      })
      .then(user => done(null, user, { user }))
      .catch(error => done(null, false, { error }))
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, function(req, email, password, done) {
    User
      .findOne({ where: { email } })
      .then(user => {
        if (!user) {
          return done(null, false, { error: new UnauthorizedError('User not found') });
        }

        return user;
      })
      .then(user => {
        // TODO: Think how to chain promises and save user variable
        user
          .isPasswordValid(password)
          .then(valid => {
            if (valid) {
              return done(null, user);
            }

            return done(null, false, { error: new UnauthorizedError('Wrong password') });
          })
      })
      .catch(error => done(null, false, { error }))
  }));

  

  passport.use(`jwt-admin-auth`, new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: jwtSecret,
    passReqToCallback: true
  }, (req, { id }, done) => {
    checkRoles(id)
      .then(([isAdmin, isManager, user]) => {
        req.isAdmin = isAdmin;
        req.isManager = isManager;

        done(null, isAdmin ? user : false);
      })
      .catch(error => done(null, false, { error }));
  }));

  passport.use(`jwt-manager-auth`, new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: jwtSecret,
    passReqToCallback: true
  }, (req, { id }, done) => {
    checkRoles(id)
      .then(([isAdmin, isManager, user]) => {
        req.isAdmin = isAdmin;
        req.isManager = isManager;

        done(null, isManager ? user : false);
      })
      .catch(error => done(null, false, { error }));
  }));

  passport.use(`jwt-user-auth`, new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: jwtSecret,
    passReqToCallback: true
  }, (req, { id }, done) => {
    checkRoles(id)
      .then(([isAdmin, isManager, user]) => {
        req.isAdmin = isAdmin;
        req.isManager = isManager;

        done(null, user);
      })
      .catch(error => done(null, false, { error }));
  }));

}