 // Routers, Models, and Packages
 // test comment

var express = require('express');
//var expressJWT = require('express-jwt');
var jwt = require ('jsonwebtoken');
var router = express.Router();
var models = require('../models');
var jwtauth = require('../jwt_auth.js');
var BikeData = models.BikeData;
var User = models.User;
var Tag = models.Tag;
var RaspberryPi = models.RaspberryPi;
var SessionData = models.SessionData;
var spawn = require("child_process").spawn;
var sequelize = require('sequelize');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');

var app = express();
//sets up authorization where it matters
router.use('/users', jwtauth);
router.use('/data', jwtauth);
router.use('/data/last', jwtauth);
router.use('/sessionlisten', jwtauth);
router.use('/average_duration', jwtauth);
router.use('/workout_duration', jwtauth);
router.use('/get_last_workout', jwtauth);
router.use('/logout', jwtauth);
router.use('/end_workout', jwtauth);
router.use('/check_tag', jwtauth);
router.use('/addname', jwtauth);
router.use('/addemailgender', jwtauth);
router.use('/history', jwtauth);

// GET REQUESTS

router.get("/users", function(req, res){
	User.findAll().then(function(list){
		res.setHeader('Content-Type', 'application/json');
        res.send(list);
	})
});
router.get("/data", function(req, res){
	BikeData.findAll().then(function (list) {
        res.setHeader('Content-Type', 'application/json');
        res.send(list);
    })
});
router.get("/data/last", function(req,res){
	BikeData.findOne({
		order: "stamp DESC"
	}).then(function(list){
		res.setHeader('Content-Type', 'application/json');
        res.send(list);
	})
})
router.get("/sessionlisten", function(req, res){
	SessionData.findOne({
		where: {stampEnd: null}
	}).then(function(list){
		if(list){
		Tag.findOne({
			where: {id: list.dataValues.RFID}
		}).then(function(RFID){
			res.send({status: "success", tag: RFID})
		})
		} else {
			res.send({status: "failure"})
		}
	})
})
router.get("/average_duration", function(req, res){
	SessionData.findAll({
		where: {
			userId: req.body.userId,
			stampEnd: {
				$ne: null
			}
		}}).then(function(sessions){
			var total_dur = 0
			var count = 0
			for(inc in sessions){
				var start = sessions[inc].stampStart
				var end = sessions[inc].stampEnd
				if (start != null && end != null) {
					count = count + 1
					console.log(start)
					console.log(end)
					total_dur = total_dur + ((parseInt(end) - parseInt(start)))
				}
			}
			if (count == 0) {
				res.send({success: false, duration: ""})
			}
			else {
				res.send({success: true, duration: (String(total_dur / count)).toHHMMSS()})
			}
		})
})
router.get("/workout_duration", function(req, res){
	SessionData.findOne(
        {where: {
            stampEnd: null
        }}).then(function(ses) {
        	var start = parseInt(ses.stampStart)
			var end = new Date().getTime()
        	res.send({success: true, duration: String((end - start)).toHHMMSS()})
        });
})

// the most recent workout is defined to be the one that was created most recently
router.get("/get_last_workout", function(req, res){
	SessionData.findAll(
		{where: {
			userId: req.body.userId,
			stampEnd: {
				$ne: null
			}
		}}).then(function(sessions){
		var most_recent_date = -1
		for (inc in sessions) {
			// var date = Date.parse(sessions[inc].createdAt)
			// if (date > most_recent_date) {
			// 	most_recent_date = date
			// }
		}
		if (most_recent_date > -1) {
			// res.send({date: String((new Date(most_recent_date)).toDateString())})
			res.send({date: ""})
		} else {
			res.send({date: ""})
		}
	})
})

// POST REQUESTS

router.post("/setup_account", function(req, res) {
    
    bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
        User.create({
                  name: req.body.name,
                  email: req.body.email,
                  pswd: hash
         }).then(function(list){
        res.send({status: "success"});
	}).error(function(e){
		res.send({status: "failure"})
	})
    });
});

    });
    
router.post("/login", function(req, res) {
	console.log(req.headers);
	console.log(req.headers['authorization']);
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(function(user) { 
		if (!user) {
			return res.send({status: 401});
		}
		if (user) {
            bcrypt.compare(req.body.password, String(user.pswd), function(err, response) {
                if (response){
                	// var expires = moment().add('days', 7).valueOf();
                    var token = jwt.sign({username: user.name, userID: user.id, email: user.email}, 'ashu1234');
				    res.json({
				    	token: token
				    	// expires: expires
				    });
                }
                else {
					res.send({status: 401});
				}
            })
		}
	}).error(function(error) {
		res.send({status: 401});
	})
});

router.post("/logout", function(req, res){
	User.findOne({
  	where:{
			id: req.body.userID
		}
	}).then(function(user){
        res.send({status: "success"});
	})
})

