const bcrypt = require('bcrypt');
const { saltRounds } = require('../config/commonConfig');

module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define(
    'User',
    {
      firstName: {
        type: DataTypes.STRING
      },
      lastName: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING
      }
    }
  );

  User.prototype.isPasswordValid = function(password) {
    return bcrypt.compare(password, this.dataValues.password);
  };

  User.getPasswordHash = function(password) {
    return bcrypt.hash(password, saltRounds);
  };

  User.associate = function(models) {
    User.belongsTo(models.Role, { foreignKey: 'roleId' });
    User.hasMany(models.Record, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true});
  };

  User.register = function(data) {
    if (!data.password || !data.email) {
      throw new Error('Missing password or email!');
    }

    return User
      .findOne({ where: { email: data.email } })
      .then(user => {
        if (user) {
          throw new Error('Email already taken!');;
        }

        return User.getPasswordHash(data.password);
      })
      .then(hash => {
        data.password = hash;
        return User.create(data);
      });
  }

  return User;
};