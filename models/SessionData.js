"use strict";

module.exports = function(sql, Sql) {
var SessionData = sql.define("SessionData", {
			RFID: {type: Sql.BIGINT, primaryKey: true}
	    userID: {type: Sql.INTEGER, primaryKey: true},
        stampStart: {type: Sql.STRING},
        stampEnd: {type: Sql.STRING}
    }, {timestamps: false, freezeTableName: true});
    return SessionData;
};
