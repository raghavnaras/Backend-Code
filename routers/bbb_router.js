// Routers, Models, and Packages

var express = require('express');
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
var moment = require('moment-timezone');

var app = express();

var aws = require("aws-sdk");
aws.config.update({
	region: "us-west-2",
});

var ses = new aws.SES({"accessKeyId": "", "secretAccessKey":"","region":"us-west-2"})


// sets up authorization where it matters
router.use('/users', jwtauth);
router.use('/data', jwtauth);
//router.use('/data/last', jwtauth);
router.use('/sessionlisten', jwtauth);
//router.use('/average_duration', jwtauth);
//router.use('/workout_duration', jwtauth);
router.use('/get_last_workout', jwtauth);
router.use('/logout', jwtauth);
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



// get the last bike data point of a user in a session
router.post("/data/last", function(req,res){
	// console.log("in data last");
	SessionData.findOne({
		where: {
			userID:req.body.userID,
			stampEnd: null
		}
	}).then(function(session){
		if (session) {
			BikeData.findAll({
				limit: 1,
				order: [
					['stamp', 'DESC']
				],
				where: {sessionID: session.sessionID}
			}).then(function(list){
				data = list[0];
				var current_time = new Date().getTime()
				if (current_time - data.stamp < 1000) {
					res.send({success: true, rpm: data.rpm})
				}
				else {
					res.send({success: true, rpm: 0})
				}
			})
		}
		else {
			res.send({success: false, rpm: 0})
		}
	})
	// 	then(function(list){
	// 	console.log("list",list);
	// 	res.setHeader('Content-Type', 'application/json');
	// 	res.send(list);
	// })
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

// Helper Functions

String.prototype.toHHMMSS = function () {
    //console.log(this)
    // this should be in milliseconds, second parameter is the base (i.e., decimal)
    var sec_num = parseInt(this, 10) / 1000
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60)
    var seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60))

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

router.post("/average_duration", function(req, res){
	SessionData.findAll({
		where: {
			userID: req.body.userID,
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
					total_dur = total_dur + parseInt(end - start)
				}
			}
			if (count != 0) {
				res.send({success: true, duration: String(total_dur / parseFloat(count)).toHHMMSS()})
			}
		})
	})

router.post("/workout_duration", function(req, res){
	SessionData.findOne(
		{where: {
			userID: req.body.userID,
			stampEnd: null
		}}).then(function(ses) {

			if (ses) {
				var start = parseInt(ses.stampStart)
				var end = new Date().getTime()
				res.send({success: true, duration: end - start})
			}
			else {
				res.send({success: false, duration: ""})
			}
		});
	})

router.post("/check_active_session", function(req, res){
	SessionData.findOne({
		where: {
			userID: req.body.userID,
			stampEnd: null
		}
	}).then(function(session){
		if (session) {
			res.send({active: true})
		}
		else {
			res.send({active: false})
		}
	})
})

// the most recent workout is defined to be the one that was created most recently
router.post("/get_last_workout", function(req, res){
	SessionData.max('stampStart', {
		where: {
			userID: req.body.userID,
			stampEnd: {
				$ne: null
			}
		}
	}).then(function(stampStart) {
		if (stampStart) {
			var dateTime = moment(parseInt(stampStart)).tz("America/Chicago").format("dddd MMMM Do, h:mm A");
			res.send({status: "success", date: dateTime});
		} else {
			res.send({status: "failure", date: ""})
		}
	})
})

router.get("/test_connection", function(req, res) {
	res.send({status: "success"});
});

// POST REQUESTS

router.post("/verifysecretcode", function(req,res){
	User.findOne({
		where:{
			email: req.body.email
		}
	}).then(function(user){
		if (user){
			bcrypt.compare((req.body.secretcode.toString()), String(user.resetpasswordcode), function(err, response) {
				if (response){
					res.send({status: 200})
				}
				else{
					res.send({status: "failure"});
				}
			}
			)}
			else {
				res.send({status: "failure"});
			}
		})
})

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


router.post("/forgotpasswordchange", function(req, res){
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(function(user){
		if (user) {
			bcrypt.genSalt(10,function(err,salt){
				bcrypt.hash(req.body.password, salt, function(err,hash){
					User.update({
						pswd: hash,
						resetpasswordcode: null
					}, {
						where: {
							email: req.body.email
						}
					})
				})
			})
			res.send({status:200})
		}
		else{
			res.send({status:"failure"})
		}
	})
});

