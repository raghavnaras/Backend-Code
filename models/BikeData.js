"use strict";

module.exports = function(sql, Sql) {
var bikedata = sql.define("id117", {
        id: {type: Sql.STRING, primaryKey: true},
        stamp: {type: Sql.BIGINT},
        x: {type: Sql.FLOAT},
        y: {type: Sql.FLOAT},
        z: {type: Sql.FLOAT},
        xG: {type: Sql.FLOAT},
        yG: {type: Sql.FLOAT},
        zG: {type: Sql.FLOAT},
        xM: {type: Sql.FLOAT},
        yM: {type: Sql.FLOAT},
        zM: {type: Sql.FLOAT},
        rpm: {type: Sql.FLOAT}
}, {timestamps: false,freezeTableName: true});
        
        
    return bikedata;
};