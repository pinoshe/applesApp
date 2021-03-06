"use strict";

let clusterArray = [];
let applesArray = [];

let canvasWidth = 800;
let canvasHeight = 800;

let stage = new Konva.Stage({
  container: "canvas-container",
  width: canvasWidth,
  height: canvasHeight
});

let layer = new Konva.Layer();
stage.add(layer);

let path = new Konva.Path({
  x: canvasWidth / 2,
  y: canvasHeight / 2,
  data:
    "M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z",
  fill: "green",
  scale: {
    x: 2,
    y: 2
  },
  offset: {
    x: 25,
    y: 25
  }
});

layer.add(path);
var anim = new Konva.Animation(function(frame) {
  var angleDiff = -(frame.timeDiff * 90) / 1000;
  path.rotate(angleDiff);
}, layer);

stage.on("click tap", function(e) {
  const clusterId = e.target.attrs && e.target.attrs.clusterId;
  if (clusterId) {
    const cluster = clusterArray.find(cluster => cluster.id === clusterId);
    if (cluster) {
      console.log(cluster);
      let rect = new Konva.Rect({
        x: cluster.min_x + 100,
        y: canvasWidth - cluster.max_y - 100,
        width: Math.abs(cluster.max_x - cluster.min_x),
        height: Math.abs(cluster.max_x - cluster.min_x),
        stroke: "black",
        strokeWidth: 4
      });

      var rects = stage.find("Rect");
      rects.each(function(rect) {
        rect.destroy();
      });
      layer.draw();
      layer.add(rect);
      layer.draw();

      const thisClusterApples = applesArray.filter(
        apple => apple.clusterId === clusterId
      );

      let titleSpan = document.getElementById("cluster-title");
      titleSpan.innerHTML = `Cluster #${clusterId} with ${
        thisClusterApples.length
      } apples`;

      const applesSizes = thisClusterApples.map(apple => apple.size);
      const sizeBarsMap = modes(applesSizes);

      buildChart("size-statistics", sizeBarsMap, "sum of apples per size");

      const applesRightfullness = thisClusterApples.map(
        apple => apple.rightfullness
      );
      const rightfullnessBarsMap = modes(applesRightfullness);
      buildChart(
        "rightfullness-statistics",
        rightfullnessBarsMap,
        "sum of apples per rightfullness %"
      );

      const applesColors = thisClusterApples.map(
        apple => Math.round(parseInt(apple.color.slice(1, 3), 16) / 50) * 50
      );
      const colorsBarsMap = modes(applesColors);
      const colorsForBars = Object.keys(colorsBarsMap).map(
        color => `rgba(${color}, 0, 0, 1)`
      );
      buildChart(
        "colors-statistics",
        colorsBarsMap,
        "sum of apples per red tint",
        { colorsForBarsArray: colorsForBars }
      );
    }
  }
});

function showSpinner() {
  anim.start();
  path.show();
  layer.draw();
}
function hideSpinner() {
  path.hide();
  layer.draw();
}

function getApples(callback) {
  const Http = new XMLHttpRequest();
  Http.open("GET", "api/entity/apples");
  Http.send();
  Http.onload = e => {
    callback(Http.responseText);
  };
}
function drawApples(data) {
  var circles = stage.find("Circle");
  circles.each(function(circle) {
    circle.destroy();
  });

  applesArray = JSON.parse(data);

  const allX = applesArray.map(apple => apple.x_position);
  const allY = applesArray.map(apple => apple.y_position);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  canvasWidth = Math.round(maxX + Math.abs(minX) + 100);
  canvasHeight = Math.round(maxY + Math.abs(minY) + 100);

  stage.setWidth(canvasWidth);
  stage.setHeight(canvasHeight);

  for (let i in applesArray) {
    var circle = new Konva.Circle({
      x: applesArray[i].x_position + 100,
      y: canvasWidth - applesArray[i].y_position - 100,
      radius: applesArray[i].size / 2,
      fill: applesArray[i].color,
      clusterId: applesArray[i].clusterId
    });

    layer.add(circle);
  }
  layer.draw();
  hideSpinner();
}
function getClusters(callback) {
  const getClustersReq = new XMLHttpRequest();
  getClustersReq.open("GET", "api/entity/clusters");
  getClustersReq.send();
  getClustersReq.onload = e => {
    callback(getClustersReq.responseText);
  };
}

function initClusters(data) {
  clusterArray = JSON.parse(data);
}

function recreateCollection() {
  showSpinner();
  const d = document.getElementById("dist").value;
  const k = document.getElementById("kernel").value;
  const i = document.getElementById("iter").value;

  const recreateReq = new XMLHttpRequest();
  recreateReq.open("POST", "action/recreatecollection");
  recreateReq.setRequestHeader("Content-Type", "application/json");
  recreateReq.send(JSON.stringify({ d: d, k: k, i: i }));
  recreateReq.onload = e => {
    //alert(e.target && e.target.statusText);

    setTimeout(() => {
      getApples(drawApples);
      getClusters(initClusters);
    }, 3000);
  };
}
showSpinner();
getApples(drawApples);
getClusters(initClusters);

function buildChart(chartId, data, title, options = {}) {
  const xValues = Object.keys(data),
    yValues = Object.values(data),
    minVal = 0,
    maxVal = Math.max(...yValues),
    stepSize = Math.ceil(maxVal / 6);
  var ctx = document.getElementById(chartId);
  var myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [
        {
          label: title,
          data: yValues,
          backgroundColor:
            options.colorsForBarsArray || "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              max: maxVal,
              min: minVal,
              stepSize: stepSize
            }
          }
        ]
      }
    }
  });
}

function modes(array) {
  if (!array.length) return [];
  var modeMap = {},
    maxCount = 0,
    modes = [];

  array.forEach(function(val) {
    if (!modeMap[val]) modeMap[val] = 1;
    else modeMap[val]++;

    if (modeMap[val] > maxCount) {
      modes = [val];
      maxCount = modeMap[val];
    } else if (modeMap[val] === maxCount) {
      modes.push(val);
      maxCount = modeMap[val];
    }
  });
  return modeMap;
}
