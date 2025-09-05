let express = require("express")
let app = express()
const jwt = require("jsonwebtoken");
cors = require('cors')
let mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const SECRET = "uidspisdpsdi"
const path = require('path');
app.use(express.static(path.join(__dirname, 'views')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/imge", express.static(path.join(__dirname, "imge")));
// mongoose.connect('mongodb+srv://c2a200cb7d:kgNj6g3k2ZNaZuVG@cluster0.h4edn7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
// .then(()=>{
//   console.log("mongo connected")
// }).catch((err) => {
//   console.error('Error:', err);
// })   

mongoose.connect('mongodb+srv://ziad1942007:ziad1942007@cluster0.ibid538.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(()=>{
  console.log("mongo connected")
}).catch((err) => {
  console.error('Error:', err);
})   
app.use(express.json())


Course= require("./models/courses")
User= require("./models/test")
Contant =require("./models/contant")
Coupon = require("./models/Coupon")
Counter = require("./models/Counter")
quiz = require("./models/quiz")
const result = require("./models/result")


app.use(cors())


const multer = require('multer');
const { findById } = require("./models/courses");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); 
  }
});

const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));


app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "لم يتم رفع أي صورة" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});


app.post("/api/register", async (req, res) => {
  const { name, tel, grad, password, password2,center } = req.body;

 
  const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
  if (!egyptianPhoneRegex.test(tel)) {
    return res.status(400).json({ message: "ادخل رقم هاتف مصري صحيح" });
  }

  if (password !== password2) {
    return res.status(400).json({ message: "كلمة المرور غير متطابقة" });
  }

 
  const existingUser = await User.findOne({ tel });
  if (existingUser) {
    return res.status(400).json({ message: "رقم الهاتف مسجل بالفعل" });
  }

 
  const passwordHashed = await bcrypt.hash(password, 10);
  async function getNextSequence(name) {
    const counter = await Counter.findOneAndUpdate(
      { name },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    return counter.value;
  }
  
  const centerId = await getNextSequence('user');

  const newUser = new User({
    name,
    tel,
    grad,
    password: passwordHashed,
    centerId,
    center
  });
  
  await newUser.save();
  

  const token = jwt.sign(
    { id: newUser._id, name: newUser.name  },
    SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({ token });
});
app.post("/api/login", async (req, res) => {
  try {
    const { tel, password } = req.body;

    const user = await User.findOne({ tel });
    if (!user) {
      return res.status(400).json({ message: "هذا الرقم غير موجود" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "كلمة المرور أو الرقم غير صحيح" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, role:user.role},
      SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
  }
});

app.post("/api/verify", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "لا يوجد توكن" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ valid: true, user: decoded });
   
  } catch (err) {
    res.status(401).json({ message: "توكن غير صالح أو منتهي" });
  }
});
app.post("/api/verify/admin/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ isAdmin: false }); // المستخدم غير موجود => false
    }

    if (user.role === "admin") {
      res.json({ isAdmin: true }); // المستخدم أدمن
    } else {
      res.json({ isAdmin: false }); // ليس أدمن
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ isAdmin: false, error: err.message }); // أي خطأ => false
  }
});
                                    //==================COURSES====================\\
app.get('/api/courses', async (req,res)=>{
allCourses = await Course.find().select('-users -updatedAt -__v')
res.json(allCourses)
})
app.get('/courses/:id', async (req,res)=>{
  let id = req.params.id
  oneCourses = await Course.findById(id).select('-users -updatedAt -__v')
  if(!oneCourses){
    res.status(404).json({msg:"الكورس غير موجود"})
  }
  res.json(oneCourses)
  })
  app.post('/courses', upload.single('image'), async (req, res) => {
    try {
      const { title, description, price } = req.body;
      const imagePath = req.file ? req.file.path : null;
  
      const newCourse = new Course({
        title,
        description,
        price,
        image: imagePath 
      });
  
      await newCourse.save();
      res.json({ msg: "Course saved", course: newCourse });
    } catch (error) {
      res.status(500).json(error);
    }
  });
