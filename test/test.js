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
});

// 