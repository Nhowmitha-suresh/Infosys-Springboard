const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri);

    console.log(
      `MongoDB Atlas Connected: ${conn.connection.host}`
    );

  } catch (error) {

    console.error(
      `MongoDB Connection Error: ${error.message}`
    );

  }
};

module.exports = connectDB;