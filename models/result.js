const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  quizID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "contant",
    required: true,
  },
  results: [
    {
      question: { type: String, required: true },
      answers:[{ type: [String], required: true }] , // ← إضافة قائمة الإجابات
      correctAnswer: { type: String, required: true },
      userAnswer: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
  
    }
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  score: { type: Number, required: true }
});


module.exports = mongoose.model("Result", resultSchema);
