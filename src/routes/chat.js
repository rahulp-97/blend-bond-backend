const express = require("express");
const { userAuth } = require("../middlewares/userAuth");
const getMessages = require("../controllers/chat/getMessages");
const router = express.Router();

router.get("/:targetUserId", userAuth, getMessages);

module.exports = router;