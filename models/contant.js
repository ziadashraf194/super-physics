// models/contant.js
const mongoose = require("mongoose");

const contantSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true }, // video, quiz, pdf, ...
  url: String,
  duration: Number,
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: "lesson" },
  exam_duration: Number,
  active: { type: Boolean, default: true },
  order: { type: Number, required: true },
  showResult: {type:Boolean,default:false},
  questions: [
    {
      title: { type: String, required: true },
      answer_1: { type: String, required: true },
      answer_2: { type: String, required: true },
      answer_3: { type: String, required: true },
      answer_4: { type: String, required: true },
      right_answer: { type: String, required: true },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("contant", contantSchema);
