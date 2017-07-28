// Routers, Models, and Packages

// "Life is unfair, and then you die, motherfucker!" - Jacob Burger & Hamza Nauman
// Rushi Bhalani's idea ^

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
var utils = require('./bbb_router_utils.js')
var config = require('../dev-config');

var app = express();

var aws = require("aws-sdk");
aws.config.update({
	region: "us-west-2",
});

var ses = new aws.SES({"accessKeyId": "", "secretAccessKey":"","region":"us-west-2"})


var test = config.db.test

// sets up authorization where it matters
// TODO: Condense this into a function that excludes certain paths
router.use('/users', jwtauth);
router.use('/data', jwtauth);
router.use('/data/last', jwtauth);
router.use('/sessionlisten', jwtauth);
router.use('/average_duration', jwtauth);
router.use('/workout_duration', jwtauth);
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

// get the last three bike data points of a user in a current session
router.post("/data/last", function(req, res){
	utils.findCurrentSessionUsingUserID(req.body.userID).then(function(session) {
		if (session) {
			BikeData.findAll({
				limit: 3,
				order: [
					['stamp', 'DESC']
				],
				where: {
					sessionID: session.sessionID
				}
			}).then(function(data){
				if (data) {
					if (data.length > 0) {
						var avg_rpm = 0
						for (var i = 0; i < data.length; i++) {
							avg_rpm += data[i].rpm
						}
						var current_time = new Date().getTime()
						res.send({status: "success", rpm: (current_time - parseInt(data[0].stamp) < 1500) ? (avg_rpm / 3) : 0})
					}
				} else {
					res.send({status: "failure", rpm: 0})
				}
			})
		}
		else {
			res.send({status: "failure", rpm: 0})
		}
	})
})

// Helper Functions

// TODO: Move this function to "bbb_router_utils.js" if possible
String.prototype.toHHMMSS = function () {
    //console.log(this)
    // this should be in milliseconds, second parameter is the base (i.e., decimal)
    var sec_num = parseInt(this, 10) / 1000
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60)
    var seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60))

    if (hours   < 10) {hours   = "0" + hours;}
    if (minutes < 10) {minutes = "0" + minutes;}
    if (seconds < 10) {seconds = "0" + seconds;}
    return (hours + ':' + minutes + ':' + seconds);
}

