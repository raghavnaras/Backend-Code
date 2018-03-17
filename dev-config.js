var config = {};

var db = {};


db.test = false; // testing boolean
db.user = 'digitalgym';
db.password = 'ashu1234';
db.schema = db.test ? 'DigitalGymTest' : 'digitalgym';

var opts = {
    host: 'digitalgymdb.csyvcx9rt2qc.us-west-1.rds.amazonaws.com',
    dialect: 'mysql',
    logging: true,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    dialectOptions: {
        encrypt: true
    }
};

config.db = db;
config.opts = opts;

module.exports = config;