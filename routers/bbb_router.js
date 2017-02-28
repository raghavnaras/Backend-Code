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
router.post("/addsession", function(req, res){
	user.findAll({
		where: [{rfid : req.body.tag}]
	}).then(function(list){
		if(list.length == 0){
			user.create(
				{rfid: req.body.tag}
				).then(function(user){
					console.log(user)
					session.create({
						stampStart: new Date().getTime(),
						userId: user.dataValues.id
					})
					res.send({status: "new"})

				})
			
		}
		else{
			res.send({status: "old", user: list[0]})
			session.create({
				stampStart: new Date().getTime(),
				userId: list[0].dataValues.id
			})
		}
		
		
	})
});
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