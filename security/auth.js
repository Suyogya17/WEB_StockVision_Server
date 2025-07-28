const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).send("Access denied: No token provided");
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Standardized structure
    req.user = {
      userId: verified.id,  
      role: verified.role,
    };

    next();
  } catch (e) {
    console.error("JWT verification failed:", e.message);
    return res.status(401).send("Invalid token");
  }
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send("User not authenticated");
    }

    if (req.user.role !== role) {
      return res.status(403).send("Access Denied: Insufficient Permissions");
    }

    next();
  };
}

module.exports = { authenticateToken, authorizeRole };
