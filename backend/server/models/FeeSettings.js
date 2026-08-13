const mongoose = require("mongoose");

const feeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "registrationFees" },
    currency: { type: String, default: "USD" },
    amount: { type: Number, required: true, default: 20 },
    kesEquivalent: { type: Number, default: 2500 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeeSettings", feeSettingsSchema);
