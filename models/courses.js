const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  contant:[{ type: mongoose.Schema.Types.ObjectId, ref: 'contant' }]
});

const AddCourse = mongoose.model("courses", courseSchema);

module.exports = AddCourse;
