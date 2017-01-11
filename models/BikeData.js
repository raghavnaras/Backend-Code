"use strict";

module.exports = function(sql, Sql) {
var bikedata = sql.define("BikeData", {
        stamp: {type: Sql.BIGINT, primaryKey: true},
        x: {type: Sql.FLOAT},
        y: {type: Sql.FLOAT},
        z: {type: Sql.FLOAT},
        xG: {type: Sql.FLOAT},
        yG: {type: Sql.FLOAT},
        zG: {type: Sql.FLOAT},
        xM: {type: Sql.FLOAT},
        yM: {type: Sql.FLOAT},
        zM: {type: Sql.FLOAT},
        rpm: {type: Sql.FLOAT},
        bikeId: {type: Sql.INTEGER}
}, {timestamps: true,freezeTableName: true});
    return bikedata;
};