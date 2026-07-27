import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//cors(middleware),cookie-parser এই দুইটা app বানানোর পর configure করতে হয়। কারন নয়তো middleware use করবো কিভাবে।

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, //ctrl+SPACE করে অন্যান্য অপশনস দেখা যায়।
  })
);

//বিভিন্ন সাইট থেকে ডাটা আসবে(json format,direct data,from form submit,tc) সেটা accept করতে হবে।

app.use(express.json({ limit: "16kb" })); //middleware set & limit set when data came from form

app.use(express.urlencoded({ extended: true, limit: "16kb" })); //middlewre set f or data comming from url, extended:obj এর ভিতর obj use করা যায়।
app.use(express.static("public")); // public assets যেগুলো যে কেউ access করতে পারবে-static("public"):ফোল্ডার এর নাম public রেখেছি

app.use(cookieParser()); //user এর cookieparser access

//routes import
import userRouter from "./routes/user.routes.js";

//routers declaration
app.use("/api/v1/users", userRouter); //user যদি /users লিখে তাহলে তাকে userRouter এর control দিবো

//http://localhost:8000/api/v1/users/register
export { app };
