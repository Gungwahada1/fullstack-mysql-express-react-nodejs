const express = require("express");
const router = express.Router();

const AuthRoute = require("./AuthRoute.js");
const UserRoute = require("./UserRoute.js");

router.use(AuthRoute);
router.use("/api", UserRoute);

module.exports = router;
