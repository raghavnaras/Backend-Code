"use strict";

//built in node modules used for file and DB management
var Sql = require('sequelize');
var path = require("path");
var config= require('../dev-config');

//creates a db variable
var db = {};

//associates with the database defined in dev-config.j
var sql = new Sql(config.db.schema, config.db.user, config.db.password, config.opts)

//authenticates the connection
sql.authenticate()
    .then(function(err) {
        console.log('Connection has been established successfully.');
    })
    .catch(function (err) {
        console.log('Unable to connect to the database:', err);
    });

var fs = require("fs");
var model;

//grabs all the files in the models folder
fs.readdirSync(__dirname)
    //filters out the index.js file
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        //imports each model and stores it in the db dictionary made above under its name
        model = sql.import(path.join(__dirname, file));
        //forces the models to the database if needed
        model.sync({force: true});
        db[model.name] = model;
    });

Object.keys(db)
    //goes through each key in the dictionary created
    .forEach(function(modelName) {
        if ("associate" in db[modelName]) {
            //runs over association function if it exists (used for later)
            db[modelName].associate(db);
        }
    });

// db.SessionData.hasMany(db.BikeData, {foreignKey: 'sessionID', as:"data"});

db.sql = sql;
db.Sql = Sql;

module.exports = db;