var mysql = require('mysql');
exports.dotenv = require('dotenv').config();
var config = {
  connectionLimit: 10,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  timezone: 'IST',
  multipleStatements: true,
  charset: 'UTF8_GENERAL_CI',
  port: 3306

}

// var counter = 0;


var pool = mysql.createPool(config);


// Attempt to catch disconnects 
pool.on('connection', function (connection) {
  console.log('DB Connection established');

  connection.on('error', function (error) {
    console.error(new Date(), 'MySQL error', error.code);
  });
  connection.on('close', function (error) {
    console.error(new Date(), 'MySQL close', error);
  });

});

// let getDB = () => {

//     counter +=1 ; 
//     const connection = mysql.createConnection(config);

//     connection.connect();
//     console.log("counter : "+counter );
//     return connection;
// }

// let closeDb = () =>{
// connection.
// }
module.exports = pool;