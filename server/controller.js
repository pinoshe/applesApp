"use strict";
const DB = require("./db");
const analistics = require("./analistics");
const { StringDecoder } = require("string_decoder");
const decoder = new StringDecoder("utf8");

function mapAppleStrToAppleObject(appleStr) {
  let arr = appleStr.slice(1, -1).split(",");
  let newApple = {
    apple_num: parseInt(arr[0]),
    color: arr[1],
    size: parseInt(arr[2]),
    rightfullness: parseInt(arr[3]),
    x_position: parseFloat(arr[4]),
    y_position: parseFloat(arr[5])
  };
  return newApple;
}

function parseDataToArray(bufferedData) {
  let data = Buffer.from(bufferedData);
  let dataString = decoder.write(data);
  let subDataString = dataString.substring(2, dataString.length - 2);
  let stringsArray = subDataString.split("], [");
  let ObjectsArray = stringsArray.map(function(appleStr) {
    return mapAppleStrToAppleObject(appleStr);
  });

  return ObjectsArray;
}

function insertAllApples(data, distance, kernel) {
  let ObjectsArray = parseDataToArray(data);
  //.slice(3500)
  let clusteringResults = analistics.calcMeanShiftForData(
    ObjectsArray,
    distance,
    kernel
  );

  DB.connect(err => {
    console.log("mongo DB connected");

    if (err) {
      console.log(err);
      throw err;
    }
    const collection = DB.db("apples_db").collection("apples");
    let bulkUpdateOps = [];

    collection.deleteMany().then(function(r) {
      clusteringResults.apples.forEach(function(doc) {
        bulkUpdateOps.push({ insertOne: { document: doc } });

        if (bulkUpdateOps.length === 1000) {
          collection.bulkWrite(bulkUpdateOps).then(function(r) {
            console.log(r.insertedCount + " apples inserted");
          });
          bulkUpdateOps = [];
        }
      });
      if (bulkUpdateOps.length > 0) {
        collection.bulkWrite(bulkUpdateOps).then(function(r) {
          console.log(r.insertedCount + " apples inserted");
        });
      }
    });

    const clustersCollection = DB.db("apples_db").collection("clusters");
    clustersCollection.deleteMany().then(function(r) {
      clustersCollection.insertMany(clusteringResults.clusters, function(
        err,
        res
      ) {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log(res.insertedCount + " clusters inserted");
      });
    });
  });
}

exports.list_all = (req, res) => {
  DB.connect(err => {
    console.log("mongo DB connected");
    if (err) {
      console.log(err);
      throw err;
    }
    const collection = DB.db("apples_db")
      .collection(req.params.entityMame)
      .find({})
      .toArray(function(err, result) {
        if (err) {
          console.log("error: ", err);
          res.send(err);
        }
        res.send(result);
      });
  });
};

exports.recreateCollection = (req, res) => {
  analistics.lisenToData(data => {
    insertAllApples(data, req.body.d, req.body.k);
    res.sendStatus(200);
  });
};
