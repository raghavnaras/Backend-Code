var models = require('./models');
var User = models.User;

module.exports = function(req, res, next) {
	
	// DEBUGGING
	// LOGICAL ERROR: Header 'authorization' not appearing in the middleware!
	console.log("Header: " + JSON.stringify(req.headers));
	console.log("Header authorization: " + req.headers['authorization']);
	
	//allows three ways to insert token into the request
	var token = (req.body && req.body.access_token) 
	    || (req.query && req.query.access_token) 
		|| req.headers['authorization'];

	if (token) {
		try {
			var decoded = jwt.decode(token, 'ashu1234');
			User.findOne({
				where: {
					id: decoded.userID
				}
			}).then(function(user) {
				if (user) {
					next();
				} else {
					res.status(401).end();
				}
			})
		} catch (err) {
			res.status(400).end();
		}
	} else {
		res.status(403).end();
	}
}