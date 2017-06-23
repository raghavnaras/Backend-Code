"use strict";

module.exports = function(sql, Sql) {
var SessionData = sql.define("SessionData", {
	RFID: {type: Sql.BIGINT, primaryKey: true},
	userId: {type: Sql.INTEGER},
	sessionID: {type: Sql.INTEGER},
        stampStart: {type: Sql.STRING},
        stampEnd: {type: Sql.STRING}
    }, {timestamps: false, freezeTableName: true});
    return SessionData;
};
