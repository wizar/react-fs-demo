module.exports = function(sequelize, DataTypes) {
  const Record = sequelize.define('Record', {
    date: {
      type: DataTypes.DATE
    },
    distance: {
      type: DataTypes.INTEGER
    },
    time: {
      type: DataTypes.INTEGER
    }
  });

  Record.associate = function(models) {
    Record.belongsTo(models.User, { foreignKey: 'userId' });
  }

  return Record;
}