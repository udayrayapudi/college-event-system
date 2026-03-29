const Event = require("../models/Event");
const User = require("../models/User");
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, imageUrl } = req.body;

    const event = new Event({
      title,
      description,
      date,
      imageUrl,
      coordinator: req.user._id,
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    console.error("ERROR CREATING EVENT:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate(
      "coordinator",
      "username email"
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("coordinator", "username email")
      .populate("registeredStudents", "username email");

    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const event = await Event.findById(req.params.id);

    if (event) {
      if (event.coordinator.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "User not authorized" });
      }

      event.title = title || event.title;
      event.description = description || event.description;
      event.date = date || event.date;

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      if (event.coordinator.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "User not authorized" });
      }

      await event.deleteOne();
      res.json({ message: "Event removed" });
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const isAlreadyRegistered = event.registeredStudents.find(
      (studentId) => studentId.toString() === req.user._id.toString()
    );

    if (isAlreadyRegistered) {
      return res
        .status(400)
        .json({ message: "Already registered for this event" });
    }

    event.registeredStudents.push(req.user._id);
    await event.save();

    res.status(201).json({ message: "Registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
