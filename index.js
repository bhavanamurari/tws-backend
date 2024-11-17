const { Telegraf } = require("telegraf");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const User = require("./models/user_model");

// Load environment variables
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = `https://tws-backend.vercel.app/bot${BOT_TOKEN}`; // Fixed URL format
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3300;

// MONGO_URI = "mongodb+srv://orcadehub2:orcadehub2@orcadehub.twfptkz.mongodb.net/thewhiteshark?retryWrites=true&w=majority&appName=OrcadeHub";
// BOT_TOKEN = "7636130435:AAGO6lV_ptqI8z4ZMK3dkNc-arDnax5xvyI";
// const WEBHOOK_URL = `https://tws-backend.vercel.app/bot${BOT_TOKEN}`;
// NODE_ENV = "development"
// PORT=3300

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
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

// Create Telegraf bot instance
const bot = new Telegraf(BOT_TOKEN);

// Webhook handler for Telegram updates
app.post("/webhook", async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send("Webhook processed");
  } catch (error) {
    console.error("Error in webhook:", error);
    res.status(500).send("Server Error");
  }
});

// Command /start logic to check user and register if necessary
bot.start(async (ctx) => {
  const chatId = ctx.chat.id.toString();

  try {
    const user = await User.findOne({ chatId });

    if (user) {
      const fullname = user.fullName || "User";
      await ctx.reply(
        ` Welcome back ${fullname}! Open the web app and log in:`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Login",
                  web_app: { url: "https://thewhiteshark.io/" },
                },
              ],
            ],
          },
        }
      );
    } else {
      await ctx.reply("Welcome! Please sign up using our web app:", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "SignUp",
                web_app: { url: "https://thewhiteshark.io/authenticate" },
              },
            ],
          ],
        },
      });
    }
  } catch (error) {
    console.error("Error occurred in /start command:", error);
    ctx.reply("An error occurred. Please try again later.");
  }
});

// Function to set the webhook in production mode
const setWebhook = async () => {
  try {
    await bot.telegram.setWebhook(WEBHOOK_URL); // Set the correct URL here
    console.log(`Webhook set to ${WEBHOOK_URL}`);
  } catch (error) {
    console.error("Error setting webhook:", error);
  }
};

// Function to initialize the bot
const startBot = async () => {
  if (NODE_ENV === "production") {
    try {
      await setWebhook();
    } catch (error) {
      console.log("Error setting webhook. Falling back to polling mode...");
      bot.launch(); // Fallback to polling in case the webhook fails
    }
  } else {
    bot.launch();
    console.log("Bot is running in development mode using polling...");
  }
};

// Start the bot
startBot();


// Basic route to check if server is running
app.get("/", (req, res) => {
  res.send("Server is working nov-16 4pm");
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
