var chai = require('chai');
var chaiHTTP = require('chai-http');
var utils = require('../routers/bbb_router_utils.js')
var API_ENDPOINT = "http://127.0.0.1:8000/bbb";
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

var defaultRaspPi1 = {table: "RaspberryPi", values: {serialNumber: 100, machineID: 1, machineType: "Bike"}}
var defaultRaspPi2 = {table: "RaspberryPi", values: {serialNumber: 101, machineID: 2, machineType: "Bike"}}
var defaultSession1 = {table: "SessionData", values: {machineID: 1, RFID: 69, userID: 1}}
var defaultSession2 = {table: "SessionData", values: {machineID: 1, RFID: 70, userID: 2}}
var defaultSession3 = {table: "SessionData", values: {machineID: 2, RFID: 70, userID: 2}}
var defaultRPM1 = {table: "BikeData", values: {rpm: 50, bikeID: 1, sessionID: 1}}
var defaultRPM2 = {table: "BikeData", values: {rpm: 100, bikeID: 1, sessionID: 1}}
var defaultRPM3 = {table: "BikeData", values: {rpm: 90, bikeID: 2, sessionID: 3}}

describe('DB Modification Functions', function() {
	describe('should add test data to DB', function() {
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

// test_connection
describe('Server Connections', function() {
	describe('/test_connection', function() {
		it('should return appropriate status if no rasp pi', function(done) {
			chai.request(API_ENDPOINT)
			.post('/test_connection')
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				assert.equal(res.body.status, "No Pi");
				done();
			})
		});

		it('should return status and update last ping', function(done) {
			send_add_to_db_request(defaultRaspPi1).then(function() {
				utils.findRaspPiUsingSerial(defaultRaspPi1.values.serialNumber).then(function(RaspPi) {
					assert.exists(RaspPi);
					assert.isNull(RaspPi.lastPing);
				}).then(function() {
					chai.request(API_ENDPOINT)
					.post('/test_connection')
					.send({serialNumber: defaultRaspPi1.values.serialNumber})
					.end(function (err, res) {
						expect(err).to.be.null;
						expect(res).to.have.status(200);
						assert.equal(res.body.status, "success");
						utils.findRaspPiUsingSerial(defaultRaspPi1.values.serialNumber).then(function(RaspPi) {
							assert.exists(RaspPi);
							assert.isNotNull(RaspPi.lastPing)
							clear_db().then(done());
						})
					})
				})	
			})	
		});
  	});

	describe('/check_active_session', function() {

		it('should return true if active session exists', function(done) {
			send_add_to_db_request(defaultSession1)
			.then(function() {
				chai.request(API_ENDPOINT)
				.post('/check_active_session')
				.send({userID: 1})
				.end(function (err, res) {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					assert.isTrue(res.body.active);
					clear_db().then(done());
				});
			})	
		})

		it('should return false if active session doesn\'t exists', function(done) {
			send_add_to_db_request(defaultSession1)
			.then(function() {
				utils.endSession(defaultSession1.values.machineID).then(function() {
					chai.request(API_ENDPOINT)
					.post('/check_active_session')
					.send({userID: 1})
					.end(function (err, res) {
	 					expect(err).to.be.null;
	     				expect(res).to.have.status(200);
	     				assert.isFalse(res.body.active);
	     				clear_db().then(done());
					});
				})
			})
		})

	})

	describe('/start_workout', function() {
		it('should start workout if rasp pi exists and no current session', function(done) {
			send_add_to_db_request(defaultRaspPi1).then(function() {
				utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
					assert.notExists(session)
				}).then(function() {
					chai.request(API_ENDPOINT)
					.post('/start_workout')
					.send({serialNumber: defaultRaspPi1.values.serialNumber})
					.end(function(err, res) {
						expect(err).to.be.null;
		     			expect(res).to.have.status(200);
		     			assert.equal(res.body.status, "Created")
		     			assert.equal(res.body.message, "Session has been created.")
		     			utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
		     				assert.exists(session)
		     				clear_db().then(done())
		     			})
					})
				})	
			})
		})


		it('shouldnt start workout if no rasp pi exists', function(done) {
			chai.request(API_ENDPOINT)
			.post('/start_workout')
			.send({serialNumber: defaultRaspPi1.values.serialNumber})
			.end(function(err, res) {
				expect(err).to.be.null;
		     	expect(res).to.have.status(200);
		     	assert.equal(res.body.status, "No Pi")
		     	assert.equal(res.body.message, "Could not find machine (RaspPi).")
		     	utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
		     		assert.notExists(session)
		     		clear_db().then(done())
		     	})
			})
		})


		it('shouldnt start workout if there is already an active session', function(done) {
			send_add_to_db_request(defaultRaspPi1).then(function() {
				send_add_to_db_request(defaultSession2).then(function() {
					chai.request(API_ENDPOINT)
					.post('/start_workout')
					.send({serialNumber: defaultRaspPi1.values.serialNumber})
					.end(function(err, res) {
						expect(err).to.be.null;
			     		expect(res).to.have.status(200);
			     		assert.equal(res.body.status, "Exists")
			     		assert.equal(res.body.message, "Session is in progress.")
			     		utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
			     			assert.notEqual(session.userID, defaultSession1.values.userID)
			     			clear_db().then(done())
			     		})
					})
				})	
			})
		})

	})

	describe('/end_workout', function() {
		it('should end workout if there is one active session and rasp pi exists', function(done) {
			send_add_to_db_request(defaultRaspPi1).then(function() {
				send_add_to_db_request(defaultSession1).then(function() {
					utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
						assert.exists(session)
					}).then(function() {
						chai.request(API_ENDPOINT)
						.post('/end_workout')
						.send({serialNumber: defaultRaspPi1.values.serialNumber})
						.end(function(err, res) {
							expect(err).to.be.null;
			     			expect(res).to.have.status(200);
			     			assert.equal(res.body.status, "success")
			     			utils.findCurrentSessionUsingMachineID(defaultRaspPi1.values.machineID).then(function(session) {
			     				assert.notExists(session)
			     				clear_db().then(done())
			     			})
						})
					})
				})
			})
		})

		it('should not end workout if no rasp pi exists', function(done) {
			send_add_to_db_request(defaultSession1).then(function() {
				chai.request(API_ENDPOINT)
				.post('/end_workout')
				.send({serialNumber: defaultRaspPi1.values.serialNumber})
				.end(function(err, res) {
					expect(err).to.be.null;
	     			expect(res).to.have.status(200);
	     			assert.equal(res.body.status, "No Pi")
	     			assert.equal(res.body.message, "Could not find machine (RaspPi).")
	     			utils.findCurrentSessionUsingMachineID(defaultSession1.values.machineID).then(function(session) {
	     				assert.exists(session)
	     				clear_db().then(done())
	     			})
				})
			})
		})

		it('should end multiple sessions if they exists, and give appropriate status', function(done) {
			send_add_to_db_request(defaultSession1).then(function() {
				send_add_to_db_request(defaultSession2).then(function() {
					send_add_to_db_request(defaultRaspPi1).then(function() {
						chai.request(API_ENDPOINT)
						.post('/end_workout')
						.send({serialNumber: defaultRaspPi1.values.serialNumber})
						.end(function(err, res) {
							expect(err).to.be.null;
			     			expect(res).to.have.status(200);
			     			assert.equal(res.body.status, "More than one session ended")
			     			utils.findCurrentSessionUsingMachineID(defaultSession1.values.machineID).then(function(session) {
			     				assert.notExists(session)
			     				clear_db().then(done())
			     			})
						})
					})
				})
			})
		})

		it('should give the appropriate status if no sessions exist', function(done) {
			send_add_to_db_request(defaultRaspPi1).then(function() {
				chai.request(API_ENDPOINT)
				.post('/end_workout')
				.send({serialNumber: defaultRaspPi1.values.serialNumber})
				.end(function(err, res) {
					expect(err).to.be.null;
	     			expect(res).to.have.status(200);
	     			assert.equal(res.body.status, "No session ended")
	     			clear_db().then(done())
				})
			})
		})
	})
});

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
				     									// console.log(res.body)
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
	























		

