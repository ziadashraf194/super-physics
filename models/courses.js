// models/course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  image: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "lesson" }]
}, { timestamps: true });

module.exports = mongoose.model("course", courseSchema);