router.post("/sendresetpassword",function(req, res){
	User.findOne({
		where:{
			email: req.body.email
		}
	}).then(function(user){
		if (user){
			var resetcode = Math.floor((Math.random() * 99999) + 1);
            var ses_mail = "From: 'Digital Gym Reset Password' <" + req.body.email + ">\n";
			ses_mail = ses_mail + "To: " + req.body.email + "\n";
			ses_mail = ses_mail + "Subject: Digital Gym Reset Password\n";
			ses_mail = ses_mail + "MIME-Version: 1.0\n";
			ses_mail = ses_mail + "Content-Type: multipart/mixed; boundary=\"NextPart\"\n\n";
			ses_mail = ses_mail + "--NextPart\n";
			ses_mail = ses_mail + "Content-Type: text/html; charset=us-ascii\n\n";
			ses_mail = ses_mail + "Your secret code is: "+ resetcode.toString()+"\n\n This code only works once. This is an automated message. Please do not respond. \n\n";
			ses_mail = ses_mail + "--NextPart--";

			var params = {
				RawMessage: { Data: new Buffer(ses_mail) },
				Destinations: [ req.body.email ],
				Source: "'Digital Gym Reset Password' <" + req.body.email + ">'"
			};

			ses.sendRawEmail(params, function(err, data) {
				if(err) {
                    res.send({status: "failure"})
					throw err}
					else {
                            bcrypt.genSalt(10,function(err,salt){
                            bcrypt.hash(resetcode.toString(), salt, function(err,hash){
                                User.update({
                                    resetpasswordcode: hash
                                }, {
                                    where: {
                                        email: req.body.email
                                    }
                                })
                            })
                        })
						res.send({status: 200});
					}
				});

		}
		else
			res.send({status: "failure"})
	})
})


router.post("/changepassword", function(req, res){

	User.findOne({
		where: {
			id: req.body.userId
		}
	}).then(function(user){
		if (user) {
			bcrypt.compare(req.body.oldpw, String(user.pswd), function(err, response) {
				if (response){
					bcrypt.genSalt(10,function(err,salt){
						bcrypt.hash(req.body.newpw, salt, function(err,hash){
							User.update({
								pswd: hash
							}, {
								where: {
									id: req.body.userId
								}
							})
						})
					})
					res.send({status:"success"})
				}
				else
					res.send({status:"failure"})
			})
		}
	})
});

