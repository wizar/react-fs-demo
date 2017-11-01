const passport = require('passport');

module.exports = {
  isAdmin: () => passport.authenticate('jwt-admin-auth', { session: false }),
  isManager: () => passport.authenticate('jwt-manager-auth', { session: false }),
  isRegularUser: () => passport.authenticate('jwt-user-auth', { session: false })
}