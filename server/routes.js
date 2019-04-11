"use strict";
module.exports = function(app) {
  const path = require("path"),
    controller = require("./controller");

  app.route("/*").get(controller.list_all_apples);

  app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname + "/index.html"));
  });
};
