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
var defaultSession1 = {table: "SessionData", values: {machineID: 1, RFID: 69, userID: 1}}
var defaultSession2 = {table: "SessionData", values: {machineID: 1, RFID: 70, userID: 2}}

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
		it('should return status 200 and \"success\"', function(done) {
			chai.request(API_ENDPOINT)
			.get('/test_connection')
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				assert.equal(res.body.status, "success");
				done();
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
	})
});
	























		