router.post("/end_workout", function(req, res){
	SessionData.update({
  		stampEnd: new Date().getTime(),
	}, {where:
			[{RFID: req.body.RFID}]
	}).then(function(list){
        res.send({status: "success"});
	})
})

//processes the tag after scanning
router.post("/process_tag", function(req, res) {
	console.log(req.body)
	Tag.findOne({
		where: {
			RFID: req.body.RFID
		}
	}).then(function(tag) {
		if (tag) {
			if (tag.registered) {
				SessionData.create({
					userID: tag.dataValues.userID,
					stampStart: String(new Data.getTime())
				})
				res.send({status: "registered"});
			} else {
				res.send({status: "repeat"});
			}
		} else {
			RaspberryPi.findOne({
				where: {
					serialNumber: req.body.serialNumber
				}
			}).then(function(RaspPi) {
				Tag.create({
					RFID: req.body.RFID,
					machineID: RaspPi.machineID,
					registered: false
				})
			})
			res.send({status: "new"});
		}
	}).error(function(e) {
		res.send({status: "failure"})
	})
})
router.post("/check_tag", function(req, res){
	Tag.findOne({
		where: {
            machineID: req.body.machineID,
            registered: false
        }
    }).then(function(tag) {
		Tag.update({
			registered: true,
			tagName: req.body.tagName,
			userID: req.body.userID
		}, {
			where: {
				machineID: req.body.machineID,
            	registered: false
			}
		})
		res.send({status: "success"})
	}).error(function(e) {
		res.send({status: "failure"})
	})
})
// router.post("/addsession", function(req, res) {
//     SessionData.findAll({
//     	where: {
//             stampEnd: null
//         }
//     }).then(function(list) {
//         if(list.length == 0){
// 	        User.findAll({
// 	            where: {
// 	            	userId: req.body.userId
//             	}
// 	        }).then(function(list) {
// 	            if (list.length == 0) {
// 	                User.update({
// 	                    RFID: req.body.tag
// 	                }).then(function(user) {
// 	                    console.log(user)
// 	                    SessionData.create({
// 	                        stampStart: new Date().getTime(),
// 	                        userId: user.dataValues.id
// 	                    })
// 	                    res.send({
// 	                        status: "new"
// 	                    })
// 	                })
// 	            } else {
// 	                res.send({
// 	                    status: "old",
// 	                    user: list[0]
// 	                })
// 	                SessionData.create({
// 	                    stampStart: new Date().getTime(),
// 	                    userId: list[0].dataValues.id
// 	                })
// 	            }
//         	})
//     	}
//     	else {
//     		res.send({status: "busy"})
//     	}
// 	})
// })
router.post("/addname", function(req, res){
	User.update({
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
	User.update({
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
	console.log(req.body)
	RaspberryPi.findOne({
		where: {
			serialNumber: req.body.serialNumber
		}
	}).then(function(RaspPi) {
		if (RaspPi) {
			BikeData.create({
				stamp: new Date().getTime(),
				rpm: req.body.rpm,
				bikeID: RaspPi.machineID
			})
			res.send({status: "success"})
		} else {
			res.send({status: "failure"})
		}
	})
});
router.post("/history", function(req,res){
	SessionData.findAll({
		where: {
			userId: req.body.userId,
			stampEnd: {
				$ne: null
			}
		},
		include:[
		{model: BikeData, as: "BikeData"}
		]
	}).then(function(history){

		history_list = []
		for(entry in history){
			past_workout = history[entry].dataValues
			if(past_workout != null){
			var milli_to_minutes = (1/60000.0)
			history_list.push({})

			total = 0
			//loop through all data values
			for (point in past_workout.data){
				total += past_workout.data[point].rpm
			}

			expectation = total/parseFloat(past_workout.data.length)
			history_list[entry].average_rpm = expectation
			history_list[entry].distance = 0.0044*(past_workout.stampEnd-past_workout.stampStart)*milli_to_minutes*expectation
			history_list[entry].duration = String(past_workout.stampEnd - past_workout.stampStart).toHHMMSS()
			history_list[entry].date = new Date(Date.parse(past_workout.createdAt)).toDateString()
		}
	}
		res.send(history_list)
	})
})

// Helper Functions

String.prototype.toHHMMSS = function () {
	console.log(this)
	// this should be in milliseconds, second parameter is the base (i.e., decimal)
    var sec_num = parseInt(this, 10) / 1000
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60)
    var seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60))

    return ((hours < 10) ? ("0" + String(hours)) : String(hours)) + ":"
		+ ((minutes < 10) ? ("0" + String(minutes)) : String(minutes)) + ":"
		+ ((seconds < 10) ? ("0" + String(seconds)) : String(seconds))
}

module.exports = router;
