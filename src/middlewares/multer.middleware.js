import multer from "multer";

//user থেকে req json data format এ পাওয়া যায় তবে যদি file আসে সেটা handle করার জন্যই মূলত multer ব্যবহার হয়।
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
