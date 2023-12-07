const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController.js");
const verifyToken = require("../middlewares/VerifyToken.js");

// First middleware
router.use(verifyToken);

// Define routes
router.get("/users", UserController.getAllUser);
router.get("/users/:id", UserController.getUserById);
router.post("/users", UserController.createUser);
router.patch("/users/update/:id", UserController.updateUser);
router.delete("/users/delete/:id", UserController.deleteUser);

module.exports = router;
