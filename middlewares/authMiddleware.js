const jwt = require("jsonwebtoken");
const JWT_SECRET = "my_jwt_secret_key"; // Replace with a secure key in production
const mongoose = require("mongoose");
const User = mongoose.model("User");

// Middleware to verify JWT token and fetch full user details
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if the authorization header is provided and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token and extract the user ID from the payload
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Fetch the user details from the database
    const user = await User.findById(userId).select("-password"); // Exclude password field

    // If user is not found, return an error
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Attach the full user details to req.user
    req.user = user;
    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = authenticateToken;
