"use strict";

module.exports = function(sql, Sql) {
var SessionData = sql.define("SessionData", {
	RFID: {type: Sql.BIGINT},
	userID: {type: Sql.INTEGER},
	machineID: {type: Sql.INTEGER, primaryKey: true},
	stampStart: {type: Sql.STRING, primaryKey: true},
	stampEnd: {type: Sql.STRING}
}, {timestamps: false, freezeTableName: true});
    return SessionData;
};
