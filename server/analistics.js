"user strict";

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

exports.calcMeanShiftForData = appleObjectsArray => {
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
};

exports.lisenToData = callBack => {
  const spawn = require("child_process").spawn;

  try {
    const pythonProcess = spawn("python", [
      "./AppleParser.py",
      "ExampleMap",
      "C:/projects/applesApp/"
    ]);

    pythonProcess.stdout.on("data", data => {
      callBack(data);
    });
  } catch (err) {
    console.log("exception: " + err);
  }
};
