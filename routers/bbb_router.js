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

var app = express();

var aws = require("aws-sdk");
aws.config.update({
    region: "us-west-2",
});

var ses = new aws.SES({"accessKeyId": "", "secretAccessKey":"","region":"us-west-2"})


// sets up authorization where it matters
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


router.get("/verifysecretcode", function(req,res){
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

// get the last bike data point of a user in a session
router.get("/data/last", function(req,res){
	SessionData.max('stampStart',{
		where: {userID:id}
	}).then(function(stampStart){
		BikeData.max('stamp',{
			where: {sessionID: stampStart}
		})
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
						userID: req.body.userID,
            stampEnd: null
        }}).then(function(ses) {
        	var start = parseInt(ses.stampStart)
			var end = new Date().getTime()
        	res.send({success: true, duration: String((end - start)).toHHMMSS()})
        });
})

// the most recent workout is defined to be the one that was created most recently
router.get("/get_last_workout", function(req, res){
	console.log("Get Last Workout Information: " + JSON.stringify(req.headers));
	SessionData.findAll(
		{where: {
			userID: req.body.userID,
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

                var ses_mail = "From: 'Digital Gym Reset Password' <" + req.body.email + ">\n";
                ses_mail = ses_mail + "To: " + req.body.email + "\n";
                ses_mail = ses_mail + "Subject: Digital Gym Reset Password\n";
                ses_mail = ses_mail + "MIME-Version: 1.0\n";
                ses_mail = ses_mail + "Content-Type: multipart/mixed; boundary=\"NextPart\"\n\n";
                ses_mail = ses_mail + "--NextPart\n";
                ses_mail = ses_mail + "Content-Type: text/html; charset=us-ascii\n\n";
                ses_mail = ses_mail + "Your secret code is: "+ resetcode.toString()+"\n\n This is an automated message. Please do not respond. \n\n";
                ses_mail = ses_mail + "--NextPart--";

                var params = {
                    RawMessage: { Data: new Buffer(ses_mail) },
                    Destinations: [ req.body.email ],
                    Source: "'Digital Gym Reset Password' <" + req.body.email + ">'"
                };

                ses.sendRawEmail(params, function(err, data) {
                    if(err) {
                        throw err}
                    else {
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
	RaspberryPi.findOne({
		where: {
			serialNumber: req.body.serialNumber
		}
	}).then(function(RaspPi) {
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
			}
		})
	})
})

router.post("/end_workout", function(req, res) {
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
					machineID: RaspPi.machineID
				}
			}).then(function(pair) {
				if (pair[0] != 1) {
					res.send({status: "failure"});
				}
				else {
					res.send({status: "success"});
				}
			}).error(function(error) {
				res.send({status: "failure"});
			})
		} else {
			res.send({status: "failure"});
		}
	}).error(function(error) {
		res.send({status: "failure"});
	})
});

//processes the tag after scanning
router.post("/process_tag", function(req, res) {
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
						SessionData.create({
							RFID: req.body.RFID,
							userID: tag.dataValues.userID,
							machineID: RaspPi.machineID,
							stampStart: new Date().getTime()
						})
					}
				})		
			})
			res.send({status: "Repeat", message: "This tag has been scanned before."});
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
			BikeData.create({
				stamp: new Date().getTime(),
				rpm: req.body.rpm,
				bikeID: RaspPi.machineID,
			})
			res.send({status: "success"});
		} else {
			res.send({status: "failure"})
		}
	})
});
router.post("/history", function(req,res){
	SessionData.findAll({
		where: {
			userID: req.body.userID,
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
