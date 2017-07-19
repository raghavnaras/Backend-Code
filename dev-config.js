var config = {};

var db = {};


db.test = false; // testing boolean
db.user = 'digitalgym';
db.password = 'ashu1234';
db.schema = db.test ? 'DigitalGymTest' : 'DigitalGym';

var opts = {
    host: 'digitalgym.cq4d8vjo7uoe.us-west-2.rds.amazonaws.com',
    dialect: 'mysql',
    // logging: false,
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