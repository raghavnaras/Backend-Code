"use strict";

module.exports = function(sql, Sql) {
var BikeData = sql.define("BikeData", {
        stamp: {type: Sql.BIGINT, primaryKey: true},
        rpm: {type: Sql.FLOAT},
        bikeID: {type: Sql.INTEGER},
        sessionID: {type: Sql.BIGINT}
}, {timestamps: false, freezeTableName: true});
    return BikeData;
};
