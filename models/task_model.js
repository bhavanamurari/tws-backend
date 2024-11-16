// models/task_model.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskName: { type: String, required: true },
  points: { type: Number, required: true },
  category: {
    type: String,
    enum: ["Available", "Advanced"], // Updated categories
    required: true,
  },
  friends: { type: Number, default: 0 }, // Number of friends referred, used only for "Friends" category
  dateCreated: { type: Date, default: Date.now },
  taskCompletion: {
    type: String,
    enum: ["start", "claim", "complete"],
    default: "start",
  },
  socialMediaPlatform: {
    type: String,
    enum: ["Instagram", "Facebook", "LinkedIn", "YouTube", "Twitter"],
    default: null, // Only relevant for Earn tasks
  },
  socialMediaLink: {
    type: String,
    default: null, // URL to the page that needs to be followed
  },
  opensCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Task", taskSchema);
