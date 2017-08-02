var chai = require('chai');
var chaiHTTP = require('chai-http');
var utils = require('../routers/bbb_router_utils.js')
var moment = require('moment-timezone');
var API_ENDPOINT = "http://127.0.0.1:8000/bbb";
var bcrypt = require('bcryptjs');
var jwt = require ('jsonwebtoken');
// var API_ENDPOINT = "http://52.34.141.31:8000/bbb"


chai.use(chaiHTTP);

var assert = chai.assert;
var expect = chai.expect;

function send_add_to_db_request(options) {
	return chai.request(API_ENDPOINT)
	.post('/add_test_data')
	.send(options);
}

function clear_db() {
	return chai.request(API_ENDPOINT)
	.post('/clear_test_tables')	
}

var testDB = false;
var testServ = true;
var testAdmin = false;

var defaultRaspPi1 = {table: "RaspberryPi", values: {serialNumber: 100, machineID: 1, machineType: "Bike"}}
var defaultRaspPi2 = {table: "RaspberryPi", values: {serialNumber: 101, machineID: 2, machineType: "Bike"}}
var defaultSession1 = {table: "SessionData", values: {machineID: 1, RFID: 69, userID: 1}}
var defaultSession2 = {table: "SessionData", values: {machineID: 1, RFID: 70, userID: 2}}
var defaultSession3 = {table: "SessionData", values: {machineID: 2, RFID: 70, userID: 2}}
var defaultSession4 = {table: "SessionData", values: {machineID: 1}}
var defaultRPM1 = {table: "BikeData", values: {rpm: 50, bikeID: 1, sessionID: 1}}
var defaultRPM2 = {table: "BikeData", values: {rpm: 100, bikeID: 1, sessionID: 1}}
var defaultRPM3 = {table: "BikeData", values: {rpm: 90, bikeID: 2, sessionID: 3}}
var defaultUser = {table: 'User', values: {id: 1, name: 'Test', email: 'test@rice.edu', pswd: 'ashu1234'}}
var defaultTag1 = {table: "Tag", values: {RFID: 69, machineID: 1, registered: false}}
var defaultTag2 = {table: "Tag", values: {RFID: 70, machineID: 1, registered: false}}

var defaultToken = jwt.sign(defaultUser.values, 'ashu1234');

if (testDB) {
	describe('Test DB Modification Functions', function() {
		describe('/add_test_data', function() {
			it('should add bike data to DB', function(done) {
				chai.request(API_ENDPOINT)
					.post('/add_test_data')
					.send({table: "BikeData", values: {rpm: 9000.1, bikeID: 3, sessionID: 2}})
					.end(function(err, res) {
						expect(err).to.be.null;
						expect(res).to.have.status(200);
						assert.equal(res.body.status, "success");
						done()
					})
				// utils.createBikeData(9000.1, 3, 2).then(function() {
				// 	done();
				// });

			})

			it('should add Raspberry Pi to DB', function(done) {
				chai.request(API_ENDPOINT)
					.post('/add_test_data')
					.send({table: "RaspberryPi", values: {serialNumber: 447553254, machineID: 6, machineType: "Bike"}})
					.end(function(err, res) {
						expect(err).to.be.null;
						expect(res).to.have.status(200);
						assert.equal(res.body.status, "success");
						done()
					})
				// utils.createRaspberryPi(447553254, 6, "Bike").then(function() {
				// 	done();
				// });
			})

			it('should add session data to DB', function(done) {
				chai.request(API_ENDPOINT)
					.post('/add_test_data')
					.send({table: "SessionData", values: {machineID: 9001, RFID: 120000, userID: 5}})
					.end(function(err, res) {
						expect(err).to.be.null;
						expect(res).to.have.status(200);
						done()
					})
				// utils.createSession(9001, 120000, 5).then(function() {
				// 	done();
				// });
			})
			it('should add tag to DB', function(done) {
				chai.request(API_ENDPOINT)
					.post('/add_test_data')
					.send({table: "Tag", values: {RFID: 120000, tagName: "Ginyu", userID: 5, machineID: 9001, registered: false}})
					.end(function(err, res) {
						expect(err).to.be.null;
						expect(res).to.have.status(200);
						assert.equal(res.body.status, "success");
						done()
					})
				// utils.createTag(120000, "Ginyu", 5, 9001, false).then(function() {
				// 	done();
				// });
			})
			it('should add user to DB', function(done) {
				chai.request(API_ENDPOINT)
					.post('/add_test_data')
					.send({table: "User", values: {name: "Frieza", email: "fc@rice.edu", pswd: "fucksaiyans"}})
					.end(function(err, res) {
						expect(err).to.be.null;
						expect(res).to.have.status(200);
						assert.equal(res.body.status, "success");
						done()
					})
				// utils.createUser("Frieza", "fc@rice.edu", "fucksaiyans", null, null, null, null, null, null).then(function() {
				// 	done();
				// });
			})
		})

		describe('/clear_test_tables', function() {
			it('should empty the tables in the test DB',function(done) {
				chai.request(API_ENDPOINT)
					.post('/clear_test_tables')
					.end(function(err, res) {
						expect(err).to.be.null;
						expect(res).to.have.status(200);
						assert.equal(res.body.status, "success");
						done();
					})
				// utils.clearTestTables().then(function() {
				// 	done()
				// });
			})
		})
	})
}	

