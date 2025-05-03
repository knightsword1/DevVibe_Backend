const mongoose = require("mongoose");

/* mongoose.connect(
  "mongodb+srv://starconstella:nhipuumrYdXeEhDF@learnmongodb.byzjqfc.mongodb.net/"
); */ //* This returns a Promise

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://starconstella:nhipuumrYdXeEhDF@learnmongodb.byzjqfc.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
