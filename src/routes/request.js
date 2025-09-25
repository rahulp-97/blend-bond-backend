const express = require("express");
const { userAuth } = require("../middlewares/userAuth");
const { sendRequest } = require("../controllers/requests/sendRequest");
const { reviewRequest } = require("../controllers/requests/reviewRequest");

const router = express.Router();

router.post("/sendRequest/:status/:toUserId", userAuth, sendRequest);

router.post("/reviewRequest/:status/:requestId", userAuth, reviewRequest);

module.exports = router;