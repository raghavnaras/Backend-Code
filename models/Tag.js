"use strict";

module.exports = function(sql, Sql) {
var Tag = sql.define("Tag", {
		RFID: {type: Sql.INTEGER, primaryKey: true},
        tagName: {type: Sql.STRING},
        userID: {type: Sql.INTEGER},
        machineID: {type: Sql.INTEGER},
        registered: {type: Sql.BOOLEAN}
}, {timestamps: true, freezeTableName: true});
    return Tag;
};