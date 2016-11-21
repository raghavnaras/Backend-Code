"use strict";
var Sql = require('sequelize');
var path = require("path");
var config= require('../dev-config');

var db = {};
var sql = new Sql(config.db.schema, config.db.user, config.db.password, config.opts)

sql
    .authenticate()
    .then(function(err) {
        console.log('Connection has been established successfully.');
    })
    .catch(function (err) {
        console.log('Unable to connect to the database:', err);
    });


var fs = require("fs");
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sql.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});
db.sql = sql;
db.Sql = Sql;
module.exports = db;