import mongoose, { schema } from "mongoose";
import jtw from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      index: true, //searching field কে better বানানোর জন্য ।
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"], //'' এর ভিতরে custom message use করেছি।
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true, //created at & updated at
  }
);

//Password encrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
}); //1. arrow-fun use করা যাবেনা কারন this keyword use করা যায়না,আর আমাদের password এর তথ্য indicate করতে হবে তাই normal-fun use করেছি।
//2.যেহেতু middleware তাই (next) parameter use করেছি।
//3. 10 number দ্বারা round সংখ্যা বোঝাচ্ছে।
//4. PROBLEM: user যেকোনো তথ্য আপডেট করলে প্রতিবার password modify করবে...Solution: if condition-যদি আগে modify করা ন থাকে তাহলে return করো next. এতে করে user only password এর সাথে কিছু নতুন করল তখনই password এর এই pre hook টির method run করবে।

//Check password is correct/incorrect with customize method creation...
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); //bool value return
};

userSchema.methods.generateAccessToken = function () {
  return jtw.sign(
    {
      //Payload set: left site= payload key, right site=came from db

      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jtw.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
