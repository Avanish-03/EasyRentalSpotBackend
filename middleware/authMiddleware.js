const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    let token = req.headers["authorization"];

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Accept "Bearer <token>" or just "<token>"
    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.slice(7).trim();
    }

    if (!token) {
      return res.status(401).json({ message: "Token missing after Bearer" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
