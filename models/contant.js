const mongoose = require("mongoose");

const contantSchema = new mongoose.Schema({
  title: { type: String, required: true },         
  type: { type: String, required: true }, 
  url: { type: String, },           
  duration: { type: Number },                     
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' } ,
  exam_duration: { type: Number, required: false },  
  active:{type:Boolean, default: true},
  questions: [
    {
      title: { type: String, required: true },      
      answer_1: { type: String, required: true },   
      answer_2: { type: String, required: true },   
      answer_3: { type: String, required: true },   
      answer_4: { type: String, required: true },   
      right_answer: { type: String, required: true } ,
    }
  ]
});

const Contant = mongoose.model("contant", contantSchema);

module.exports = Contant;
