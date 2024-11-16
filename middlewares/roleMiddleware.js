// roleMiddleware.js
const checkAdminRole = (req, res, next) => {
  // Ensure the user has been authenticated and the role exists
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied: Admins only" });
  }
  next(); // Allow the request to proceed if the user is an admin
};

module.exports = checkAdminRole;
