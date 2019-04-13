"use strict";
const DB = require("./db");
//const analistics = require("./analistics");
const { StringDecoder } = require("string_decoder");
const decoder = new StringDecoder("utf8");

// analistics.lisenToData(data => {
//   insertAllApples(data);
// });

function getDistance(pointA, pointB) {
  let dX = pointA.x_position - pointB.x_position,
    dY = pointA.y_position - pointB.y_position;
  return Math.hypot(dX, dY);
}

function getNeighbourhoodPoints(pointsArray, centerPoint, distance = 5) {
  return pointsArray.filter(function(point) {
    return getDistance(point, centerPoint) < distance;
  });
}

function getGaussianKernel(distance, bandwidth) {
  return (
    (1 / (bandwidth * Math.sqrt(2 * Math.PI))) *
    Math.exp(-0.5 * (distance / bandwidth) ** 2)
  );
}

function calcShift(point, neighbours, kernelBandwidth) {
  let shiftX = 0.0,
    shiftY = 0.0,
    scaleFactor = 0.0;
  for (let neighbour of neighbours) {
    //numerator
    let dist = getDistance(point, neighbour),
      weight = getGaussianKernel(dist, kernelBandwidth);

    shiftX += neighbour.x_position * weight;
    shiftY += neighbour.y_position * weight;

    //denominator
    scaleFactor += weight;
  }

  shiftX = shiftX / scaleFactor;
  shiftY = shiftY / scaleFactor;
  return { x: shiftX, y: shiftY };
}

function calcMeanShiftForData(appleObjectsArray) {
  let lookDistance = 100; //How far to look for neighbours.
  let kernelBandwidth = 7; // Kernel parameter.
  let numOfIterations = 10; // optional.

  // 1) For each datapoint x ∈ X, find the neighbouring points N(x) of x.
  // 2) For each datapoint x ∈ X, calculate the mean shift m(x).
  // 3) For each datapoint x ∈ X, update x ← m(x).
  // Repeat 1. for n_iterations or until the points are almost not moving or not moving.

  while (numOfIterations) {
    console.log(`Iteration: ${numOfIterations}`);
    numOfIterations -= 1;
    for (let apple of appleObjectsArray) {
      let neighbours = getNeighbourhoodPoints(
        appleObjectsArray,
        apple,
        lookDistance
      );
      let newShifts = calcShift(apple, neighbours, kernelBandwidth);
      apple.x_position = Number(newShifts.x.toFixed(1));
      apple.y_position = Number(newShifts.y.toFixed(1));
    }

    //console.log(`appleObjectsArray after: ${appleObjectsArray}`);
  }
  let clustersArray = [];
  for (let apple of appleObjectsArray) {
    let clusterExists = clustersArray.find(
      o => o.x === apple.x_position && o.y === apple.y_position
    );

    if (clusterExists) {
      apple.clusterId = clusterExists.id;
    } else {
      let newCluster = {
        id: clustersArray.length + 1,
        x: apple.x_position,
        y: apple.y_position
      };
      clustersArray.push(newCluster);
      apple.clusterId = newCluster.id;
    }
  }

  console.log(clustersArray);
  return appleObjectsArray;
}

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

  // DB.connect(err => {
  //   console.log("mongo");
  //   console.log(err);
  //   if (err) throw err;
  //   const collection = DB.db("apples_db").collection("apples");
  //   let bulkUpdateOps = [];

  //   collection.deleteMany().then(function(r) {
  //     //console.log(r);

  //     appleObjectsArray.forEach(function(doc) {
  //       bulkUpdateOps.push({ insertOne: { document: doc } });

  //       if (bulkUpdateOps.length === 1000) {
  //         collection.bulkWrite(bulkUpdateOps).then(function(r) {
  //           //console.log(r);
  //         });
  //         bulkUpdateOps = [];
  //       }
  //     });
  //     if (bulkUpdateOps.length > 0) {
  //       collection.bulkWrite(bulkUpdateOps).then(function(r) {
  //         //console.log(r);
  //         // DB.close();
  //       });
  //     }
  //   });
  // });
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

        console.log("appleObjectsArrayCopy is here.");

        let appleObjectsArrayCopy = result.slice(0, 200).map(function(apple) {
          return {
            apple_num: apple.apple_num,
            x_position: apple.x_position,
            y_position: apple.y_position
          };
        });
        calcMeanShiftForData(appleObjectsArrayCopy);
        // DB.close();
      });
  });
};
