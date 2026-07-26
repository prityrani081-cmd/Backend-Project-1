import { v2 as cloudinary } from "cloudinary"; //as cloudinary = Custom name
import { log } from "console";
import fs from "fs";

//config: gives file uploading permission
cloudinary.config({
  cloud_name: "process.env.CLOUDINARY_CLOUD_NAME",
  api_key: "my_kprocess.env.CLOUDINARY_API_KEY",
  api_secret: "process.env.CLOUDINARY_API_SECRET",
});

const uploadOnCloudinary = async (localFilPath) => {
  try {
    if (!localFilPath) return null;

    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilPath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    console.log("file is uploaded on cloudinary", response.url);

    return response; //user এর কাছে response return
  } catch (error) {
    fs.unlinkSync(localFilPath);
    return null;
    //unlink এটি আমার server থেকে পুরোপুরি ফাইল ডিলিট করেনা বরং unlink করে, অবশ্যই Sync হবে ,এটির কাজ না শেষ হয়ে সামনে আগানো যাবেনা।
  }
};


export {uploadOnCloudinary}