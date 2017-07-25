"use strict";

module.exports = function(sql, Sql) {
var RaspberryPi = sql.define("RaspberryPi", {
	serialNumber: {type: Sql.BIGINT, primaryKey: true},
    machineID: {type: Sql.INTEGER},
    machineType: {type: Sql.STRING},
    lastPing: {type: Sql.STRING}
}, {timestamps: false, freezeTableName: true});
    return RaspberryPi;
};
