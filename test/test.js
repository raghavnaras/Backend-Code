var chai = require('chai');
var chaiHTTP = require('chai-http');
var API_ENDPOINT = "http://0.0.0.0:8000/bbb";

chai.use(chaiHTTP);

var assert = chai.assert;
var expect = chai.expect;


// GET REQUESTS

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
	describe('login', function() {
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
					done()
				})
		})
	})
});

// 