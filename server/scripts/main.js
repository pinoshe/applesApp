"use strict";

var canvas = document.getElementById("applesCanvas");
var context = canvas.getContext("2d");
var start = new Date();
var lines = 16,
  cW = context.canvas.width,
  cH = context.canvas.height;

var draw = function() {
  var rotation = parseInt(((new Date() - start) / 1000) * lines) / lines;
  context.save();
  context.clearRect(0, 0, cW, cH);
  context.translate(cW / 2, cH / 2);
  context.rotate(Math.PI * 2 * rotation);
  for (var i = 0; i < lines; i++) {
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
var spinnerInerval = window.setInterval(draw, 1000 / 30);

let applesArray = [];

const Http = new XMLHttpRequest();
Http.open("GET", "apples");
Http.send();
Http.onload = e => {
  applesArray = JSON.parse(Http.responseText);
  clearInterval(spinnerInerval);
  context.clearRect(0, 0, cW, cH);
  for (let i in applesArray) {
    var c = document.getElementById("applesCanvas");
    var ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.arc(
      applesArray[i].x_position + 100,
      800 - applesArray[i].y_position - 100,
      applesArray[i].size / 2,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = applesArray[i].color;
    ctx.fill();
    ctx.stroke();
  }
};