app.put('/courses/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const oneCourse = await Course.findById(id);

    if (!oneCourse) {
      return res.status(404).json({ msg: "الكورس غير موجود" });
    }

  
    if (req.body.title !== undefined) {
      oneCourse.title = req.body.title;
    }

    if (req.body.describtion !== undefined) {
      oneCourse.description = req.body.describtion;
    }

    if (req.body.price !== undefined) {
      oneCourse.price = req.body.price;
    }

    await oneCourse.save();

    res.json(oneCourse);
  } catch (err) {
    console.error("❌ Error updating course:", err.message);
    res.status(500).json({ msg: "حدث خطأ أثناء التعديل" });
  }
});
  app.delete('/courses/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      const deletedCourse = await Course.findByIdAndDelete(id);
  
      if (!deletedCourse) {
        return res.status(404).json({ msg: "الكورس غير موجود" });
      }
  
      res.json({ msg: " تم حذف الكورس بنجاح", deletedCourse });
    } catch (err) {
      console.error(" Error deleting course:", err.message);
      res.status(500).json({ msg: "حدث خطأ أثناء الحذف" });
    }
  });
                                    //==================subscribe====================\\
   
   
  app.post("/subscribe/:courseId/:couponCode", async (req, res) => {
 // const userId = req.body._id;
  const courseId = req.params.courseId;
  const couponCode = req.params.couponCode;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).sendFile(path.join(__dirname,  '404.html'));
  }

  const token = authHeader.split(" ")[1];
  let decoded;

  // console.log(token)
  // console.log(decoded.id)




  try {
    decoded = jwt.verify(token, SECRET);
  } catch (err) {
    return res.status(401).json({ msg: "توكن غير صالح أو منتهي" });
  }
  const userId = decoded.id;
  if (0==0) {
  await Course.findByIdAndUpdate(courseId, {
      $addToSet: { users: userId }
    });
  return res.status(200).json({ message: "User subscribed successfully using coupon" });

} 


  try {
    // التحقق من الكوبون
    const coupon = await Coupon.findOne({
      code: couponCode,
      courseId: courseId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }
    
    // تحقق من عدد الاستخدامات يدويًا
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }
    

    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { users: userId }
    });

    // تحديث عدد الاستخدامات
    coupon.usedCount += 1;
    if (coupon.usedCount >= coupon.usageLimit) {
      coupon.isActive = false;
    }
    await coupon.save();

    res.status(200).json({ message: "User subscribed successfully using coupon" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
  app.get("/subscribe/:courseID/:userId", async (req, res) => {
    const userId = req.params.userId;
    const courseID = req.params.courseID;
  
    try {
      const course = await Course.findById(courseID);
  
      if (!course) {
        return res.status(404).json({ message: "الكورس غير موجود" });
      }
  
  
      const isSubscribed = course.users.includes(userId);
  
      if (!isSubscribed) {
        return res.status(403).json({ message: false });
      }
      
      
      res.json({ msg: true });
    } catch (error) {
      res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
  });
  app.get("/subscribe/:courseId", async (req, res) => {
    const courseId = req.params.courseId;
    const userId = req.body._id;
    try{
     const getCourse = await Course.findById(courseId).select('-users -updatedAt -__v')
     res.json(getCourse)
    }catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
    

  });
  app.delete("/subscribe/:courseId", async (req, res) => {
    const userId = req.body._id;
    const courseId = req.params.courseId;
    try {
      await Course.findByIdAndUpdate(courseId, {
        $pull: { users: userId } 
      });
  
      res.status(200).json({ message: "User unsubscribed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });
                                    //==================contant====================\\
app.post("/:courseID/contant",async (req,res)=>{
 let courseID =  req.params.courseID
 let courseID2 =  req.query.courseID
 try {
  let newContant = new Contant(req.body)
  await newContant.save()
  await Course.findByIdAndUpdate(courseID|| courseID2, {
    $addToSet: { contant: newContant._id }}) 
  res.status(201).json({msg:"تم الحفظ بنجاح"})
 } catch (error) {
  res.status(500).json({msg:"  حدث خطا"})
 }
})
app.get("/:courseID/contant", async (req, res) => {
  const courseID = req.params.courseID;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "سجل الدخول لرؤية المحتوى" });
  }

  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, SECRET);
  } catch (err) {
    return res.status(401).json({ msg: "توكن غير صالح أو منتهي" });
  }

  if (!mongoose.Types.ObjectId.isValid(courseID)) {
    return res.status(400).json({ msg: "معرّف الكورس غير صالح" });
  }

  try {
    // نتأكد أن المستخدم مشترك في الكورس
    const isSubscribed = await Course.findOne({ _id: courseID, users: decoded._id || decoded.id });

    // لو مشترك -> يرجع الكونتنت كامل مع الروابط
    // لو مش مشترك -> يرجع الكونتنت بدون روابط
    const course = isSubscribed
      ? await Course.findById(courseID).populate("contant")
      : await Course.findById(courseID).populate({
          path: "contant",
          select: "-url" // يخفي الرابط
        });

    if (!course) {
      return res.status(404).json({ msg: "الكورس غير موجود" });
    }
if (decoded.role=="admin") {
   res.status(200).json({
  contant: course.contant
});
  
} else {
  res.status(200).json({
  contant: course.contant.filter(item => item.active === true)
}); 

} 


  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "حدث خطأ أثناء جلب البيانات", error: error.message });
  }
});
app.get("/:courseID/:contantID", async (req, res) => {
  const { courseID, contantID } = req.params;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).sendFile(path.join(__dirname,  '404.html'));
  }

  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, SECRET);
  } catch (err) {
    return res.status(401).json({ msg: "توكن غير صالح أو منتهي" });
  }

  if (!mongoose.Types.ObjectId.isValid(courseID) || !mongoose.Types.ObjectId.isValid(contantID)) {
    return res.status(400).json({ msg: "معرّف غير صالح" });
  }

  try {
    // تحقق من الاشتراك
    const isSubscribed = await Course.findOne({
      _id: courseID,
      users: decoded._id || decoded.id
    });

    if (!isSubscribed) {
      return res.status(401).json({ msg: "غير مشترك" });
    }

    // هات الكورس مع المحتوى
    const course = await Course.findById(courseID).populate("contant");

    if (!course) {
      return res.status(404).json({ msg: "الكورس غير موجود" });
    }

    // دور على الـ contant المطلوب
    const contant = course.contant.find(c => c._id.toString() === contantID);

    if (!contant) {
      return res.status(404).json({ msg: "المحتوى غير موجود" });
    }

    res.status(200).json({ contant });

  } catch (error) {
    res.status(500).json({ msg: "حدث خطأ أثناء جلب البيانات", error: error.message });
  }
});
app.post("/:courseID/quiz", upload.array("images"), async (req, res) => {
  const courseID = req.params.courseID;

  try {
    let questions = [];
    if (req.body.questions) {
      questions = JSON.parse(req.body.questions);
    }

    if (req.files && req.files.length > 0) {
      questions = questions.map((q, index) => ({
        ...q,
        image: req.files[index] ? "/uploads/" + req.files[index].filename : ""
      }));
    }

    const newContant = new Contant({
      title: req.body.title,
      type: req.body.type,
      exam_duration: req.body.exam_duration,
      course: courseID,
      questions,
    });

    await newContant.save();

    await Course.findByIdAndUpdate(courseID, {
      $addToSet: { contant: newContant._id },
    });

    res.status(201).json({ msg: "✅ تم الحفظ بنجاح", contant: newContant });

  } catch (error) {
    console.error("❌ خطأ أثناء الإضافة:", error);
    res.status(500).json({ msg: "حدث خطأ أثناء الإضافة", error: error.message });
  }
});

