var express = require('express');
var router = express.Router();
var models = require('../models');
var data = models.BikeData
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
router.post("/bike", function(req, res){
	json = req.body
	if(req.body){
		timestamps = Object.keys(req.body)
		console.log(timestamps)
		for (idx in timestamps){
			data.create({
				stamp: parseFloat(timestamps[idx]),
				x: json[timestamps[idx]][0],
        		y: json[timestamps[idx]][1],
        		z: json[timestamps[idx]][2],
        		xG: json[timestamps[idx]][3],
        		yG: json[timestamps[idx]][4],
        		zG: json[timestamps[idx]][5],
        		xM: json[timestamps[idx]][6],
        		yM: json[timestamps[idx]][7],
        		zM: json[timestamps[idx]][8],
        		bikeId: json[timestamps[idx]][9],
				rpm: 0
			})
		}
	}
	res.send("Success")
})
module.exports = router; 