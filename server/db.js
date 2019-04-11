"user strict";

const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://pinoshe:pinoshe@cluster0-3juuq.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });

module.exports = client;