app.get("/quizzes", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).sendFile(path.join(__dirname, '404.html'));
  }

  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, SECRET);
  } catch (err) {
    return res.status(401).json({ msg: "توكن غير صالح أو منتهي" });
  }

  try {
    const quizzes = await Contant.find({ type: "quiz" });

    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ msg: "لا يوجد اختبارات" });
    }

    const isAdmin = decoded.role === "admin"; // استخدم بيانات التوكن لتحديد الدور

    const result = quizzes.map(q => ({
      ...q.toObject(),
      questions: q.questions.map(ques => {
        if (!isAdmin) {
          const { right_answer, ...rest } = ques;
          return rest;
        }
        return ques;
      })
    }));

    res.status(200).json({ quizzes: result });

  } catch (error) {
    res.status(500).json({ msg: "حدث خطأ أثناء جلب البيانات", error: error.message });
  }
});
app.get("/quiz/:quizId", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).sendFile(path.join(__dirname, '404.html'));
  }

  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, SECRET);
  } catch (err) {
    return res.status(401).json({ msg: "توكن غير صالح أو منتهي" });
  }

  const quizId = req.query.id; 

  try {
    const quiz = await Contant.findById(quizId).lean();

    if (!quiz) {
      return res.status(404).json({ msg: "لا يوجد اختبار بهذا المعرف" });
    }

    const isAdmin = decoded.role === "admin";

    const questionsWithAnswers = quiz.questions.map(q => {
      if (!isAdmin) {
        const { right_answer, ...rest } = q;
        return rest;
      }
      return q;
    });

    res.status(200).json({ quizzes: { ...quiz, questions: questionsWithAnswers } });

  } catch (error) {
    res.status(500).json({ msg: "حدث خطأ أثناء جلب البيانات", error: error.message });
  }
});
app.put("/courses/:courseID/contants/:contantID", async (req, res) => {
  try {
    const contantID = req.params.contantID;

    //  console.log("📌 contantID:", contantID);
    //  console.log("📌 body:", req.body);

    const contant = await Contant.findById(contantID);
    if (!contant) {
      return res.status(404).json({ msg: "المحتوى غير موجود" });
    }

    if (req.body.title !== undefined) contant.title = req.body.title;
    if (req.body.type !== undefined) contant.type = req.body.type;
    if (req.body.url !== undefined) contant.url = req.body.url;
    if (req.body.duration !== undefined) contant.duration = req.body.duration;
    if (req.body.active !== undefined) contant.active = req.body.active;
    if (req.body.exam_duration !== undefined) contant.exam_duration = req.body.exam_duration;
    if (req.body.questions !== undefined) {
      // فلتر الأسئلة الفارغة
      let filteredQuestions = req.body.questions.filter(q =>
        q.title && q.answer_1 && q.answer_2 && q.answer_3 && q.answer_4
      );
    
      // إزالة _id الغير صالح
      filteredQuestions = filteredQuestions.map(q => {
        if (!mongoose.Types.ObjectId.isValid(q._id)) delete q._id;
        return q;
      });
    
      contant.questions = filteredQuestions;
    }
    
    await contant.save();

    res.json({ msg: "✅ تم تعديل المحتوى", contant });
  } catch (err) {
    console.error("❌ خطأ أثناء التعديل:", err);
    res.status(500).json({ msg: "حدث خطأ أثناء التعديل", error: err.message });
  }
});
app.delete("/courses/:courseID/contants/:contantID", async (req, res) => {
  try {
    const  contantID  = req.params.contantID;

    const deleted = await Contant.findByIdAndDelete(contantID);

    if (!deleted) {
      return res.status(404).json({ msg: "❌ المحتوى غير موجود" });
    }

    res.json({ msg: "✅ تم حذف المحتوى" });
  } catch (err) {
    console.error("❌ خطأ أثناء الحذف:", err.message);
    res.status(500).json({ msg: "حدث خطأ أثناء الحذف" });
  }
});

                                    //==================Coupon====================\\
