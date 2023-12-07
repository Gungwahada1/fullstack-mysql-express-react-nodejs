const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({
      success: false,
      error: {
        code: 401,
        message: "Token null.",
      },
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: {
          code: 403,
          message: "Token tidak valid.",
        },
      });
    }
    req.username = decoded.username;
    next();
  });
};

module.exports = verifyToken;
