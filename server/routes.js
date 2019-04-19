"use strict";
module.exports = function(app) {
  const path = require("path"),
    controller = require("./controller");

  app.route("/api/entity/:entityMame").get(controller.list_all);

  app.post("/action/recreatecollection", controller.recreateCollection);

  app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname + "/index.html"));
  });
};