router.post("/login", function(req, res) {
	// console.log("Login Information: " + JSON.stringify(req.headers));
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(function(user) {
		if (!user) {
			return res.send({status: 403});
		}
		if (user) {
			bcrypt.compare(req.body.password, String(user.pswd), function(err, response) {
				if (response){
					// console.log("Login UserID: " + user.id);
                	// var expires = moment().add('days', 7).valueOf();
                	var token = jwt.sign({userName: user.name, userID: user.id, email: user.email}, 'ashu1234');
                	res.json({
                		token: token,
                		userName: user.name,
                		userID: user.id,
                		email: user.email
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
});

router.post("/start_workout", function(req, res) {
	// console.log("Entered start_workout");
	RaspberryPi.findOne({
		where: {
			serialNumber: req.body.serialNumber
		}
	}).then(function(RaspPi) {
		if (RaspPi) {
			SessionData.findOne({
				where: {
					machineID: RaspPi.machineID,
					stampEnd: null
				}
			}).then(function(session) {
				if (session) {
					res.send({status: "Exists", message: "Session is in progress."})
				} else {
					SessionData.create({
						stampStart: new Date().getTime(),
						machineID: RaspPi.machineID
					})
					res.send({status: "Created", message: "Session has been created."})
				}
			})
		} else {
			res.send({status: "None found", message: "Could not find machine (Pi)."})
		}
	})
})

router.post("/end_workout", function(req, res) {
	// console.log("Entered end_workout");
	RaspberryPi.findOne({
		where: {
			serialNumber: req.body.serialNumber
		}
	}).then(function(RaspPi) {
		if (RaspPi) {
			SessionData.update({
				stampEnd: new Date().getTime()
			}, {
				where: {
					machineID: RaspPi.machineID,
					stampEnd: null
				}
			}).then(function(pair) {
				if (pair[0] != 1) {
					res.send({status: "failure1"});
				}
				else {
					res.send({status: "success"});
				}
			}).error(function(error) {
				res.send({status: "failure2"});
			})
		} else {
			res.send({status: "failure3"});
		}
	}).error(function(error) {
		res.send({status: "failure4"});
	})
});

// processes the tag after scanning

// TODO: Change code so that in case that a session is in progress, and someone scans a
// tag that is different from the tag that had been scanned for the session in progress,
// the session in progress should end and another session should be created. At the moment,
// the tag of the session in progress is updated with the RFID of the most recently scanned
// tag, but a new session is not created.

router.post("/process_tag", function(req, res) {
	// console.log("Entered process_tag");
	Tag.findOne({
		where: {
			RFID: req.body.RFID
		}
	}).then(function(tag) {
		if (tag) {
			RaspberryPi.findOne({
				where: {
					serialNumber: req.body.serialNumber
				}
			}).then(function(RaspPi) {
				SessionData.update({
					RFID: req.body.RFID,
					userID: tag.dataValues.userID
				}, {
					where: {
						machineID: RaspPi.machineID,
						stampEnd: null
					}
				}).then(function(pair) {
					if (pair[0] == 0) {
						// console.log("UserID from Tag in process_tag: " + tag.dataValues.userID);
						// console.log("UserID from Tag in process_tag without dataValues: " + tag.userID);
						SessionData.create({
							RFID: req.body.RFID,
							userID: tag.dataValues.userID,
							machineID: RaspPi.machineID,
							stampStart: new Date().getTime()
						})
						res.send({status: "Created", message: "Session has been created since one is not in progress."})
					} else {
						// console.log("UserID from Tag in process_tag second: " + tag.dataValues.userID);
						// console.log("UserID from Tag in process_tag without dataValues second: " + tag.userID);
						res.send({status: "Updated", message: "Session in progress has been updated."});
					}
				})
			})
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
	// console.log("Req from check_tag: " + req.body.userID);
	Tag.update({
		registered: true,
		tagName: req.body.tagName,
		userID: req.body.userID
	}, {
		where: {
			machineID: req.body.machineID,
			registered: false
		}
	}).then(function(pair) {
		if (pair[0] > 0) {
			res.send({status: 'success'});
		}
		else {
			res.send({status: 'failure'});
		}
	}).error(function(e) {
		res.send({status: 'failure'});
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

// router.post("/addname", function(req, res){
// 	User.update({
//   	name: req.body.name,
// },{
// 		where:
// 			[{id: req.body.userID}]
// 	}).then(function(list){
//         res.send({status: "success"});
// 	}).error(function(e){
// 		res.send({status: "failure"})
// 	})
// });
// router.post("/addemailgender", function(req, res){
// 	User.update({
//  	email: req.body.name,
//  	gender: req.body.gender
// },{
// 		where:
// 			[{id: req.body.userID}]
// 	}).then(function(list){
//         res.send({status: "success"});
// 	}).error(function(e){
// 		res.send({status: "failure"})
// 	})
// });

router.post("/bike", function(req, res){
	RaspberryPi.findOne({
		where: {serialNumber: req.body.serialNumber}
	}).then(function(RaspPi) {
		if (RaspPi) {
			SessionData.findOne({
				where: {
					stampEnd: null,
					machineID: RaspPi.machineID
				}
			}).then(function(session) {
				if (session) {
					BikeData.create({
						stamp: new Date().getTime(),
						rpm: req.body.rpm,
						bikeID: RaspPi.machineID,
						sessionID: session.sessionID
					});
					res.send({status: "success"});
				} else {
					res.send({status: "failure"});
				}
			})
		} else {
			res.send({status: "failure"});
		}
	});
});


router.post("/history", function(req,res){
	SessionData.findAll({
		where: {
			userID: req.body.userID,
			stampEnd: {
				$ne: null
			}
		}
	}).then(function(sessions) {
		//console.log(sessions);
		history_list = []
		var promises = []
		var milli_to_minutes = (1/60000.0)

		Promise.all(
			sessions.map(function(session) {
				console.log("SESSION INSIDE PROMISE: " + JSON.stringify(session));
				console.log("SESSION INDEX INSIDE PROMISE: " + sessions.indexOf(session));
				console.log("HISTORY INSIDE PROMISE: " + JSON.stringify(history_list));
				BikeData.findAll({
					where: {
						sessionID: session.sessionID
					}
				}).then(function(data) {

					total = 0.0

					history = {}

					for (point in data) {
						total += data[point].dataValues.rpm
					}

					expectation = (data.length == 0) ? 0.00 : (total/data.length)

					history.average_rpm = expectation.toFixed(2);
					history.duration = String(session.stampEnd - session.stampStart).toHHMMSS()
					var dateTime = moment(parseInt(session.stampStart)).tz("America/Chicago").format("ddd MMM DD YYYY, h:mm A");
					history.date = dateTime;

					history_list.push(history);

					return -1;
				})
			})
		).then(function(session) {
			console.log("HISTORY LIST: " + JSON.stringify(history_list));
			res.send(history_list);
		});

		// for (var i = 0; i < sessions.length; i++) {			
		// 	const session = i
		// 	console.log("SESSSION NUMBERRR IN LOOP: " + i)
		// 	var milli_to_minutes = (1/60000.0)

		// 	history_list.push({})

		// 	promises.push(
		// 		BikeData.findAll({
		// 			where: {
		// 				sessionID: sessions[session].sessionID
		// 			}
		// 		}).then(function(data) {
		// 			console.log("SESSSION NUMBERRR IN PROMISE: " + session)
		// 			total = 0.00

		// 			for (point in data) {
		// 				total += data[point].dataValues.rpm
		// 			}

		// 			expectation = (data.length == 0) ? 0.00 : (total/data.length)
		// 			history_list[session].average_rpm = expectation.toFixed(2);
		// 			history_list[session].duration = String(sessions[session].stampEnd - sessions[session].stampStart).toHHMMSS()

		// 			var dateTime = moment(parseInt(sessions[session].stampStart)).tz("America/Chicago").format("ddd MMM DD YYYY, h:mm A");
		// 			history_list[session].date = dateTime;

		// 			return -1;
		// 		})
		// 	)
		// }
		// Promise.all(promises).then(function(session) {
		// 	//console.log(history_list);
		// 	res.send(history_list);
		// });
	})
})


module.exports = router;
