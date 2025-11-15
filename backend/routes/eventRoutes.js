const express = require("express");
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
} = require("../controllers/eventController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("coordinator"), createEvent);

router.put("/:id", protect, authorize("coordinator"), updateEvent);

router.delete("/:id", protect, authorize("coordinator"), deleteEvent);

router.post("/:id/register", protect, authorize("student"), registerForEvent);

router.get("/", protect, getAllEvents);

router.get("/:id", protect, getEventById);

module.exports = router;
