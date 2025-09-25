const express = require("express");
const { userAuth } = require("../middlewares/userAuth");
const { getRequests } = require("../controllers/user/getRequests");
const getConnections = require("../controllers/user/getConnections");
const feed = require("../controllers/user/feed");

const router = express.Router();

router.get("/requests/received", userAuth, getRequests);

router.get("/connections", userAuth, getConnections);

router.get("/feed", userAuth, feed);


module.exports = router;