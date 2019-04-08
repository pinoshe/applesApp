"use strict";
var express = require("express"),
  app = express(),
  port = process.env.PORT || 8080,
  path = require("path"),
  bodyParser = require("body-parser");

const https = require("https");
const fs = require("fs");

const DB = require("./db");

app.use("/scripts", express.static(__dirname + "/scripts"));
app.use("/images", express.static(__dirname + "/images"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require("./routes");
routes(app);

https
  .createServer(
    {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert")
    },
    app
  )
  .listen(port, () => {
    console.log("Apples app server started on: " + port);
  });

process.on("uncaughtException", function(err) {
  console.log(err);
});
