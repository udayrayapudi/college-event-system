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

// List all events - must come before /:id
router.get("/", protect, getAllEvents);

// Create event
router.post("/", protect, authorize("coordinator"), createEvent);

// Update event
router.put("/:id", protect, authorize("coordinator"), updateEvent);

// Delete event
router.delete("/:id", protect, authorize("coordinator"), deleteEvent);

// Register for event
router.post("/:id/register", protect, authorize("student"), registerForEvent);

// Get specific event by ID - must come last
router.get("/:id", protect, getEventById);

module.exports = router;
