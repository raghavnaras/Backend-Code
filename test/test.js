var chai = require('chai');
var chaiHTTP = require('chai-http');
var API_ENDPOINT = "http://52.34.141.31:8000/bbb";

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
		it('should create a token correctly', function(done) {
			chai.request(API_ENDPOINT)
				.post('/login')
				.send({email: 'jmb23@rice.edu', password: 'llamasu'})
				.end(function (err, res) {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
     				assert.equal(res.body.token, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IkphY29iIEJ1cmdlciIsInVzZXJJRCI6MiwiZW1haWwiOiJqbWIyM0ByaWNlLmVkdSJ9.Ulcpu5wK6cv_FtutaCBLx4RL9ZFEBxqU2GE_jzUFGS8');
     				done();
				})
		})
	})
});

// 