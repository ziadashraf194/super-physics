 
 let express = require("express")
 let app = express()
 const jwt = require("jsonwebtoken");
 cors = require('cors')
 const bcrypt = require("bcrypt");
 


   let register  =   async   (req, res) => {
 

  const { name, tel,grad, password,password2 } = req.body;

  
  const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
if(!egyptianPhoneRegex.test(tel)){
  return res.status(400).json({ message: "ادخل رقم صحيح" });
}
if(password!==password2){
  return res.status(400).json({ message: "كلمة المرور غير متطابقة" });
}

let passwordHashed= await bcrypt.hash(password,10)

  // تحقق من أن البريد غير مستخدم مسبقًا
  const existingUser = await User.findOne({ tel });
  if (existingUser) {
    return res.status(400).json({ message: "رقم الهاتف مسجل بالفعل" });
  }

  // إنشاء مستخدم جديد
const newUser = await new User({name,tel,grad,password:passwordHashed}); // يُفضل تشفير كلمة المرور
  await newUser.save();

  // إنشاء JWT
  const token = jwt.sign(
    { id: newUser._id, name: newUser.name },
    "uidspisdpsdi",
    { expiresIn: "1h" }
  );
  res.status(201).json({ token })
}





module.exports= register

