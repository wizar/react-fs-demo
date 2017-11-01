const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

const { dbName, dbUser, dbHost, dbPassword, dbDialect } = require('../config/commonConfig');

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dbDialect,

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },

  logging: false
});

const db = {};

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== 'db.js');
  })
  .forEach(file => {
    let model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;