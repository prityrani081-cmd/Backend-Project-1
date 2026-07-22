import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST:${connectionInstance.connection.host}`
    ); //DB HOST এর আউটপুট দ্বারা বোঝা যায় যে mongoDB url এর যেখানে connection হচ্ছে সেটা দেখায়
    //কারণ ঃ dev,production এর host আলাদা হয় তাই ভুল করে যদি অন্য host এ না যাই তাই সেটা সিউর হওয়ার জন্য DB HOST আউটপুট দেখা হয়।
  } catch (error) {
    console.log("MONGODB connection error ", error);
    process.exit(1);
  }
};

export default connectDB;
