"user strict";

const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://pinoshe:pinoshe@cluster0-3juuq.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });

module.exports = client;

// var mysql = require("mysql");

// var connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "apples_db"
// });

// connection.connect(err => {
//   if (err) throw err;
//   console.log("CONNECTION");

//   connection.query(
//     "CREATE TABLE IF NOT EXISTS APPLES (APPLENUM int(11) PRIMARY KEY NOT NULL, COLOR varchar(20) NOT NULL, SIZE int(11) NOT NULL, RIGHTFULLNESS int(11) NOT NULL, XPOSITION FLOAT NOT NULL, YPOSITION FLOAT NOT NULL);"
//   );
// });

//module.exports = connection;

// connection.end();
