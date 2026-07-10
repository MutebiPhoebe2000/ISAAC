require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../server/models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/isaac-kenya";

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: node seedAdmin.js <email> <password>");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      summitId: "ADMIN-" + Math.floor(Math.random() * 10000),
      role: "admin",
      fullName: "System Administrator",
      email: email,
      passwordHash: passwordHash,
      status: "Approved",
      notifications: [{ message: "Admin account created successfully." }]
    });

    console.log(`Admin account ${email} created successfully!`);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
