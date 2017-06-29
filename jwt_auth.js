var models = require('./models');
var jwt = require ('jsonwebtoken');
var sequelize = require('sequelize');
var User = models.User;

module.exports = function(req, res, next) {
	
	console.log("Header: " + JSON.stringify(req.headers));
	console.log("Body: " + JSON.stringify(req.body));
	console.log("Header authorization: " + req.headers['authorization']);

	if (req.method == 'OPTIONS') {
		res.status(200).end("OPTIONS REQUEST found.");
	}
	
	// allows three ways to insert token into the request
	var token = (req.body && req.body.access_token) 
	    || (req.query && req.query.access_token) 
		|| req.headers['authorization'];

	if (token) {
		try {
			console.log(1);
			// jwt.verify(token, 'ashu1234', function(err, decoded) {
			// 	if (err) {
			// 		console.log("Token could not be verified.");
			// 		res.json({status: 'success', message: "Failed to authenticate token."});
			// 	}
			// 	else {
			// 		req.decoded = decoded;
			// 		next();
			// 	}
			// });
			console.log(2);
			var decoded = jwt.decode(token);
			console.log(3);
			console.log("Decoded token: " + JSON.stringify(decoded));
			User.findOne({
				where: {
					id: decoded.userID
				}
			}).then(function(user) {
				console.log(4);
				if (user) {
					console.log(5);
					next();
					console.log(6);
				} else {
					console.log(7);
					res.status(401).end();
					console.log(8);
				}
			})
			console.log(9)
		} catch (err) {
			console.log(10);
			res.status(400).end();
			console.log(11);
		}
	} else {
		console.log(12);
		res.sendStatus(403);
		console.log(13);
	}
	
}