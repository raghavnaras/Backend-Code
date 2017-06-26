var models = require('./models');
var User = models.User;

module.exports = function(req, res, next) {
	console.log("Entered jwt_auth.js");
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
					res.end("Not a valid user.", 401);
				}
			})
		} catch (err) {
			res.end("Couldn't parse token.", 400);
		}
	} else {
		res.end("No access token.", 403);
	}
}