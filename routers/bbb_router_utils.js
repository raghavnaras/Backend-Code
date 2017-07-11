var models = require('../models');
var BikeData = models.BikeData;
var RaspberryPi = models.RaspberryPi;
var SessionData = models.SessionData;
var Tag = models.Tag;
var User = models.User;
var sequelize = require('sequelize');
var bodyParser = require('body-parser');

module.exports = {

	createSession: function(machineID, RFID, userID) {
		SessionData.create({
			RFID: RFID,
			userID: userID,
			machineID: machineID,
			stampStart: new Date().getTime()
		})
	}

}
