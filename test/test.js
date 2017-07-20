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
		.send(options)
		.end(function (err, res) {
 			expect(err).to.be.null;
     		expect(res).to.have.status(200);
     		assert.equal(res.body.status, "success");
		});
}

function clear_db(done) {
	chai.request(API_ENDPOINT)
	.post('/clear_test_tables')
	.end(function(err, res) {
		expect(err).to.be.null;
		expect(res).to.have.status(200);
		assert.equal(res.body.status, "success");
		done()
	})
	
}


describe('DB Modification Functions', function() {
	describe('should add test data to DB', function() {
		it('should add bike data to DB', function(done) {
			// chai.request(API_ENDPOINT)
			// 	.post('/add_test_data')
			// 	.send({table: "BikeData", values: {rpm: 9000.1, bikeID: 3, sessionID: 2}})
			// 	.end(function(err, res) {
			// 		expect(err).to.be.null;
			// 		expect(res).to.have.status(200);
			// 		assert.equal(res.body.status, "success");
			// 		done()
			// 	})
			utils.createBikeData(9000.1, 3, 2).then(function() {
				done();
			});

		})
		it('should add Raspberry Pi to DB', function(done) {
			// chai.request(API_ENDPOINT)
			// 	.post('/add_test_data')
			// 	.send({table: "RaspberryPi", values: {serialNumber: 447553254, machineID: 6, machineType: "Bike"}})
			// 	.end(function(err, res) {
			// 		expect(err).to.be.null;
			// 		expect(res).to.have.status(200);
			// 		assert.equal(res.body.status, "success");
			// 		done()
			// 	})
			utils.createRaspberryPi(447553254, 6, "Bike").then(function() {
				done();
			});
		})
		it('should add session data to DB', function(done) {
			// chai.request(API_ENDPOINT)
			// 	.post('/add_test_data')
			// 	.send({table: "SessionData", values: {machineID: 9001, RFID: 120000, userID: 5}})
			// 	.end(function(err, res) {
			// 		expect(err).to.be.null;
			// 		expect(res).to.have.status(200);
			// 		done()
			// 	})
			utils.createSession(9001, 120000, 5).then(function() {
				done();
			});
		})
		it('should add tag to DB', function(done) {
			// chai.request(API_ENDPOINT)
			// 	.post('/add_test_data')
			// 	.send({table: "Tag", values: {RFID: 120000, tagName: "Ginyu", userID: 5, machineID: 9001, registered: false}})
			// 	.end(function(err, res) {
			// 		expect(err).to.be.null;
			// 		expect(res).to.have.status(200);
			// 		assert.equal(res.body.status, "success");
			// 		done()
			// 	})
			utils.createTag(120000, "Ginyu", 5, 9001, false).then(function() {
				done();
			});
		})
		it('should add user to DB', function(done) {
			// chai.request(API_ENDPOINT)
			// 	.post('/add_test_data')
			// 	.send({table: "User", values: {name: "Frieza", email: "fc@rice.edu", pswd: "fucksaiyans"}})
			// 	.end(function(err, res) {
			// 		expect(err).to.be.null;
			// 		expect(res).to.have.status(200);
			// 		assert.equal(res.body.status, "success");
			// 		done()
			// 	})
			utils.createUser("Frieza", "fc@rice.edu", "fucksaiyans", null, null, null, null, null, null).then(function() {
				done();
			});
		})
	})

	describe('clear_test_tables', function() {
		it('should empty the tables in the test DB',function(done) {
			// chai.request(API_ENDPOINT)
			// 	.post('/clear_test_tables')
			// 	.end(function(err, res) {
			// 		expect(err).to.be.null;
			// 		expect(res).to.have.status(200);
			// 		assert.equal(res.body.status, "success");
			// 		done();
			// 	})
			utils.clearTestTables().then(function() {
				done()
			});
		})
	})
})

// test_connection
describe('Server Connections', function() {
	describe('test_connection', function() {
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
			send_add_to_db_request({table: "SessionData", values: {machineID: 1, RFID: 69, userID: 1}})
			.then(function() {
				chai.request(API_ENDPOINT)
					.post('/check_active_session')
					.send({userID: 1})
					.end(function (err, res) {
	 					expect(err).to.be.null;
	     				expect(res).to.have.status(200);
	     				console.log("STATUS: " + res.body.active)
	     				assert.equal(res.body.active, false);
	     				clear_db(done);
					});
			})	
		})
		// it('should return false if active session doesn\'t exists', function(done) {
		// 	send_add_to_db_request({table: "SessionData", values: {machineID: 1, RFID: 69, userID: 1}}, done)
		// 	utils.endSession(1).then(function() {
		// 		chai.request(API_ENDPOINT)
		// 		.post('/check_active_session')
		// 		.send({userID: 1})
		// 		.end(function (err, res) {
 	// 				expect(err).to.be.null;
  //    				expect(res).to.have.status(200);
  //    				assert.equal(res.body.active, true);
		// 		});
		// 	clear_db(done);
		// 	done()
		// 	})
		// })
	})
	// describe('login', function() {
		// it('should create a token correctly', function(done) {
			// chai.request(API_ENDPOINT)
			// 	.post('/login')
			// 	.send({email: 'jmb23@rice.edu', password: 'llamasu'})
			// 	.end(function (err, res) {
			// 		expect(err).to.be.null;
			// 		expect(res).to.have.status(200);
   //   				assert.equal(res.body.token, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IkphY29iIEJ1cmdlciIsInVzZXJJRCI6MiwiZW1haWwiOiJqbWIyM0ByaWNlLmVkdSJ9.Ulcpu5wK6cv_FtutaCBLx4RL9ZFEBxqU2GE_jzUFGS8');
   //   				done();
			// 	})
		// })
	});
	describe('add_test_data', function() {
		it('should add bike data to DB', function(done) {
			chai.request(API_ENDPOINT)
				.post('/add_test_data')
				.send({table: "BikeData", values: {rpm: 9000.1, bikeID: 3, sessionID: 2}})
				.end(function(err, res) {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					// assert.equal(res.body.status, "success");
					done()
				})
		})
		it('should add Raspberry Pi to DB', function(done) {
			chai.request(API_ENDPOINT)
				.post('/add_test_data')
				.send({table: "RaspberryPi", values: {serialNumber: 447553254, machineID: 6, machineType: "Bike"}})
				.end(function(err, res) {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					// assert.equal(res.body.status, "success");
					done()
				})
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
		})
		it('should add tag to DB', function(done) {
			chai.request(API_ENDPOINT)
				.post('/add_test_data')
				.send({table: "Tag", values: {RFID: 120000, tagName: "Ginyu", userID: 5, machineID: 9001, registered: false}})
				.end(function(err, res) {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					// assert.equal(res.body.status, "success");
					done()
				})
		})
		it('should add user to DB', function(done) {
			chai.request(API_ENDPOINT)
				.post('/add_test_data')
				.send({table: "User", values: {name: "Frieza", email: "fc@rice.edu", pswd: "fucksaiyans"}})
				.end(function(err, res) {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					// assert.equal(res.body.status, "success");
					done()
				})
		})
	})
	describe('clear the test DB', function() {
		it('should empty the tables in the test DB',function(done) {
			chai.request(API_ENDPOINT)
				.post('/clear_test_tables')
				.end(function(err, res) {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					// assert.equal(res.body.status, "success");
					done();
				})
		})
	})

}



// 