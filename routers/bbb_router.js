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

	var py = spawn('python', ['python/compute_rpm.py'])
var dataString = ''
var json = require('json')
	/*Here we are saying that every time our node application receives data from the python process output stream(on 'data'), we want to convert that received data into a string and append it to the overall dataString.*/
	py.stdout.on('data', function(data){
  		dataString += data.toString();
	});

	/*Once the stream is done (on 'end') we want to simply log the received data to the console.*/
	py.stdout.on('end', function(){
	json = req.body
	if(req.body){

		rpm = parseFloat(dataString)
		dataString = ''
		rpm_array = []
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
				rpm: rpm
			})
		}
	}
	res.send("Success")
	});
	py.on('exit', function(code) {
    	console.log("Exited with code " + code);
	});
	py.stderr.on('data', function(data) {
    	console.error(data.toString());
});
	py.stdin.write(JSON.stringify(req.body));
	 py.stdin.end();


})
module.exports = router; 