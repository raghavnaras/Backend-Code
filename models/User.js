"use strict";

module.exports = function(sql, Sql) {
var  users= sql.define("User", {
		id: {type: Sql.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type: Sql.STRING},
        email: {type: Sql.STRING},
        pswd: {type: Sql.STRING},
        gender: {type: Sql.STRING},
        weight: {type: Sql.FLOAT},
        age: {type: Sql.FLOAT},
        height: {type: Sql.FLOAT},
        rfid: {type: Sql.STRING}
}, {timestamps: true,freezeTableName: true});
    return users;
};