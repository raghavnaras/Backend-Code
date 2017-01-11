"use strict";

module.exports = function(sql, Sql) {
var sessiondata = sql.define("SessionData", {
        stampStart: {type: Sql.STRING},
        stampEnd: {type: Sql.STRING},
        weight: {type: Sql.FLOAT},
        gender: {type: Sql.STRING},
        age: {type: Sql.FLOAT},
        height: {type: Sql.FLOAT},
        id: {type: Sql.INTEGER, primaryKey: true, autoIncrement: true},
        email: {type: Sql.STRING}, 
        name: {type: Sql.STRING}
    });
    return sessiondata;
};