var express = require('express');
var router = express.Router();
var models = require('../models');
var data = models.id117
var user = models.SessionData

router.get("/users", function(req, res){
	user.findAll().then(function(list){
		res.setHeader('Content-Type', 'application/json');
        res.send(list);
	})
});
router.get("/data", function(req, res){
	data.findAll().then(function (list) {
        res.setHeader('Content-Type', 'application/json');
        res.send(list);
    })
});
router.get("/data/:t1/:t2", function(req, res){
	data.findAll({
		where:
			[{stamp: {gt: req.params.t1}},
			{stamp: {lt: req.params.t2}}]
	}).then(function(list){
		res.setHeader('Content-Type', 'application/json');
        res.send(list);
	})
});
router.post("/addsession", function(req, res){
	user.create({email: req.body.email, 
				gender: req.body.gender, 
				stampStart: req.body.stampStart, 
				stampEnd: req.body.stampEnd,
				name: req.body.name,
				id: ''});
	res.send("session created")
});
module.exports = router; 