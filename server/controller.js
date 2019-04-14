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

function insertAllApples(data) {
  let ObjectsArray = parseDataToArray(data);

  DB.connect(err => {
    console.log("mongo DB connected");

    if (err) {
      console.log(err);
      throw err;
    }
    const collection = DB.db("apples_db").collection("apples");
    let bulkUpdateOps = [];

    collection.deleteMany().then(function(r) {
      ObjectsArray.forEach(function(doc) {
        bulkUpdateOps.push({ insertOne: { document: doc } });

        if (bulkUpdateOps.length === 1000) {
          collection.bulkWrite(bulkUpdateOps).then(function(r) {});
          bulkUpdateOps = [];
        }
      });
      if (bulkUpdateOps.length > 0) {
        collection.bulkWrite(bulkUpdateOps).then(function(r) {});
      }
    });
  });
}

exports.list_all_apples = (req, res) => {
  DB.connect(err => {
    console.log("mongo DB connected");
    if (err) {
      console.log(err);
      throw err;
    }
    const collection = DB.db("apples_db")
      .collection("apples")
      .find({})
      .toArray(function(err, result) {
        if (err) {
          console.log("error: ", err);
          res.send(err);
        }
        res.send(result);

        // let appleObjectsArrayCopy = result.slice(0, 200).map(function(apple) {
        //   return {
        //     apple_num: apple.apple_num,
        //     x_position: apple.x_position,
        //     y_position: apple.y_position
        //   };
        // });
        //analistics.calcMeanShiftForData(appleObjectsArrayCopy);
      });
  });
};

exports.recreateCollection = (req, res) => {
  analistics.lisenToData(data => {
    insertAllApples(data);
    res.send(200);
  });
};
