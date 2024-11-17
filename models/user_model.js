const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  // fullName: { type: String, required: false, default: null },
  // password: { type: String, required: false, default: null },
  // email: { type: String, required: false, unique: true },
  // mobileNumber: { type: String, required: false, unique: true },
  walletAmount: { type: Number, default: 0.0 },
  totalReferrals: { type: Number, default: 0 },
  referralId: { type: String, required: true },
  referredBy: { type: String, default: null },
  dateJoined: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  profilePictureUrl: { type: String, default: null },
  lastLogin: { type: Date, default: null },
  farmingStartTime: { type: Date, default: null },
  farmingDuration: { type: Number, default: 30 * 1000 },
  completedTasks: [
    {
      taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
      status: {
        type: String,
        enum: ["start", "claim", "complete"],
        default: "start",
      },
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isNewUser: { type: Boolean, default: true },
  chatId: { type: String, default: null }, // Field to store the user's chat ID
});

module.exports = mongoose.model("User", userSchema);
