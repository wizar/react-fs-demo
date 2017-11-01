const { Router } = require('express');
const { Op } = require('sequelize');
const permissions = require('../auth/permissions');
const { User, Role } = require('../data/db');
const { ForbiddenError, BadRequestError, InternalError } = require('../util/http-errors');

const router = new Router();

const textSearchFields = [
  'firstName',
  'lastName',
  'email'
];

const defaultAttrs = [
  'id',
  'firstName',
  'lastName',
  'email',
  'roleId'
]

router.get('/roles', permissions.isManager(), (req, res, next) => {
  Role
    .findAll()
    .then(roles => res.json({ roles }));
})

router.get('/users', permissions.isManager(), (req, res, next) => {
  const { limit = 50, offset = 0, query = '' } = req.query;
  const searchOpts = { 
    limit: +limit, 
    offset: +offset,
    attributes: defaultAttrs
  };

  if (query) {
    searchOpts.where = {
      [Op.or]: textSearchFields.map(field => {
        return {
          [field]: {
            [Op.like]: `%${query}%`
          }
        }
      })
    }
  }

  User
    .findAndCountAll(searchOpts)
    .then(users => res.json({ users }))
    .catch(error => {
      next(error);
    });
});

router.get('/user/:id', permissions.isManager(), (req, res, next) => {
  User
    .findById(req.params.id, { attributes: defaultAttrs })
    .then(user => res.json({ user }))
    .catch(error => {
      next(error);
    });
});

router.get('/user', permissions.isRegularUser(), (req, res, next) => {
  const { firstName, lastName } = req.user;
  res.json({
    firstName,
    lastName,
    isAdmin: req.isAdmin,
    isManager: req.isManager
  });
});

router.post('/user/:id', permissions.isManager(), (req, res, next) => {
  const data = req.body.user;
  const user = User.findById(req.params.id, { attributes: defaultAttrs });
  const emailCheck = User.findOne({ where: { email: data.email } });
  const adminRole = Role.getAdminRole();

  return Promise
    .all([user, adminRole, emailCheck])
    .then(([user, adminRole, emailCheck]) => {
      if (adminRole.id == data.roleId && data.roleId != user.roleId && !req.isAdmin) {
        // If user role changed to admin and current user IS NOT admin
        return next(new ForbiddenError('You don\'t have enough permissions to give admin privileges!'));
      }

      if (user.email != data.email && emailCheck) {
        return next(new BadRequestError('Email already taken!'));
      }

      const updateObj = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roleId: data.roleId
      };

      if (data.password) {
        return User
          .getPasswordHash(data.password)
          .then(hash => {
            updateObj.password = hash;
            return user.update(updateObj);
          });
      }

      return user.update(updateObj);
    })
    .then(user => res.json({ user }))
    .catch(error => {
      next(error);
    });
});

router.put('/user', permissions.isManager(), (req, res, next) => {
  const fullData = req.body.user;
  const { firstName, lastName, email, password, roleId } = req.body.user;
  const userRole = Role.getRegularRole();
  const adminRole = Role.getAdminRole();

  if (!email || !password) {
    return next(new BadRequestError('Missing crenetials'));
  }

  Promise
    .all([userRole, adminRole])
    .then(([userRole, adminRole]) => {
      if (roleId == adminRole.id && !req.isAdmin) {
        return next(new ForbiddenError('You don\'t have enough permissions to create users with admin privileges!'));
      }

      if (!roleId) {
        fullData.roleId = userRole.id;
      }

      return User.register(fullData);
    })
    .then(user => res.json({ user }))
    .catch(error => {
      next(error);
    });
})

router.delete('/user/:id', permissions.isManager(), (req, res, next) => {
  const adminRolePromise = Role.getAdminRole();
  const adminsCount = 
  
  Role
    .getAdminRole()
    .then(adminRole => {
      const userPromise = User.findById(req.params.id);
      const adminsCountPromise = User.count({ where: { roleId: adminRole.id } });
      return Promise.all([userPromise, adminsCountPromise, adminRole]);
    })
    .then(([user, adminsCount, adminRole]) => {
      if (user.roleId == adminRole.id && !req.isAdmin) {
        return next(new ForbiddenError('You don\'t have enough permissions to delete admin user!'));
      }

      if (user.roleId == adminRole.id && adminsCount == 1) {
        return next(new ForbiddenError('You can\'t remove the only one admin user!'));
      }

      return user.destroy();
    })
    .then((count) => {
      if (count) {
        return res.json({ message: 'User removed' })
      }

      return next(new InternalError('Something goes bananas'));
    })
    .catch(error => {
      next(error);
    });
})

module.exports = router;