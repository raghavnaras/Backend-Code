"use strict";

module.exports = function(sql, Sql) {
var bikedata = sql.define("BikeData", {
        stamp: {type: Sql.BIGINT, primaryKey: true},
        rpm: {type: Sql.FLOAT},
        bikeId: {type: Sql.INTEGER}
}, {timestamps: true,freezeTableName: true});
    return bikedata;
};