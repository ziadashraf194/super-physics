const mongoose = require("mongoose");

// سكيمة الحصص + حالة الدفع لكل شهر
const MonthSchema = new mongoose.Schema({
  h1: { type: String, enum: ["", "حاضر", "غائب"], default: "" },
  h2: { type: String, enum: ["", "حاضر", "غائب"], default: "" },
  h3: { type: String, enum: ["", "حاضر", "غائب"], default: "" },
  h4: { type: String, enum: ["", "حاضر", "غائب"], default: "" },
  h5: { type: String, enum: ["", "حاضر", "غائب"], default: "" },
  h6: { type: String, enum: ["", "حاضر", "غائب"], default: "" },
  h7: { type: String, enum: ["", "حاضر", "غائب"], default: "" },
  h8: { type: String, enum: ["", "حاضر", "غائب"], default: "" },
  paid: { type: String, enum: ["مدفوع", "غير مدفوع"], default: "غير مدفوع" }
}, { _id: false });

// Virtual لو حبيت تستخدم مصفوفة للحصص
MonthSchema.virtual("sessions")
  .get(function () {
    return [this.h1, this.h2, this.h3, this.h4, this.h5, this.h6, this.h7, this.h8];
  })
  .set(function (sessions) {
    this.h1 = sessions[0] || "";
    this.h2 = sessions[1] || "";
    this.h3 = sessions[2] || "";
    this.h4 = sessions[3] || "";
    this.h5 = sessions[4] || "";
    this.h6 = sessions[5] || "";
    this.h7 = sessions[6] || "";
    this.h8 = sessions[7] || "";
  });

// سكيمة المستخدم
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tel: { type: String, required: true },
  grad: String,
  password: { type: String, required: true },
  token: String,
  centerId: Number,
  points: { type: Number, default: 0 },
  role: { type: String, default: "user" },
  Image: { type: String, default: "/uploads/userImage.svg" },

  month1: { type: MonthSchema, default: () => ({}) },
  month2: { type: MonthSchema, default: () => ({}) },
  month3: { type: MonthSchema, default: () => ({}) },
  month4: { type: MonthSchema, default: () => ({}) },
  month5: { type: MonthSchema, default: () => ({}) },
  month6: { type: MonthSchema, default: () => ({}) },
  month7: { type: MonthSchema, default: () => ({}) },
  month8: { type: MonthSchema, default: () => ({}) },
  month9: { type: MonthSchema, default: () => ({}) },
  month10: { type: MonthSchema, default: () => ({}) },
  month11: { type: MonthSchema, default: () => ({}) },
  month12: { type: MonthSchema, default: () => ({}) },
}, { timestamps: true });

// هذا مهم لتفعيل الـ virtuals عند التحويل لـ JSON
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;
