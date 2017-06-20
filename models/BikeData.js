"use strict";

module.exports = function(sql, Sql) {
var BikeData = sql.define("BikeData", {
        stamp: {type: Sql.BIGINT, primaryKey: true},
        rpm: {type: Sql.FLOAT},
        RFID: {type: Sql.STRING},
        sessionID: {type: Sql.INTEGER}
}, {timestamps: true, freezeTableName: true});
    return BikeData;
};
