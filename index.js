// const { Telegraf } = require("telegraf");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const User = require("./models/user_model");

// Load environment variables
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
// const BOT_TOKEN = process.env.BOT_TOKEN;
//const WEBHOOK_URL = `${process.env.WEBHOOK_URL}/bot${BOT_TOKEN}`; // Fixed URL format
// const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3300;

const app = express();

app.use(
  cors({
    origin: "https://www.thewhiteshark.io",
    // origin:"http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors()); // Handle preflight requests for all routes

// JSON middleware for Express
app.use(express.json());

// Set strictQuery to avoid warnings
mongoose.set("strictQuery", true);

// MongoDB Connection
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000, // 15 seconds
  })
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Include models and routes
require("./models/user_model");
require("./models/task_model");
app.use(require("./routes/user_route"));
app.use(require("./routes/user_related_route"));
app.use(require("./routes/task_route"));


// Basic route to check if server is running
app.get("/", (req, res) => {
  res.send("Server is working nov-16 4pm");
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
