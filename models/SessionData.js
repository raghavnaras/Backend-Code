"use strict";

module.exports = function(sql, Sql) {
var SessionData = sql.define("SessionData", {
        stampStart: {type: Sql.STRING},
        stampEnd: {type: Sql.STRING},
        userID: {type: Sql.INTEGER}
    });
    return SessionData;
};
