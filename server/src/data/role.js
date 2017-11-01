module.exports = function(sequelize, DataTypes) {
  const Role = sequelize.define('Role', {
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    }
  });

  Role.associate = function(models) {
    Role.hasMany(models.User, { foreignKey: 'roleId' });
  }

  Role.rolesCache = {};

  Role.getRoleByName = function(name) {
    if (Role.rolesCache[name]) {
      return Promise.resolve(Role.rolesCache[name]);
    }

    return Role
      .findOrCreate({ where: { name } })
      .spread((role, created) => {
        if (created) {
          Role.rolesCache[role.name] = role;
        }
        return role;
      });
  }

  Role.getAdminRole = function() {
    return Role.getRoleByName('ADMIN');
  }

  Role.getManagerRole = function() {
    return Role.getRoleByName('MANAGER');
  }

  Role.getRegularRole = function() {
    return Role.getRoleByName('USER');
  }

  Role.isAdmin = function(user) {
    const userRole = user.getRole();
    const adminRole = Role.getAdminRole();

    return Promise
      .all([userRole, adminRole])
      .then(([role, required]) => role.id === required.id);
  }
  
  Role.isManager = function(user) {
    const userRole = user.getRole();
    const adminRole = Role.getAdminRole();
    const managerRole = Role.getManagerRole();

    return Promise
      .all([userRole, adminRole, managerRole])
      .then(([userRole, ...requiredRoles]) => {
        return requiredRoles.some(required => required.equals(userRole));
      });
  }

  return Role;
}