"user strict";

exports.lisenToData = callBack => {
  const spawn = require("child_process").spawn;

  try {
    const pythonProcess = spawn("python", [
      "./data_analytics/AppleParser.py",
      "ExampleMap",
      "C:/projects/applesApp/data_analytics/"
    ]);

    pythonProcess.stdout.on("data", data => {
      callBack(data);
    });
  } catch (err) {
    console.log("exception: " + err);
  }
};
