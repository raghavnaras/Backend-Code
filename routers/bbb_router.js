var express = require('express');
var router = express.Router();
var models = require('../models');
var data = models.BikeData
var user = models.User
var session = models.SessionData
var spawn = require("child_process").spawn
var sequelize = require('sequelize');

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
router.get("/sessionlisten", function(req, res){
	session.findOne({
		where: {stampEnd: null}
	}).then(function(list){
		if(list){
		user.findOne({
			where: {id: list.dataValues.userId}
		}).then(function(user){
			res.send({status: "success", user: user})
		})
		}else{
			res.send({status: "failure"})
		}
	})
})
router.post("/logout", function(req, res){
	session.update({
  stampEnd: new Date().getTime(),
},{		where:
			[{userId: req.body.userId}]
	}).then(function(list){
        res.send({status: "success"});
	})
})
router.post("/addsession", function(req, res) {
    session.findAll(
        {where: {
            stampEnd: null
        }}).then(function(list) {
        	if(list.length == 0){
        user.findAll({
            where: [{
                rfid: req.body.tag
            }]
        }).then(function(list) {
            if (list.length == 0) {
                user.create({
                    rfid: req.body.tag
                }).then(function(user) {
                    console.log(user)
                    session.create({
                        stampStart: new Date().getTime(),
                        userId: user.dataValues.id
                    })
                    res.send({
                        status: "new"
                    })
                })
            } else {
                res.send({
                    status: "old",
                    user: list[0]
                })
                session.create({
                    stampStart: new Date().getTime(),
                    userId: list[0].dataValues.id
                })
            }
        })
    }
    else{
    	res.send({status: "busy"})
    }
})
   
    
});
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}
router.get("/average_duration", function(req, res){
	session.findAll().then(function(sessions){
		var total_dur = 0
		var count = 0
		for(inc in sessions){
			var start = sessions[inc].stampStart
			var end = sessions[inc].stampEnd
			if(start!= null && end!= null){
			count = count+1

			console.log(end-start)
			if(end-start>=337645142){
				console.log("pk")
				console.log(end)
				console.log(start)
			}
			total_dur = total_dur + parseInt(end-start)
			}
		}
		res.send({success: true, duration: String(total_dur/parseFloat(count*1000)).toHHMMSS()})
	})
})
router.get("/workout_duration", function(req, res){
	session.findOne(
        {where: {
            stampEnd: null
        }}).then(function(ses) {
        	var start = ses.stampStart
			var end = new Date().getTime()
        	res.send({success: true, duration: String((end-start)/parseFloat(1000))})
        });
})
router.post("/addname", function(req, res){

	user.update({
  name: req.body.name,
},{
		where:
			[{id: req.body.userId}]
	}).then(function(list){
        res.send({status: "success"});
	}).error(function(e){
		res.send({status: "failure"})
	})
});
router.post("/addemailgender", function(req, res){
	user.update({
 	email: req.body.name,
 	gender: req.body.gender
},{
		where:
			[{id: req.body.userId}]
	}).then(function(list){
        res.send({status: "success"});
	}).error(function(e){
		res.send({status: "failure"})
	})
});
router.post("/bike", function(req, res){
	data.create({
		stamp:  new Date().getTime(),
		rpm: req.body.rpm,
		bikeId: req.body.bikeId
	})
	res.send("Upload Success")
});
module.exports = router; 