const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth/AuthController.js");
const RefreshToken = require("../controllers/auth/RefreshToken.js");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.delete("/logout", AuthController.logout);

router.get("/token", RefreshToken.refreshToken);

module.exports = router;
