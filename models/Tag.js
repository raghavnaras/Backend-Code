"use strict";

module.exports = function(sql, Sql) {
var tags = sql.define("Tag", {
		RFID: {type: Sql.INTEGER, primaryKey: true},
        tagName: {type: Sql.STRING},
        userID: {type: Sql.INTEGER}
}, {timestamps: true, freezeTableName: true});
    return tags;
};