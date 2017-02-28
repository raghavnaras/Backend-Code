"use strict";

module.exports = function(sql, Sql) {
var sessiondata = sql.define("SessionData", {
        stampStart: {type: Sql.STRING},
        stampEnd: {type: Sql.STRING},
        userId: {type: Sql.INTEGER}
    });
    return sessiondata;
};