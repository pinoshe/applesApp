"use strict";

let clusterArray = [];
let applesArray = [];

let spinnerInerval = null;
let canvas = document.getElementById("applesCanvas");
let context = canvas.getContext("2d");
let cW = context.canvas.width;
let cH = context.canvas.height;

function removeSpinner() {}
function startSpinner() {
  let start = new Date(),
    lines = 16;

  let draw = function() {
    let rotation = parseInt(((new Date() - start) / 1000) * lines) / lines;
    context.save();
    context.clearRect(0, 0, cW, cH);
    context.translate(cW / 2, cH / 2);
    context.rotate(Math.PI * 2 * rotation);
    for (let i = 0; i < lines; i++) {
      context.beginPath();
      context.rotate((Math.PI * 2) / lines);
      context.moveTo(cW / 10, 0);
      context.lineTo(cW / 4, 0);
      context.lineWidth = cW / 30;
      context.strokeStyle = "rgba(205, 0, 0," + i / lines + ")";
      context.stroke();
    }
    context.restore();
  };
  spinnerInerval = window.setInterval(draw, 1000 / 30);
}
startSpinner();

const Http = new XMLHttpRequest();
Http.open("GET", "api/entity/apples");
Http.send();
Http.onload = e => {
  applesArray = JSON.parse(Http.responseText);
  clearInterval(spinnerInerval);
  context.clearRect(0, 0, cW, cH);
  for (let i in applesArray) {
    context.beginPath();
    context.arc(
      applesArray[i].x_position + 100,
      800 - applesArray[i].y_position - 100,
      applesArray[i].size / 2,
      0,
      2 * Math.PI
    );
    context.fillStyle = applesArray[i].color;
    context.fill();
    context.stroke();
  }
};

canvas.addEventListener("click", function(event) {
  console.log(event.x, "   ", event.y);
});

const getClustersReq = new XMLHttpRequest();
getClustersReq.open("GET", "api/entity/clusters");
getClustersReq.send();
getClustersReq.onload = e => {
  clusterArray = JSON.parse(getClustersReq.responseText);
};

function recreateCollection() {
  const recreateReq = new XMLHttpRequest();
  recreateReq.open("POST", "action/recreatecollection");
  recreateReq.send();
  recreateReq.onload = e => {
    alert(e.target && e.target.statusText);
  };
}