router.post("/average_duration", function(req, res){
	utils.findEndedSessionsUsingUserID(req.body.userID).then(function(sessions){
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

router.post("/deleteworkout", function(req,res){
    SessionData.findOne({
        where: {
            sessionID: req.body.sessionid
        }
    }).then(function(session){
        if (session){
            SessionData.destroy({
                where: {
                    sessionID: req.body.sessionid
                }
            })
            res.send({status: "success"})
        }
    })
})

router.post("/deleteaccount", function(req,res){
    User.findOne({
		where: {
			id: req.body.id
		}
	}).then(function(user){
     bcrypt.compare(req.body.password, String(user.pswd), function(err, response) {
				if (response){
                   User.destroy({
                    where: {
                       id: req.body.id
                    }
                }) 
                Tag.destroy({
                    where: {
                       userID: req.body.id
                    }
                })
                SessionData.destroy({
                    where: {
                       userID: req.body.id
                    }
                }) 
            res.send({status: "success"})
                }   
    })
})
})

router.post("/workout_duration", function(req, res){
	utils.findCurrentSessionUsingUserID(req.body.userID).then(function(ses) {
		if (ses) {
			var start = parseInt(ses.stampStart)
			var end = new Date().getTime()
			console.log(ses.sessionID)
			res.send({success: true, duration: end - start})
		}
		else {
			res.send({success: false, duration: ""})
		}
	});
})

router.post("/check_active_session", function(req, res){
	utils.findCurrentSessionUsingUserID(req.body.userID).then(function(session){
		res.send({active: (session ? true : false)})
	})
})

// the most recent workout is defined to be the one that was created most recently
router.post("/get_last_workout", function(req, res){
	utils.findStartTimeOfLatestEndedSessionUsingUserID(req.body.userID).then(function(stampStart) {
		if (stampStart) {
			var dateTime = moment(parseInt(stampStart)).tz("America/Chicago").format("dddd MMMM Do, h:mm A");
			res.send({status: "success", date: dateTime});
		} else {
			res.send({status: "failure", date: ""})
		}
	})
})

// POST REQUESTS

router.post("/test_connection", function(req, res) {
	utils.updatePingTime(req.body.serialNumber).then(function(pair) {
		if (pair[0] == 1) {
			res.send({status: "success"});
		} else {
			res.send({status: "No Pi"})
		}
	})
});

router.post("/reboot", function(req, res) {
	utils.updateRebootTime(req.body.serialNumber).then(function(pair) {
		if (pair[0] == 1) {
			res.send({status: "success"})
		} else {
			res.send({status: "No Pi"});
		}
	})
})

router.post("/verifysecretcode", function(req,res){
	utils.findUserUsingEmail(req.body.email).then(function(user) {
		if (user) {
			bcrypt.compare(req.body.secretcode.toString(), String(user.resetpasswordcode), function(err, response) {
				res.send({status: response ? 200 : "failure"})
			})
		} else {
			res.send({status: "failure"});
		}
	})
})

router.post("/setup_account", function(req, res) {
	utils.findUserUsingEmail(req.body.email).then(function(user) {
		if (user) {
			res.send({status: "409"})
		}
		else {
			bcrypt.genSalt(10, function(err, salt) {
				bcrypt.hash(req.body.password, salt, function(err, hash) {
					utils.createUser(req.body.name, req.body.email, hash, null, null, null, null, null, null).then(function(user){
						if (user){
							var token = jwt.sign({userName: user.name, userID: user.id, email: user.email}, 'ashu1234');
							res.send({
								token: token,
								userName: user.name,
								userID: user.id,
								email: user.email,
								status: "success"
							});
						}
						else{
							res.send({status: "failure"})
						}
					})
				});
			})};
		})
});



router.post("/forgotpasswordchange", function(req, res){
	utils.findUserUsingEmail(req.body.email).then(function(user) {
		if (user) {
            bcrypt.compare(req.body.secretcode.toString(), String(user.resetpasswordcode), function(err, response) {
                if (response){
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


		}
		else{
			res.send({status:"failure"})
		}
	})
});

router.post("/sendresetpassword",function(req, res){
	utils.findUserUsingEmail(req.body.email).then(function(user){
		if (user){
			var resetcode = Math.floor((Math.random() * 99999) + 1);
            var ses_mail = "From: 'Digital Gym Reset Password' < rice.sensor@gmail.com >\n";
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
				Source: "'Digital Gym Reset Password' < rice.sensor@gmail.com >'"
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
	utils.findUserUsingEmail(req.body.email).then(function(user) {
		if (!user) {
			return res.status(403).send({status: 403});
		}
		if (user) {
			bcrypt.compare(req.body.password, String(user.pswd), function(err, response) {
				if (response){
                	// var expires = moment().add('days', 7).valueOf();
                	var token = jwt.sign({userName: user.name, userID: user.id, email: user.email}, 'ashu1234', {noTimestamp: true});
                	res.json({
                		token: token,
                		userName: user.name,
                		userID: user.id,
                		email: user.email
				    	// expires: expires
				    });
                }
                else {
                	res.status(401).send({status: 401});
                }
            })
		}
	})
});

router.post("/logout", function(req, res){
	User.findOne({
		where: {
			id: req.body.userID
		}
	}).then(function(user) {
		res.send({status: user ? "success" : "failure"});
	})
});

router.post("/start_workout", function(req, res) {
	utils.findRaspPiUsingSerial(req.body.serialNumber).then(function(RaspPi) {
		if (RaspPi) {
			utils.findCurrentSessionUsingMachineID(RaspPi.machineID).then(function(session) {
				if (session) {
					res.send({status: "Exists", message: "Session is in progress."})
				} else {
					utils.createSession(RaspPi.machineID, null, null).then(function() {
						res.send({status: "Created", message: "Session has been created."})
					})
				}
			})
		} else {
			res.send({status: "No Pi", message: "Could not find machine (RaspPi)."})
		}
	})
})

router.post("/end_workout", function(req, res) {
	utils.findRaspPiUsingSerial(req.body.serialNumber).then(function(RaspPi) {
		if (RaspPi) {
			utils.endSession(RaspPi.machineID).then(function(pair) {
				res.send({status: pair[0] == 1 ? "success" : (pair[0] < 1 ? "No session ended" : "More than one session ended")})
			})
		} else {
			res.send({status: "No Pi", message: "Could not find machine (RaspPi)."})
		}
	})
});

// processes the tag after scanning

// TODO: Change code so that in case that a session is in progress, and someone scans a
// tag that is different from the tag that had been scanned for the session in progress,
// the session in progress should continue **unless** the session in progress has not
// registered an RPM in the last 10 seconds. At the moment, the tag of the session in progress
// is updated with the RFID of the most recently scanned tag.
// RESOLVED BUT REQUIRES TESTING

// TODO: Resolve issue of scanning the same original tag during a session in progress that had
// been used to create that session in the first place.
// RESOLVED BUT REQUIRES TESTING

// TODO: What if user scans a different tag associated with his account 15s after last rpm?
// Ask Ashu

router.post("/process_tag", function(req, res) {
	utils.findTag(req.body.RFID).then(function(tag) {
		//if that tag exists
		if (tag) {
				//finds the current machine
				utils.findRaspPiUsingSerial(req.body.serialNumber).then(function(RaspPi) {
					//*** scope of current machine ***
					//finds current session
					utils.findCurrentSessionUsingMachineID(RaspPi.machineID).then(function(session) {
						//either finds a session in existence or...
						if (session) {
							//checks the last 10 seconds of bike data
							utils.findRecentBikeData(session.sessionID, 10).then(function(datum) {
								//checks if the current session is tied to a tag
								if (session.RFID) {
									//if there was activity in the last 10 seconds, do nothing
									if (datum) {
										res.send({status: "failure", message: "Tag not processed! Session in progress!"})
									} else {
										//if a new tag is scanned, end the current session and start a new one with the scanned tag
										if (session.RFID != tag.RFID) {
											utils.endSession(RaspPi.machineID).then(function(endedSession) {
												if (endedSession[0] > 0) {
													utils.createSession(RaspPi.machineID, tag.RFID, tag.userID).then(function(createdSession) {
														res.send({status: createdSession ? "success" : "failure"})
													})
												} else {
													res.send({status: "failure", message: "Could not end session in progress."})
												}
											})
										//do nothing if the same tag is scanned again
										} else {
											res.send({status: "failure", message: "Same tag has been scanned again."})
										}
									}
								} else {
									//associates scanned tag with current session
									utils.addTagToSession(req.body.RFID, tag.dataValues.userID, RaspPi.machineID).then(function(updatedSession) {
										res.send({status: (updatedSession[0] == 1) ? "updated" : "failure",
											message: (updatedSession[0] == 1) ? "Session in progress has been updated." : "Session in progress could not be updated."})
									})
								}
							})
						//creates a session
						} else {
							utils.createSession(RaspPi.machineID, tag.RFID, tag.userID).then(function(createdSession) {
								res.send({status: createdSession ? "success" : "failure"})
							})
						}
					})
				})
		} else {
			// TODO: Should tag still be created if there is another session in progress on this machine's Pi?
			utils.findRaspPiUsingSerial(req.body.serialNumber).then(function(RaspPi) {
				if (RaspPi) {
					utils.createTag(req.body.RFID, null, null, RaspPi.machineID, false);
					res.send({status: "Tag created"});
				} else {
					res.send({status: "No Pi", message: "Could not find machine (RaspPi)."})
				}
			})
		}
	})
})

router.post("/check_rpm", function(req, res) {
	res.send({status: "received"})
	setTimeout(function() {
		utils.findRaspPiUsingSerial(req.body.serialNumber).then(function(RaspPi) {
			utils.findCurrentSessionUsingMachineID(RaspPi.machineID).then(function(session) {
				if (session) {
					utils.findRecentBikeData(session.sessionID, 30).then(function(data) {
						if (!data) {
							utils.endSession(RaspPi.machineID)
						}
					})
				}
			})
		})
	}, 30000)
})

router.post("/check_tag", function(req, res) {
	utils.registerTag(req.body.tagName, req.body.userID, req.body.machineID).then(function(pair) {
		if (pair[0] > 0) {
			res.send({status: "success"})
		} else {
			res.send({status: "failure"})
		}
	})
})

router.post("/bike", function(req, res){
	utils.findRaspPiUsingSerial(req.body.serialNumber).then(function(RaspPi) {
		if (RaspPi) {
			utils.findCurrentSessionUsingMachineID(RaspPi.machineID).then(function(session) {
				if (session) {
					utils.createBikeData(req.body.rpm, RaspPi.machineID, session.sessionID).then(function(data) {
						res.send({status: (data ? "success" : "failure")})
					})
				} else {
					res.send({status: "No Session"});
				}
			})
		} else {
			res.send({status: "No Pi"});
		}
	});
});


router.post("/history", function(req,res){
	utils.findEndedSessionsUsingUserID(req.body.userID).then(function(sessions) {
		history_list = []

		Promise.all(
			sessions.map(function(session) {
				return utils.findBikeData(session.sessionID).then(function(data) {
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
					history.start = session.stampStart;
                    history.sessionid = session.sessionID

					history_list.push(history);
					return
				})
			})
		).then(function(session) {
			res.send(history_list);
		});
	})
})
// session_data.id = session.sessionID
// session_data.machineID = session.machineID
// session_data.userID = session.userID
router.post("/admin_data", function(req, res) {
	utils.findAllPis().then(function(bikes) {
		admin_data = {} // Outermost JSON object to send
		Promise.all( // Wait on data for all bikes to be added before sending the response
			bikes.map(function(bike) {
				admin_data[(bike.machineID)] = [] // Array of sessions for each bike
				return utils.findEndedSessionsOnMachine(bike.machineID).then(function(sessions) {
					return Promise.all( // Wait on all session to be added for bike before moving on
						sessions.map(function(session) {
							return utils.findBikeData(session.sessionID).then(function(data) {
								var total = 0
								for (datum in data) {
									total += data[datum].rpm
								}
								session_data = {}
								session_data.avg_rpm = (data.length == 0) ? 0 : total / data.length
								session_data.duration = (parseInt(session.stampEnd) - parseInt(session.stampStart)) / 1000.0
								session_data.date = moment(parseInt(session.stampStart)).tz("America/Chicago").format("YYYY-MM-DD HH:mm:ss:SSS");
								session_data.day = moment(parseInt(session.stampStart)).tz("America/Chicago").format("dddd")
		
								admin_data[(bike.machineID)].push(session_data) // Added session data to array for bike
							})	
						})
					).then(function() {
						admin_data[(bike.machineID)].sort(function(a, b) { // Sort each array of sessions for each bike by start time
							var d1 = new Date(a.date).getTime();
							var d2 = new Date(b.date).getTime();
							return d2 < d1;
						})
					})	
				})
			})
		).then(function() {
			res.send(admin_data);
		})	
	})
})


// TESTING ROUTES

router.post("/add_test_data", function(req, res) {
	if (test) {
		var values = req.body.values
		switch(req.body.table) {
			case "BikeData":
				utils.createBikeData(values.rpm, values.bikeID, values.sessionID).then(function() {
					res.send({status: "success"})
				})
				// res.send({status: "success"})
				break
			case "RaspberryPi":
				utils.createRaspberryPi(values.serialNumber, values.machineID, values.machineType).then(function() {
					res.send({status: "success"})
				})
				// res.send({status: "success"})
				break
			case "SessionData":
				utils.createSession(values.machineID, values.RFID, values.userID).then(function() {
					res.send({status: "success"})
				})
				// res.send({status: "success"})
				break
			case "Tag":
				utils.createTag(values.RFID, values.tagName, values.userID, values.machineID, values.registered).then(function() {
					res.send({status: "success"})
				})
				// res.send({status: "success"})
				break
			case "User":
				bcrypt.genSalt(10, function(err, salt) {
					bcrypt.hash(values.pswd, salt, function(err, hash) {
						utils.createUser(values.name, values.email, hash, values.gender, values.weight, values.age, values.height, values.RFID, values.resetpasswordcode).then(function() {
							res.send({status: "success"})
						})
					})
				})						
				// res.send({status: "success"})
				break
			default:
				res.status(404).send({status: "failure"})

		}
	} else {
		res.send({status: "failure"})
	}	
})


router.post("/clear_test_tables", function(req, res) {
	if (test) {
		utils.clearTestTables().then(function(promise) {
			if (promise) {
				res.send({status: "success"})
			} else {
				res.send({status: "failure"})
			}
		})
	} else {
		res.send({status: "failure"})
	}
})


module.exports = router;