if (testServ) {
	describe('Server Connections', function() {
		// describe('/test_connection', function() {
		// 	it('should return appropriate status if no rasp pi', function(done) {
		// 		chai.request(API_ENDPOINT)
		// 		.post('/test_connection')
		// 		.end(function (err, res) {
		// 			expect(err).to.be.null;
		// 			expect(res).to.have.status(200);
		// 			assert.equal(res.body.status, "No Pi");
		// 			done();
		// 		})
		// 	});

		// 	it('should return status and update last ping time', function(done) {
		// 		send_add_to_db_request(defaultRaspPi1).then(function() {
		// 			utils.findRaspPiUsingSerial(defaultRaspPi1.values.serialNumber).then(function(RaspPi) {
		// 				assert.exists(RaspPi);
		// 				assert.isNull(RaspPi.lastPing);
		// 			}).then(function() {
		// 				chai.request(API_ENDPOINT)
		// 				.post('/test_connection')
		// 				.send({serialNumber: defaultRaspPi1.values.serialNumber})
		// 				.end(function (err, res) {
		// 					expect(err).to.be.null;
		// 					expect(res).to.have.status(200);
		// 					assert.equal(res.body.status, "success");
		// 					utils.findRaspPiUsingSerial(defaultRaspPi1.values.serialNumber).then(function(RaspPi) {
		// 						assert.exists(RaspPi);
		// 						assert.isNotNull(RaspPi.lastPing)
		// 						assert.approximately(moment(new Date().getTime()).tz("America/Chicago").valueOf(), new Date(RaspPi.lastPing).getTime(), 2000)
		// 						clear_db().then(done());
		// 					})
		// 				})
		// 			})	
		// 		})	
		// 	});
	 //  	});

	 //  	describe('/reboot', function() {
	 //  		it('should return appropriate status if no such pi', function(done) {
	 //  			chai.request(API_ENDPOINT)
		// 		.post('/reboot')
		// 		.end(function (err, res) {
		// 			expect(err).to.be.null;
		// 			expect(res).to.have.status(200);
		// 			assert.equal(res.body.status, "No Pi");
		// 			done();
		// 		})
	 //  		})

	 //  		it('should return status and update last reboot time', function(done) {
		// 		send_add_to_db_request(defaultRaspPi1).then(function() {
		// 			utils.findRaspPiUsingSerial(defaultRaspPi1.values.serialNumber).then(function(RaspPi) {
		// 				assert.exists(RaspPi);
		// 				assert.isNull(RaspPi.lastReboot);
		// 			}).then(function() {
		// 				chai.request(API_ENDPOINT)
		// 				.post('/reboot')
		// 				.send({serialNumber: defaultRaspPi1.values.serialNumber})
		// 				.end(function (err, res) {
		// 					expect(err).to.be.null;
		// 					expect(res).to.have.status(200);
		// 					assert.equal(res.body.status, "success");
		// 					utils.findRaspPiUsingSerial(defaultRaspPi1.values.serialNumber).then(function(RaspPi) {
		// 						assert.exists(RaspPi);
		// 						assert.isNotNull(RaspPi.lastReboot)
		// 						assert.approximately(moment(new Date().getTime()).tz("America/Chicago").valueOf(), new Date(RaspPi.lastReboot).getTime(), 2000)
		// 						clear_db().then(done());
		// 					})
		// 				})
		// 			})	
		// 		})	
		// 	});
	 //  	})

		// describe('/check_active_session', function() {

		// 	it('should return true if active session exists', function(done) {
		// 		send_add_to_db_request(defaultSession1)
		// 		.then(function() {
		// 			chai.request(API_ENDPOINT)
		// 			.post('/check_active_session')
		// 			.send({userID: 1})
		// 			.end(function (err, res) {
		// 				expect(err).to.be.null;
		// 				expect(res).to.have.status(200);
		// 				assert.isTrue(res.body.active);
		// 				clear_db().then(done());
		// 			});
		// 		})	
		// 	})

		// 	it('should return false if active session doesn\'t exists', function(done) {
		// 		send_add_to_db_request(defaultSession1)
		// 		.then(function() {
		// 			utils.endSession(defaultSession1.values.machineID).then(function() {
		// 				chai.request(API_ENDPOINT)
		// 				.post('/check_active_session')
		// 				.send({userID: 1})
		// 				.end(function (err, res) {
		//  					expect(err).to.be.null;
		//      				expect(res).to.have.status(200);
		//      				assert.isFalse(res.body.active);
		//      				clear_db().then(done());
		// 				});
		// 			})
		// 		})
		// 	})
		// })

		// describe('/start_workout', function() {
		// 	it('should start workout if rasp pi exists and no current session', function(done) {
		// 		send_add_to_db_request(defaultRaspPi1).then(function() {
		// 			utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
		// 				assert.notExists(session)
		// 			}).then(function() {
		// 				chai.request(API_ENDPOINT)
		// 				.post('/start_workout')
		// 				.send({serialNumber: defaultRaspPi1.values.serialNumber})
		// 				.end(function(err, res) {
		// 					expect(err).to.be.null;
		// 	     			expect(res).to.have.status(200);
		// 	     			assert.equal(res.body.status, "Created")
		// 	     			assert.equal(res.body.message, "Session has been created.")
		// 	     			utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
		// 	     				assert.exists(session)
		// 	     				clear_db().then(done())
		// 	     			})
		// 				})
		// 			})	
		// 		})
		// 	})


		// 	it('shouldnt start workout if no rasp pi exists', function(done) {
		// 		chai.request(API_ENDPOINT)
		// 		.post('/start_workout')
		// 		.send({serialNumber: defaultRaspPi1.values.serialNumber})
		// 		.end(function(err, res) {
		// 			expect(err).to.be.null;
		// 	     	expect(res).to.have.status(200);
		// 	     	assert.equal(res.body.status, "No Pi")
		// 	     	assert.equal(res.body.message, "Could not find machine (RaspPi).")
		// 	     	utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
		// 	     		assert.notExists(session)
		// 	     		clear_db().then(done())
		// 	     	})
		// 		})
		// 	})


		// 	it('shouldnt start workout if there is already an active session', function(done) {
		// 		send_add_to_db_request(defaultRaspPi1).then(function() {
		// 			send_add_to_db_request(defaultSession2).then(function() {
		// 				chai.request(API_ENDPOINT)
		// 				.post('/start_workout')
		// 				.send({serialNumber: defaultRaspPi1.values.serialNumber})
		// 				.end(function(err, res) {
		// 					expect(err).to.be.null;
		// 		     		expect(res).to.have.status(200);
		// 		     		assert.equal(res.body.status, "Exists")
		// 		     		assert.equal(res.body.message, "Session is in progress.")
		// 		     		utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
		// 		     			assert.notEqual(session.userID, defaultSession1.values.userID)
		// 		     			clear_db().then(done())
		// 		     		})
		// 				})
		// 			})	
		// 		})
		// 	})
		// })

		// describe('/end_workout', function() {
		// 	it('should end workout if there is one active session and rasp pi exists', function(done) {
		// 		send_add_to_db_request(defaultRaspPi1).then(function() {
		// 			send_add_to_db_request(defaultSession1).then(function() {
		// 				utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
		// 					assert.exists(session)
		// 				}).then(function() {
		// 					chai.request(API_ENDPOINT)
		// 					.post('/end_workout')
		// 					.send({serialNumber: defaultRaspPi1.values.serialNumber})
		// 					.end(function(err, res) {
		// 						expect(err).to.be.null;
		// 		     			expect(res).to.have.status(200);
		// 		     			assert.equal(res.body.status, "success")
		// 		     			utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
		// 		     				assert.notExists(session)
		// 		     				clear_db().then(done())
		// 		     			})
		// 					})
		// 				})
		// 			})
		// 		})
		// 	})

		// 	it('should not end workout if no rasp pi exists', function(done) {
		// 		send_add_to_db_request(defaultSession1).then(function() {
		// 			chai.request(API_ENDPOINT)
		// 			.post('/end_workout')
		// 			.send({serialNumber: defaultRaspPi1.values.serialNumber})
		// 			.end(function(err, res) {
		// 				expect(err).to.be.null;
		//      			expect(res).to.have.status(200);
		//      			assert.equal(res.body.status, "No Pi")
		//      			assert.equal(res.body.message, "Could not find machine (RaspPi).")
		//      			utils.findCurrentSessionUsingMachineID(defaultSession1.values.machineID).then(function(session) {
		//      				assert.exists(session)
		//      				clear_db().then(done())
		//      			})
		// 			})
		// 		})
		// 	})

		// 	it('should end multiple sessions if they exists, and give appropriate status', function(done) {
		// 		send_add_to_db_request(defaultSession1).then(function() {
		// 			send_add_to_db_request(defaultSession2).then(function() {
		// 				send_add_to_db_request(defaultRaspPi1).then(function() {
		// 					chai.request(API_ENDPOINT)
		// 					.post('/end_workout')
		// 					.send({serialNumber: defaultRaspPi1.values.serialNumber})
		// 					.end(function(err, res) {
		// 						expect(err).to.be.null;
		// 		     			expect(res).to.have.status(200);
		// 		     			assert.equal(res.body.status, "More than one session ended")
		// 		     			utils.findCurrentSessionUsingMachineID(defaultSession1.values.machineID).then(function(session) {
		// 		     				assert.notExists(session)
		// 		     				clear_db().then(done())
		// 		     			})
		// 					})
		// 				})
		// 			})
		// 		})
		// 	})

		// 	it('should give the appropriate status if no sessions exist', function(done) {
		// 		send_add_to_db_request(defaultRaspPi1).then(function() {
		// 			chai.request(API_ENDPOINT)
		// 			.post('/end_workout')
		// 			.send({serialNumber: defaultRaspPi1.values.serialNumber})
		// 			.end(function(err, res) {
		// 				expect(err).to.be.null;
		//      			expect(res).to.have.status(200);
		//      			assert.equal(res.body.status, "No session ended")
		//      			clear_db().then(done())
		// 			})
		// 		})
		// 	})
		// })

		// describe('/bike', function() {
		// 	it('should return appropriate status and fail if no rasp pi', function(done) {
		// 		chai.request(API_ENDPOINT)
		// 		.post('/bike')
		// 		.send({rpm: 5, serialNumber: 1})
		// 		.end(function(err, res) {
		// 			expect(err).to.be.null;
		//      		expect(res).to.have.status(200);
		//      		assert.equal(res.body.status, "No Pi")
		//      		clear_db().then(done())
		// 		})
		// 	})

		// 	it('should return appropriate status and fail if only ended sessions', function(done) {
		// 		send_add_to_db_request(defaultRaspPi1).then(function() {
		// 			send_add_to_db_request(defaultSession1).then(function() {
		// 				utils.endSession(defaultSession1.values.machineID).then(function() {
		// 					chai.request(API_ENDPOINT)
		// 					.post('/bike')
		// 					.send({rpm: 101, serialNumber: defaultRaspPi1.values.serialNumber})
		// 					.end(function(err, res) {
		// 						expect(err).to.be.null;
		//      					expect(res).to.have.status(200);
		//      					assert.equal(res.body.status, "No Session")
		//      					utils.findEndedSessionsOnMachine(defaultSession1.values.machineID).then(function(session) {
		//      						assert.exists(session);
		//      					}).then(function() {
		//      						utils.findBikeData(1).then(function(data) {
		//      							assert.equal(data.length, 0);
		//      							clear_db().then(done())
		//      						})
		//      					})
		// 					})
		// 				})
		// 			})
		// 		})
		// 	})

		// 	it('should return appropriate status and add bike data if active session exists', function(done) {
		// 		send_add_to_db_request(defaultRaspPi1).then(function() {
		// 			send_add_to_db_request(defaultSession1).then(function() {
		// 				chai.request(API_ENDPOINT)
		// 				.post('/bike')
		// 				.send({rpm: 101, serialNumber: defaultRaspPi1.values.serialNumber})
		// 				.end(function(err, res) {
		// 					expect(err).to.be.null;
	 //     					expect(res).to.have.status(200);
	 //     					assert.equal(res.body.status, "success")
	 //     					utils.findBikeData(1).then(function(data) {
	 //     						assert.equal(data.length, 1);
	 //     						assert.equal(data[0].rpm, 101);
	 //     						assert.approximately(data[0].stamp, moment(new Date().getTime()).tz("America/Chicago").valueOf(), 2000)
	 //     						assert.equal(data[0].bikeID, defaultRaspPi1.values.machineID)
	 //     						assert.equal(data[0].sessionID, 1);
	 //     						clear_db().then(done())
	 //     					})
		// 				})
		// 			})
		// 		})
		// 	})
		// })

		// describe('/check_tag', function() {
			
		// })

		// describe('/login', function() {
		// 	it('should return a nonempty json token for a standard user login', function(done) {
		// 		send_add_to_db_request(defaultUser).then(function() {
		// 			chai.request(API_ENDPOINT)
		// 			.post('/login')
		// 			.send({email: defaultUser.values.email, password: defaultUser.values.pswd})
		// 			.end(function (err, res) {
		// 				expect(err).to.be.null;
		// 				expect(res).to.have.status(200);
		// 				assert.isNotEmpty(res.body.token);
		// 				clear_db().then(done())
		// 			})			
		// 		})				
		// 	})

		// 	it('should send 403 if there isn\'t a user', function(done) {
		// 		chai.request(API_ENDPOINT)
		// 		.post('/login')
		// 		.send({email: defaultUser.values.email, password: defaultUser.values.pswd})
		// 		.end(function (err, res) {
		// 			expect(res).to.have.status(403);
		// 			assert.notExists(res.body.token);
		// 			done();
		// 		})		
		// 	})

		// 	it('should send 401 if there is a password mismatch', function(done) {
		// 		send_add_to_db_request(defaultUser).then(function() {
		// 			chai.request(API_ENDPOINT)
		// 			.post('/login')
		// 			.send({email: defaultUser.values.email, password: 'tHiSiSdEfInItElYnOtThEpAsSwOrD'})
		// 			.end(function (err, res) {
		// 				expect(res).to.have.status(401);
		// 				assert.notExists(res.body.token);
		// 				clear_db().then(done())
		// 			})			
		// 		})	
		// 	})
		// })

		// describe('/setup_account', function() {
		// 	it('should send 409 if that user already exists', function(done) {
		// 		send_add_to_db_request(defaultUser).then(function() {
		// 			chai.request(API_ENDPOINT)
		// 			.post('/setup_account')
		// 			.send({name: defaultUser.values.name, email: defaultUser.values.email, password: defaultUser.values.pswd})
		// 			.end(function (err, res) {
		// 				expect(res).to.have.status(409);
		// 				assert.notExists(res.body.token);
		// 				clear_db().then(done())
		// 				done()
		// 			})			
		// 		})	
		// 	})

		// 	it('should properly update the test DB with a new user', function(done) {
		// 		chai.request(API_ENDPOINT)
		// 			.post('/setup_account')
		// 			.send({name: defaultUser.values.email, email: defaultUser.values.email, password: defaultUser.values.pswd})
		// 			.end(function (err, res) {
		// 				utils.findUserUsingEmail(defaultUser.values.email).then(function(user) {
		// 					assert.equal(defaultUser.values.email, user.email);
		// 					clear_db().then(done());
		// 				})
		// 			})	
		// 	})
		// })

		// describe('/logout', function() {
		// 	it('should send 200 if the user is found', function(done) {
		// 		send_add_to_db_request(defaultUser).then(function() {
		// 			chai.request(API_ENDPOINT)
		// 			.post('/logout')
		// 			.set('authorization', defaultToken)
		// 			.send({userID: defaultUser.values.id})
		// 			.end(function (err, res) {
		// 				expect(err).to.be.null;
		// 				expect(res).to.have.status(200);
		// 				clear_db().then(done())
		// 			})
		// 		})
		// 	})

		// 	it('should send 401 if the user is not found', function(done) {				
		// 		chai.request(API_ENDPOINT)
		// 		.post('/logout')
		// 		.set('authorization', defaultToken)
		// 		.send({userID: defaultUser.values.id})
		// 		.end(function (err, res) {
		// 			expect(res).to.have.status(401);
		// 			done()
		// 		})
		// 	})
		// })

		// describe('/process_tag', function(done) {
		// 	var defaultNFCRequest = {serialNumber: defaultRaspPi1.values.serialNumber, RFID: defaultTag1.values.RFID};

		// 	it('should return 401 if Pi doesn\'t exist', function(done) {				
		// 		chai.request(API_ENDPOINT)
		// 		.post('/process_tag')
		// 		.send(defaultNFCRequest)
		// 		.end(function (err, res) {
		// 			expect(res).to.have.status(401);
		// 			assert.equal(res.body.status, 'No Pi');
		// 			done();
		// 		})
		// 	})

		// 	it('should add a tag when a valid Pi exists but not tag is found', function(done) {
		// 		send_add_to_db_request(defaultRaspPi1).then(function() {
		// 			chai.request(API_ENDPOINT)
		// 			.post('/process_tag')
		// 			.send(defaultNFCRequest)
		// 			.end(function (err, res) {
		// 				expect(err).to.be.null;
		// 				expect(res).to.have.status(200);
		// 				assert.equal(res.body.status, 'Tag created');
		// 				utils.findTag(defaultNFCRequest.RFID).then(function(tag) {
		// 					assert.equal(tag.RFID, defaultNFCRequest.RFID)
		// 					assert.equal(tag.machineID, defaultRaspPi1.values.machineID)
		// 					assert.exists(tag.registered)
		// 					clear_db().then(done())
		// 				})
		// 			})
		// 		})
		// 	})

		// 	it('should add a new session if valid Pi, tag exists, and no session found', function(done) {
		// 		send_add_to_db_request(defaultRaspPi1).then(function() {
		// 			send_add_to_db_request(defaultTag1).then(function() {
		// 				chai.request(API_ENDPOINT)
		// 				.post('/process_tag')
		// 				.send(defaultNFCRequest)
		// 				.end(function (err, res) {
		// 					expect(err).to.be.null;
		// 					expect(res).to.have.status(200);
		// 					assert.equal(res.body.status, 'success');
		// 					utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
		// 						assert.equal(session.sessionID, 1)
		// 						assert.equal(session.RFID, defaultNFCRequest.RFID)
		// 						assert.equal(session.machineID, defaultRaspPi1.values.machineID)
		// 						assert.approximately(parseInt(session.stampStart), moment(new Date().getTime()).tz("America/Chicago").valueOf(), 2000)
		// 						clear_db().then(done())
		// 					})
		// 				})
		// 			})
		// 		})
		// 	})

		// 	it('should update the session if valid Pi, tag exists, and session found without tag', function(done) {
		// 		send_add_to_db_request(defaultRaspPi1).then(function() {
		// 			send_add_to_db_request(defaultTag1).then(function() {
		// 				send_add_to_db_request(defaultSession4).then(function() {
		// 					chai.request(API_ENDPOINT)
		// 					.post('/process_tag')
		// 					.send(defaultNFCRequest)
		// 					.end(function (err, res) {
		// 						expect(err).to.be.null;
		// 						expect(res).to.have.status(200);
		// 						assert.equal(res.body.status, 'updated');
		// 						utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
		// 							assert.equal(session.sessionID, 1)
		// 							assert.equal(session.RFID, defaultNFCRequest.RFID)
		// 							assert.equal(session.machineID, defaultRaspPi1.values.machineID)
		// 							assert.approximately(parseInt(session.stampStart), moment(new Date().getTime()).tz("America/Chicago").valueOf(), 2000)
		// 							clear_db().then(done())
		// 						})
		// 					})
		// 				})
		// 			})
		// 		})
		// 	})

		// 	it('should create new session if data in old session more than 15 seconds old', function(done) {
		// 		this.timeout(15000)
		// 		send_add_to_db_request(defaultRaspPi1).then(function() {
		// 			send_add_to_db_request(defaultTag1).then(function() {
		// 				send_add_to_db_request(defaultSession2).then(function() {
		// 					send_add_to_db_request(defaultRPM1).then(function() {
		// 						setTimeout(function() {
		// 							chai.request(API_ENDPOINT)
		// 							.post('/process_tag')
		// 							.send(defaultNFCRequest)
		// 							.end(function (err, res) {
		// 								expect(err).to.be.null;
		// 								expect(res).to.have.status(200);
		// 								assert.equal(res.body.status, 'success');
		// 								utils.findEndedSessionsOnMachine(defaultRaspPi1.values.machineID).then(function(sessions) {
		// 									assert.lengthOf(sessions, 1)
		// 									assert.equal(sessions[0].sessionID, 1);
		// 									assert.equal(sessions[0].RFID, defaultSession2.values.RFID);
		// 									assert.approximately(parseInt(sessions[0].stampEnd), moment(new Date().getTime()).tz("America/Chicago").valueOf(), 2000)
		// 									utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
		// 										assert.equal(session.sessionID, 2)
		// 										assert.equal(session.RFID, defaultTag1.values.RFID);
		// 										assert.equal(session.machineID, defaultRaspPi1.values.machineID)
		// 										assert.approximately(parseInt(session.stampStart), moment(new Date().getTime()).tz("America/Chicago").valueOf(), 2000)
		// 										clear_db().then(done())
		// 									})
		// 								})
		// 							})
		// 						}, 11000)
		// 					})
		// 				})
		// 			})
		// 		})
		// 	})

		// 	it('should do nothing if current session has same RFID as scanned tag', function(done) {
		// 		send_add_to_db_request(defaultRaspPi1).then(function() {
		// 			send_add_to_db_request(defaultTag1).then(function() {
		// 				send_add_to_db_request(defaultSession1).then(function() {
		// 					chai.request(API_ENDPOINT)
		// 					.post('/process_tag')
		// 					.send(defaultNFCRequest)
		// 					.end(function (err, res) {
		// 						expect(err).to.be.null;
		// 						expect(res).to.have.status(200);
		// 						assert.equal(res.body.status, 'failure');
		// 						assert.equal(res.body.message, 'Same tag has been scanned again.');
		// 						utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
		// 							assert.equal(session.sessionID, 1);
		// 							utils.findEndedSessionsOnMachine(defaultRaspPi1.values.machineID).then(function(endedSessions) {
		// 								assert.empty(endedSessions)
		// 								clear_db().then(done())
		// 							})
		// 						})
		// 					})
		// 				})
		// 			})
		// 		})
		// 	})
		// })

		describe('check_tag', function() {
			defaultTagRequest = {tagName: "Frieza's ID", userID: 1, machineID: 1}
			it('should return 403 status if called without token', function(done) {
				chai.request(API_ENDPOINT)
				.post('/check_tag')
				.send(defaultTagRequest)
				.end(function(err, res) {
					expect(err).to.not.be.null;
					expect(res).to.have.status(403);
					clear_db().then(done())
				})
			})

			it('should update tag info with valid inputs', function(done) {
				send_add_to_db_request(defaultTag1).then(function() {
					chai.request(API_ENDPOINT)
					.post('/check_tag')
					.set('authorization', defaultToken)
					.send(defaultTagRequest)
					.end(function(err, res) {
						expect(err).to.be.null;
						expect(res).to.have.status(200);
						assert.equal(res.body.status, 'success');
						utils.findTag(defaultTag1.values.RFID).then(function(tag) {
							assert.equal(tag.tagName, "Frieza's ID")
							assert.equal(tag.userID, 1)
							assert.equal(tag.machineID, 1)
							assert.isTrue(tag.registered)
							clear_db().then(done())
						})
					})
				})
			})

			it('should only update the latest tag on the same machine', function(done) {
				send_add_to_db_request(defaultTag1).then(function() {
					setTimeout(function() {
						send_add_to_db_request(defaultTag2).then(function() {
							chai.request(API_ENDPOINT)
							.post('/check_tag')
							.set('authorization', defaultToken)
							.send(defaultTagRequest)
							.end(function(err, res) {
								expect(err).to.be.null;
								expect(res).to.have.status(200);
								assert.equal(res.body.status, 'success');
								utils.findTag(defaultTag2.values.RFID).then(function(tag2) {
									assert.equal(tag2.tagName, "Frieza's ID")
									assert.equal(tag2.userID, 1)
									assert.equal(tag2.machineID, 1)
									assert.isTrue(tag2.registered)
									utils.findTag(defaultTag1.values.RFID).then(function(tag1) {
										assert.isNull(tag1.tagName)
										assert.isNull(tag1.userID)
										assert.isFalse(tag1.registered)
										assert.equal(tag1.machineID, 1)
										clear_db().then(done())
									})
								})
							})
						})
					}, 1000)	
				})
			})
		})	
	});
}
	
