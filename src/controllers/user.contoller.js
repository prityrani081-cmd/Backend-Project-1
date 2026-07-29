import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //console.log(req.body);
  //console.log(req.files);

  // get user details from fronted
  // validation - not empty
  // check if user already exists: username, email
  // check for images & avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password & refresh token field from response
  // check for user creation
  // return res

  const { fullName, email, username, password } = req.body;
  //console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists ");
  }

  //console.log(req.files);

  const avatarLocalpath = req.files?.avatar?.[0]?.path;
  const coverImageLocalpath = req.files?.coverImage?.[0]?.path; //or
  /*  
    let coverImageLOcalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage >0){
      coverImageLocalPath = req.files.coverImage[0].path
    }
  */

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //Upload files
  const avatar = await uploadOnCloudinary(avatarLocalpath);
  const coverImage = await uploadOnCloudinary(coverImageLocalpath);

  //console.log("Avatar:", avatar);
  //console.log("Cover:", coverImage);

  //check avtar exists
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //create user object
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", //compulsory না তাই or use করেছি।মানে coverImage থাকলে url দাও নয়তো ""
    email,
    password,
    username: username.toLowerCase(),
  });

  //check user create?
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" //এগুলো বাদ দিয়ে বাকিগুলোর উপর চেক করবো। select এই method দ্বারা যদি (-) দিয়ে যেই ফিল্ডের নাম দিবো সেটি সিলেক্ট হবেনা।
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user ");
  }

  //return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
