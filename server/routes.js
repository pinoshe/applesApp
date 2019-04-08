"use strict";
module.exports = function(app) {
  const path = require("path"),
    controller = require("./controller");

  app.route("/apples").get(controller.list_all_apples);

  app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname + "/index.html"));
  });

  // app
  //   .route("/tasks/:taskId")
  //   .get(controller.read_a_task)
  //   .put(controller.update_a_task)
  //   .delete(controller.delete_a_task);
};