app.post("/coupon/:courseId/:count", async (req, res) => {
  const { courseId, count } = req.params;
  const { usageLimit, expiresAt } = req.body;

  // تحقق من صلاحية الـ ObjectId
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ msg: "معرف الكورس غير صالح" });
  }

  const courseObjectId = new mongoose.Types.ObjectId(courseId);

  const generateRandomCode = () => {
    return 'CODE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const coupons = [];

  for (let i = 0; i < parseInt(count); i++) {
    coupons.push({
      code: generateRandomCode(),
      courseId: courseObjectId,
      expiresAt: new Date(expiresAt),
      usageLimit: parseInt(usageLimit),
      usedCount: 0,
      isActive: true
    });
  }

  try {
    const result = await Coupon.insertMany(coupons);
    res.json({ msg: `${count} كوبون تم إنشاؤهم بنجاح`, coupons: result });
  } catch (err) {
    console.error('خطأ أثناء الإنشاء:', err.message);
    res.status(500).json({ msg: "فشل في إنشاء الكوبونات", error: err.message });
  }
});

  app.get("/coupon", async (req, res) => {
    try {
      const { courseId } = req.query;
  
      if (!courseId) {
        return res.status(400).json({ msg: "يرجى إرسال معرف الكورس" });
      }
  
      const coupons = await Coupon.find({ courseId });
      res.json(coupons);
    } catch (err) {
      console.error("خطأ أثناء الجلب:", err.message);
      res.status(500).json({ msg: "حصل خطأ في السيرفر" });
    }
  });
  app.put("/coupon/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
  
      // تحقق من وجود الكوبون
      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return res.status(404).json({ msg: "الكوبون غير موجود" });
      }
  
      // تحديث البيانات
      Object.assign(coupon, updates);
      await coupon.save();
  
      res.json({ msg: "تم تعديل الكوبون بنجاح", coupon });
    } catch (err) {
      console.error("خطأ أثناء التعديل:", err.message);
      res.status(500).json({ msg: "حصل خطأ في السيرفر" });
    }
  });
  app.delete("/coupon/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const deleted = await Coupon.findByIdAndDelete(id);
  
      if (!deleted) {
        return res.status(404).json({ msg: "الكوبون غير موجود" });
      }
  
      res.json({ msg: "تم حذف الكوبون بنجاح" });
    } catch (err) {
      console.error("خطأ أثناء الحذف:", err.message);
      res.status(500).json({ msg: "حصل خطأ في السيرفر" });
    }
  });
                                    //==================result====================\\

