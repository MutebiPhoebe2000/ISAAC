const mongoose = require("mongoose");

const feeTierSchema = new mongoose.Schema(
  {
    currency: { type: String, default: "USD" },
    amount: { type: Number, required: true },
    kesEquivalent: { type: Number, default: 0 }
  },
  { _id: false }
);

const feeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "registrationFees" },
    kenya: { type: feeTierSchema, required: true },
    international: { type: feeTierSchema, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeeSettings", feeSettingsSchema);
