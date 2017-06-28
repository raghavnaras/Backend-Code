var express = require('express');
var app = express();
var router = require('./routers/bbb_router.js');
var models = require('./models');

// ADDED THIS CODE FOR DEBUGGING PURPOSES!
// DELETE IF NEEDED!
// ==>
var jwt = require ('jsonwebtoken');
var jwtauth = require('./jwt_auth.js');
// <==

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token, authorization');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time, authorization');
    res.header('Access-Control-Max-Age', '1000');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    next();
});

app.use("/bbb", router);

// ADDED THIS CODE FOR DEBUGGING PURPOSES!
// DELETE IF NEEDED!
// ==>
// app.use(jwtauth);
// <==

models.sql.sync().then(function () {
    app.listen(8000);
    console.log('app is running on port 8000');
});
