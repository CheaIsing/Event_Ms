const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const { getEvents } = require("../controllers/event.controller");

const router = express.Router();

router.get("/", getEvents);

router.use(requireAuth);






module.exports = router;