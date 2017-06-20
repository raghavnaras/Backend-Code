"use strict";

module.exports = function(sql, Sql) {
var Tag = sql.define("Tag", {
		stampStart: {type: Sql.STRING},
		stampEnd: {type: Sql.STRING},
		RFID: {type: Sql.INTEGER, primaryKey: true},
    tagName: {type: Sql.STRING},
    userID: {type: Sql.INTEGER},
    machineID: {type: Sql.INTEGER},
    registered: {type: Sql.BOOLEAN}
});
    return Tag;
};
