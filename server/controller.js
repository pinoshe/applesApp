"use strict";
const DB = require("./db");
const analistics = require("./analistics");
const { StringDecoder } = require("string_decoder");
const decoder = new StringDecoder("utf8");

analistics.lisenToData(data => {
  insertAllApples(data);
});

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

  DB.connect(err => {
    console.log("mongo");
    console.log(err);
    if (err) throw err;
    const collection = DB.db("apples_db").collection("apples");
    let bulkUpdateOps = [];

    collection.deleteMany().then(function(r) {
      //console.log(r);

      appleObjectsArray.forEach(function(doc) {
        bulkUpdateOps.push({ insertOne: { document: doc } });

        if (bulkUpdateOps.length === 1000) {
          collection.bulkWrite(bulkUpdateOps).then(function(r) {
            //console.log(r);
          });
          bulkUpdateOps = [];
        }
      });
      if (bulkUpdateOps.length > 0) {
        collection.bulkWrite(bulkUpdateOps).then(function(r) {
          //console.log(r);
          // DB.close();
        });
      }
    });
  });
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
        // DB.close();
      });
  });
};

exports.read_a_task = (req, res) => {
  DB.query("Select * from tasks where id = ? ", req.params.taskId, function(
    err,
    resp
  ) {
    if (err) {
      console.log("error: ", err);
      res.send(err);
    } else {
      res.json(resp);
    }
  });
};

exports.update_a_task = (req, res) => {
  var task = req.body;
  var assignment_list = Object.keys(task).join(" =  ? ,") + " = ? ";
  task.due_date = task.due_date ? new Date(task.due_date) : void 0;
  DB.query(
    "UPDATE tasks SET " + assignment_list + " WHERE id = ?",
    Object.values(task).concat([req.params.taskId]),
    function(err, resp) {
      if (err) {
        console.log("error: ", err);
        res.send(err);
      } else {
        res.json(resp);
      }
    }
  );
};

exports.delete_a_task = (req, res) => {
  DB.query("DELETE FROM tasks WHERE id = ?", [req.params.taskId], function(
    err,
    resp
  ) {
    if (err) {
      console.log("error: ", err);
      res.send(err);
    } else {
      res.json({ message: "Task successfully deleted" });
    }
  });
};

// DB.query("INSERT INTO APPLES SET v?", newApple, function(err, resp) {
//   if (err) {
//     console.log("error: ", err);
//   } else {
//     console.log(
//       "message: Apple successfully created, id: " + resp.insertId
//     );
//   }
// });

// DB.connect(err => {
//   console.log("mongo");
//   console.log(err);
//   const collection = DB.db("apples_db")
//     .collection("apples")
//     .find({})
//     .toArray(function(err, result) {
//       if (err) throw err;
//       console.log(result);
//       DB.close();
//     });
// });
