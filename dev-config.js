var config = {};

var db = {};
db.user = 'Rice.Sensor@digital-gym-sql-server.database.windows.net';
db.password = 'Ashu1234!';
db.schema ="Digital-Gym-DB";

var opts = {
    host: 'digital-gym-sql-server.database.windows.net',
    dialect: 'mssql',
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