app.get("/result", async (req, res) => {
  try {
    const quizID = req.query.quizID;

    if (!quizID) {
      return res.status(400).json({ message: "QuizID مطلوب" });
    }

    if (!mongoose.Types.ObjectId.isValid(quizID)) {
      return res.status(400).json({ message: "الـ quizID مش ObjectId صالح" });
    }

    const results = await result.find({ quizID: new mongoose.Types.ObjectId(quizID) })
      .populate("studentId", "name email")
      

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "لا يوجد نتائج لهذا الكويز" });
    }

    res.json(results);
  } catch (error) {
    console.error("❌ خطأ في السيرفر:", error);
    res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
  }
});
app.post("/result", async (req, res) => {
  try {
    const { studentId, courseId, quizID, results, score } = req.body;

    // تحقق من صحة quizID
    if (!quizID || !mongoose.Types.ObjectId.isValid(quizID)) {
      return res.status(400).json({ message: "quizID غير صالح" });
    }

    // تحقق إذا الطالب سبق وامتحن نفس الاختبار
    const existingResult = await result.findOne({ studentId, quizID });
    if (existingResult) {
      return res.status(409).json({ message: "الطالب سبق وأن امتحن هذا الاختبار" });
    }

    // حفظ النتيجة الجديدة
    const newResult = new result({
      studentId,
      courseId,
      quizID,
      results,
      score
    });

    await newResult.save();

    // البحث عن المستخدم
    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    // التحقق من صحة الدرجة
    const numScore = Number(score);
    if (isNaN(numScore)) {
      return res.status(400).json({ message: "الدرجة غير صالحة" });
    }

    // تحديث النقاط
    user.points = (user.points || 0) + numScore;
    await user.save();

    res.status(201).json({
      message: "تم حفظ النتيجة وتحديث نقاط الطالب بنجاح",
      result: newResult
    });
  } catch (error) {
    console.error("❌ خطأ في حفظ النتيجة:", error);
    res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
  }
});
app.get("/user/courses", async (req, res) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token extracted:", token);

  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, SECRET);
    console.log("Decoded token:", decoded);

    if (!decoded.id) {
      return res.status(400).json({ message: "معرّف غير صالح في التوكن" });
    }

    const userId = decoded.id;
    console.log("Searching courses for user ID:", userId);

    // لو users Array من ObjectId
    const courses = await Course.find({ users: mongoose.Types.ObjectId(userId) });
    console.log("Courses found:", courses);

    res.json(courses);
  } catch (err) {
    console.error("JWT verify or DB error:", err);
    return res.status(401).json({ message: "معرّف غير صالح أو توكن منتهي" });
  }
});

                                    //==================User====================\\

