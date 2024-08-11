const mongoose = require("mongoose");

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connect Db successfully!");
  } catch (err) {
    console.log(err.mesage);
    process.exit(1);
  }
};

module.exports = connect;
