const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipientType: { type: String, enum: ["all", "country", "new", "selected"], required: true },
    country: String,
    /* Only populated when recipientType is "selected" — the specific
       delegates an admin targeted individually, kept for history. */
    recipientIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    attemptedCount: { type: Number, default: 0 },
    recipientCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
