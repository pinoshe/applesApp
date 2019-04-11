"use strict";
const DB = require("./db");
const analistics = require("./analistics");
const { StringDecoder } = require("string_decoder");
const decoder = new StringDecoder("utf8");

analistics.lisenToData(data => {
  insertAllApples(data);
});

function insertAllApples(data) {
  const applesData = Buffer.from(data);
  let applesString = decoder.write(applesData);
  let subApplesString = applesString.substring(2, applesString.length - 2);
  let applesStringsArray = subApplesString.split("], [");
  let appleObjectsArray = applesStringsArray.map(function(appleStr) {
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
  });

  DB.connect(err => {
    console.log("mongo");
    console.log(err);
    if (err) throw err;
    const collection = DB.db("apples_db").collection("apples");
    let bulkUpdateOps = [];

    collection.deleteMany().then(function(r) {
      //console.log(r);

      appleObjectsArray.forEach(function(doc) {
        bulkUpdateOps.push({ insertOne: { document: doc } });

        if (bulkUpdateOps.length === 1000) {
          collection.bulkWrite(bulkUpdateOps).then(function(r) {
            //console.log(r);
          });
          bulkUpdateOps = [];
        }
      });
      if (bulkUpdateOps.length > 0) {
        collection.bulkWrite(bulkUpdateOps).then(function(r) {
          //console.log(r);
          // DB.close();
        });
      }
    });
  });

  function getDistance(pointA, pointB) {
    let dX = pointA.x_position - pointB.x_position,
      dY = pointA.y_position - pointB.y_position;
    return Math.hypot(dX, dY);
    // return Math.sqrt(dX * dX + dY * dY);
  }

  function getNeighbourhoodPoints(pointsArray, centerPoint, distance = 5) {
    return pointsArray.filter(function(point) {
      return getDistance(point, centerPoint) < distance;
    });
  }

  function getGaussianKernel(distance, bandwidth) {
    return (
      (1 / (bandwidth * Math.sqrt(2 * Math.pi))) *
      Math.exp(-0.5 * (distance / bandwidth) ** 2)
    );
  }

  let lookDistance = 6; //How far to look for neighbours.
  let kernelBandwidth = 4; // Kernel parameter.
  let numOfIterations = 5; // optional.

  // 1) For each datapoint x ∈ X, find the neighbouring points N(x) of x.
  // 2) For each datapoint x ∈ X, calculate the mean shift m(x).
  // 3) For each datapoint x ∈ X, update x ← m(x).
  // Repeat 1. for n_iterations or until the points are almost not moving or not moving.

  appleObjectsArray.forEach(function(apple) {
    //1) For each datapoint x ∈ X, find the neighbouring points N(x) of x.
    let neighbours = getNeighbourhoodPoints(
      appleObjectsArray,
      apple,
      lookDistance
    );

    console.log(`apple: ${apple_num} has ${neighbours.length} neighbours.`);

    // 2) For each datapoint x ∈ X, calculate the mean shift m(x).
    let totalNumerator = 0,
      totalDenominator = 0;
    for (let i of neighbours) {
      let neighbour = neighbours[i],
        distance = getDistance(neighbour, apple),
        weight = getGaussianKernel(distance, kernelBandwidth),
        numerator =
          weight * neighbour.x_position + weight * neighbour.y_position;

      totalNumerator += numerator;
      totalDenominator += weight;
    }
    let new_x = totalNumerator / totalDenominator;
  });
}

exports.list_all_apples = (req, res) => {
  DB.connect(err => {
    console.log("mongo");
    console.log(err);
    const collection = DB.db("apples_db")
      .collection("apples")
      .find({})
      .toArray(function(err, result) {
        if (err) {
          console.log("error: ", err);
          res.send(err);
        }
        res.send(result);
        // DB.close();
      });
  });
};
