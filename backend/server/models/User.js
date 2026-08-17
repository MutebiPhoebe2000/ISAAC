const mongoose = require("mongoose");

const stageTwoSchema = new mongoose.Schema(
  {
    packageSelection: String,
    hotelSelection: String,
    roomPreference: String,
    nights: Number,
    checkIn: Date,
    checkOut: Date,
    airportTransfer: Boolean,
    flightNo: String,
    pickupDate: Date,
    pickupTime: String,
    paymentMethod: String,
    expectedPaymentCurrency: String,
    expectedPaymentAmount: Number,
    expectedPaymentKesEquivalent: Number,
    paymentProofName: String,
    apparelSize: String,
    language: String,
    checkedInAt: Date,
    checkedOutAt: Date,
    travelHasPassport: Boolean,
    departureAirport: String,
    arrivalDate: Date,
    departureDate: Date,
    medicalConditions: String,
    allergies: String,
    dietaryPreference: String,
    emergencyName: String,
    emergencyPhone: String,
    emergencyRelationship: String
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    summitId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["admin", "delegate"], default: "delegate" },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    phone: String,
    whatsapp: String,
    alternativeContact: String,
    address: String,
    city: String,
    country: String,
    nationality: String,
    gender: String,
    dateOfBirth: Date,
    applicantType: String,
    participantCategory: String,
    passportNumber: String,
    passportExpiry: Date,
    nationalIdNumber: String,
    language: String,
    selectedCountry: String,
    idType: { type: String, enum: ["national_id", "passport"] },
    draftData: mongoose.Schema.Types.Mixed,
    profilePhotoUrl: String,
    organization: {
      name: String,
      position: String,
      website: String,
      yearsWithYouth: Number,
      address: String
    },
    motivation: String,
    thematicInterests: [String],
    support: {
      pastConference: Boolean,
      needsInvitation: Boolean,
      needsVisa: Boolean
    },
    travel: {
      hasPassport: Boolean,
      departureAirport: String,
      arrivalDate: Date,
      departureDate: Date
    },
    medical: {
      conditions: String,
      allergies: String,
      dietaryPreference: String,
      emergencyName: String,
      emergencyPhone: String,
      emergencyRelationship: String
    },
    status: { type: String, enum: ["Pending", "Approved", "Rejected", "Blocked"], default: "Pending" },
    paymentStatus: { type: String, enum: ["Not Paid", "Paid"], default: "Not Paid" },
    /* Populated only while status === "Blocked"; blockReason/blockedAt/blockedBy
       are retained after unblocking as a historical record rather than cleared. */
    statusBeforeBlock: String,
    blockReason: String,
    blockedAt: Date,
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    unblockedAt: Date,
    unblockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    invitationLetter: {
      fileName: String,
      mimeType: String,
      data: { type: Buffer, select: false },
      uploadedAt: Date
    },
    registrationFee: {
      currency: String,
      amount: Number,
      kesEquivalent: Number
    },
    stageTwo: stageTwoSchema,
    tokenVersion: { type: Number, default: 0 },
    notifications: [
      {
        message: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
