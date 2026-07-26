const mongoose = require("mongoose");

async function connectDB() {
  // Accept both naming conventions:
  //   MONGODB_URI  — set on Render and other cloud platforms
  //   MONGO_URI    — used in local .env
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/isaac_kenya";

  if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
    console.warn(
      "Warning: neither MONGODB_URI nor MONGO_URI is set. Falling back to localhost."
    );
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000, // Fail fast if Atlas is unreachable
    socketTimeoutMS: 45000
  });

  console.log("MongoDB connected");
}

module.exports = connectDB;
