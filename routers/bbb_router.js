var express = require('express');
var router = express.Router();
var models = require('../models');
var data = models.BikeData
var user = models.SessionData
var spawn = require("child_process").spawn

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
router.get("/data/last", function(req,res){
	data.findOne({
		order: "stamp DESC"
	}).then(function(list){
		res.setHeader('Content-Type', 'application/json');
        res.send(list);
	})
})
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
router.post("/bike", function(req, res){
	data.create({
		stamp:  'NOW()',
		rpm: req.body.rpm,
		bikeId: req.body.bikeId
	})
	res.send("Upload Success")
});
module.exports = router; 