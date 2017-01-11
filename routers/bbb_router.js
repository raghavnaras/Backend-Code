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
		for (idx in timestamps){
			data.create({
				timestamp: parseFloat(timestamps[idx]),
				x: json[timestamps[idx]].x,
        		y: json[timestamps[idx]].y,
        		z: json[timestamps[idx]].z,
        		xG: json[timestamps[idx]].xG,
        		yG: json[timestamps[idx]].yG,
        		zG: json[timestamps[idx]].zG,
        		xM: json[timestamps[idx]].xM,
        		yM: json[timestamps[idx]].yM,
        		zM: json[timestamps[idx]].zM,
				rpm: 0
			})
		}
	}
	res.send("Success")
})
module.exports = router; 