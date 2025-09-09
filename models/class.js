// models/lesson.js
const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  order: { type: Number, default: 1 },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "course" },
  contents: [{ type: mongoose.Schema.Types.ObjectId, ref: "contant" }]
}, { timestamps: true });

module.exports = mongoose.model("lesson", lessonSchema);
