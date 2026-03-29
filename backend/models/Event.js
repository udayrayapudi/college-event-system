const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide an event title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    date: {
      type: Date,
      required: [true, "Please provide an event date"],
    },
    imageUrl: {
      type: String,
      default: "https://via.placeholder.com/400x200.png?text=Event",
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registeredStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", EventSchema);