if (testAdmin) {
	describe('Admin Routes', function() {
		describe('/admin_data', function() {
			it('should return an empty JSON object with no data in any table', function(done) {
				chai.request(API_ENDPOINT)
					.post('/admin_data')
					.end(function(err, res) {
						expect(err).to.be.null;
		     			expect(res).to.have.status(200);
		     			assert.deepEqual(res.body, {})
		     			clear_db().then(done())
					})
			})

			it('should return empty 2D JSON object with just RaspPi tables', function(done) {
				send_add_to_db_request(defaultRaspPi1).then(function() {
					send_add_to_db_request(defaultRaspPi2).then(function() {
						chai.request(API_ENDPOINT)
						.post('/admin_data')
						.end(function(err, res) {
							expect(err).to.be.null;
		     				expect(res).to.have.status(200);
		     				assert.deepEqual(res.body, {1: [], 2: []})
		     				clear_db().then(done())
						})
					})
				})
			})

			it ('should return empty 2D JSON object with RaspPi and current sessions', function(done) {
				send_add_to_db_request(defaultRaspPi1).then(function() {
					send_add_to_db_request(defaultRaspPi2).then(function() {
						send_add_to_db_request(defaultSession1).then(function() {
							send_add_to_db_request(defaultSession2).then(function() {
								send_add_to_db_request(defaultSession3).then(function() {
									chai.request(API_ENDPOINT)
									.post('/admin_data')
									.end(function(err, res) {
										expect(err).to.be.null;
		     							expect(res).to.have.status(200);
		     							assert.deepEqual(res.body, {1: [], 2: []})
		     							clear_db().then(done())
									})
								})
							})
						})
					})
				})
			})

			it ('should return 3D JSON object with RaspPi and ended sessions', function(done) {
				send_add_to_db_request(defaultRaspPi1).then(function() {
					send_add_to_db_request(defaultRaspPi2).then(function() {
						send_add_to_db_request(defaultSession1).then(function() {
							send_add_to_db_request(defaultSession2).then(function() {
								send_add_to_db_request(defaultSession3).then(function() {
									utils.endSession(defaultSession1.values.machineID).then(function() {
										utils.endSession(defaultSession3.values.machineID).then(function() {
											chai.request(API_ENDPOINT)
											.post('/admin_data')
											.end(function(err, res) {
												expect(err).to.be.null;
		     									expect(res).to.have.status(200);
		     									assert.lengthOf(res.body[defaultRaspPi1.values.machineID], 2);
		     									assert.lengthOf(res.body[defaultRaspPi2.values.machineID], 1);
		     									assert.equal(res.body[defaultRaspPi1.values.machineID][0].avg_rpm, 0);
		     									assert.equal(res.body[defaultRaspPi1.values.machineID][1].avg_rpm, 0);
		     									assert.equal(res.body[defaultRaspPi2.values.machineID][0].avg_rpm, 0);
		     									assert.isAbove(res.body[defaultRaspPi1.values.machineID][0].duration, 0.0);
		     									assert.isBelow(res.body[defaultRaspPi1.values.machineID][0].duration, 1.0);
		     									assert.isAbove(res.body[defaultRaspPi1.values.machineID][1].duration, 0.0);
		     									assert.isBelow(res.body[defaultRaspPi1.values.machineID][1].duration, 1.0);
		     									assert.isAbove(res.body[defaultRaspPi2.values.machineID][0].duration, 0.0);
		     									assert.isBelow(res.body[defaultRaspPi2.values.machineID][0].duration, 1.0);
		     									clear_db().then(done())
											})
										})
									})
								})
							})
						})
					})
				})
			})

			it ('should return filled 3D JSON object with RaspPi, ended sessions and bike data', function(done) {
				send_add_to_db_request(defaultRaspPi1).then(function() {
					send_add_to_db_request(defaultRaspPi2).then(function() {
						send_add_to_db_request(defaultSession1).then(function() {
							send_add_to_db_request(defaultSession2).then(function() {
								send_add_to_db_request(defaultSession3).then(function() {
									send_add_to_db_request(defaultRPM1).then(function() {
										send_add_to_db_request(defaultRPM2).then(function() {
											send_add_to_db_request(defaultRPM3).then(function() {
												utils.endSession(defaultSession1.values.machineID).then(function() {
													utils.endSession(defaultSession3.values.machineID).then(function() {
														chai.request(API_ENDPOINT)
														.post('/admin_data')
														.end(function(err, res) {
															expect(err).to.be.null;
					     									expect(res).to.have.status(200);
					     									assert.lengthOf(res.body[defaultRaspPi1.values.machineID], 2);
		     												assert.lengthOf(res.body[defaultRaspPi2.values.machineID], 1);
					     									assert.equal(res.body[defaultRaspPi1.values.machineID][0].avg_rpm, 75);
					     									assert.equal(res.body[defaultRaspPi1.values.machineID][1].avg_rpm, 0);
					     									assert.equal(res.body[defaultRaspPi2.values.machineID][0].avg_rpm, 90);
					     									assert.isAbove(res.body[defaultRaspPi1.values.machineID][0].duration, 0.0);
					     									assert.isBelow(res.body[defaultRaspPi1.values.machineID][0].duration, 1.0);
					     									assert.isAbove(res.body[defaultRaspPi1.values.machineID][1].duration, 0.0);
					     									assert.isBelow(res.body[defaultRaspPi1.values.machineID][1].duration, 1.0);
					     									assert.isAbove(res.body[defaultRaspPi2.values.machineID][0].duration, 0.0);
					     									assert.isBelow(res.body[defaultRaspPi2.values.machineID][0].duration, 1.0);
					     									clear_db().then(done())
														})
													})
												})
											})
										})
									})			
								})
							})
						})
					})
				})
			})
		})
	})
}
	
