import { v2 as cloudinary } from "cloudinary"; //as cloudinary = Custom name
import { log } from "console";
import fs from "fs";

//config: gives file uploading permission
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    //console.log("file is uploaded on cloudinary", response.url);

    fs.unlinkSync(localFilePath);
    return response; //user এর কাছে response return
  } catch (error) {
    fs.unlinkSync(localFilePath);

    return null;
    //unlink এটি আমার server থেকে পুরোপুরি ফাইল ডিলিট করেনা বরং unlink করে, অবশ্যই Sync হবে ,এটির কাজ না শেষ হয়ে সামনে আগানো যাবেনা।
  }
};

export { uploadOnCloudinary };