app.get("/user",async(req,res)=>{

  const authHeader = req.headers.authorization;
  userId = req.query.id

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

    const decoded = jwt.verify(token, SECRET);
if (decoded.role=="admin") {
  let user= await User.findById(decoded.id)
   const courses = await Course.find({ users: decoded.id })
   const studentResult = await result.find({ studentId: decoded.id })
   res.json({user,courses,studentResult})
  
}  else{

let user= await User.findById(decoded.id).select("-password -__v -results").limit(100)
   const courses = await Course.find({ users: decoded.id }).select("-password -__v -users")
   const studentResult = await result.find({ studentId: decoded.id }).select("-password -__v -results")
   res.json({user,courses,studentResult})

}

})
app.get("/admin/user/:id",async(req,res)=>{

  const authHeader = req.headers.authorization;
  userId = req.params.id

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

    const decoded = jwt.verify(token, SECRET);

if (decoded.role!="admin") {
  
  res.json({msg:"user is not admin"})
}
  let user= await User.findById(userId)
   const courses = await Course.find({ users:userId })
   const studentResult = await result.find({ studentId: userId })
   res.json({user,courses,studentResult})
  
  


});
app.put("/admin/user/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  const userId = req.params.id;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ msg: "User is not admin" });
    }

    const updateData = req.body;
    const updateFields = {};

    // تحديث بيانات الطالب العادية مباشرة
    const normalFields = ["name", "tel", "grad", "points", "centerId"];
    normalFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    });

    // تحديث الحصص أو الدفع جزئياً دون مسح باقي البيانات
    const monthsToUpdate = [
      "month1","month2","month3","month4","month5","month6",
      "month7","month8","month9","month10","month11","month12"
    ];

    monthsToUpdate.forEach(monthKey => {
      if (updateData[monthKey]) {
        Object.keys(updateData[monthKey]).forEach(field => {
          updateFields[`${monthKey}.${field}`] = updateData[monthKey][field];
        });
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      msg: "User updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});








app.get("/users", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;

    const { name, centerId } = req.query;

    // بناء الفلتر
    let filter = {};
    if (name) filter.name = { $regex: name, $options: "i" }; // بحث غير حساس لحالة الأحرف
    if (centerId) filter.centerId = centerId;

    const totalUsers = await User.countDocuments(filter);

    const users = await User.find(filter)
      .sort({ centerId: 1 }) // ترتيب تصاعدي حسب centerId
      .skip(skip)
      .limit(limit);

    res.json({
      total: totalUsers,
      page,
      pages: Math.ceil(totalUsers / limit),
      users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

                                    //==================Rank====================\\

app.get("/rank", async (req, res) => {
  try {
    // البحث عن المستخدمين الذين نقاطهم أكبر من صفر وترتيبهم تنازلياً
    const users = await User.find({ points: { $gt: 0 } })
                            .sort({ points: -1 })
                            .select();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

  







app.get("/", (req, res) => {
  res.redirect("/home/home.html");
});
   app.use((req, res, next) => {
     res.sendFile(path.join(__dirname,  '404.html'));
   });

const port = 443;

const https = require('https');
const fs = require('fs');


// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/superphysics.online/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/superphysics.online/fullchain.pem')
// };

// https.createServer(options, app).listen(port, () => {
//   console.log(`Server running on HTTPS port ${port}`);
// });



app.listen(4000,()=>{
  console.log(`Server running on HTTPS port ${4000}`)
})







