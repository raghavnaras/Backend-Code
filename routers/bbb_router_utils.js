var models = require('../models');
var BikeData = models.BikeData;
var RaspberryPi = models.RaspberryPi;
var SessionData = models.SessionData;
var Tag = models.Tag;
var User = models.User;
var sequelize = require('sequelize');
var bodyParser = require('body-parser');

module.exports = {

	// Helper functions for creating model instances

	createBikeData: function(rpm, bikeID, sessionID) {
		return BikeData.create({
			stamp: new Date().getTime(),
			rpm: rpm,
			bikeID: bikeID,
			sessionID: sessionID
		})
	},

	createSession: function(machineID, RFID, userID) {
		return SessionData.create({
			RFID: RFID,
			userID: userID,
			machineID: machineID,
			stampStart: new Date().getTime()
		})
	},

	createTag: function(RFID, tagName, userID, machineID, registered) {
		return Tag.create({
			RFID: RFID,
			tagName: tagName,
			userID: userID,
			machineID: machineID,
			registered: registered
		})
	},

	createUser: function(name, email, pswd, gender, weight, age, height, RFID, resetpasswordcode) {
		return User.create({
			name: name,
			email: email,
			pswd: pswd,
			gender: gender,
			weight: weight,
			age: age,
			height: height,
			RIFD: RFID,
			resetpasswordcode: resetpasswordcode
		})
	},

	// Helper functions for updating model instances

	registerTag: function(tagName, userID, machineID) {
		return Tag.update({
			registered: true,
			tagName: tagName,
			userID: userID
		}, {
			where: {
				machineID: machineID,
				registered: false
			}
		})
	},

	addTagToSession: function(RFID, userID, machineID) {
		return SessionData.update({
			RFID: RFID,
			userID: userID
		}, {
			where: {
				machineID: machineID,
				stampEnd: null
			}
		})
	},

	endSession: function(machineID) {
		return SessionData.update({
			stampEnd: new Date().getTime()
		}, {
			where: {
				machineID: machineID,
				stampEnd: null
			}
		})
	},

	// Helper functions for reading model instances

	findRaspPiUsingSerial: function(serialNumber) {
		return RaspberryPi.findOne({
			where: {
				serialNumber: serialNumber
			}
		})
	},

	findCurrentSessionUsingMachineID: function(machineID) {
		return SessionData.findOne({
			where: {
				machineID: machineID,
				stampEnd: null
			}
		})
	},

	findTag: function(RFID) {
		return Tag.findOne({
			where: {
				RFID: RFID
			}
		})
	},

	findUserUsingEmail: function(email) {
		return User.findOne({
			where: {
				email: email
			}
		})
	}



}