import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; //Save to db

    await user.save({ validateBeforeSave: false });

    //{validateBeforeSave : false} দেয়ার কারনঃ
    //User model এ password required করেছি ফলে যখনি peofile view req এইরকম
    //User model এ password required করেছি ফলে যখনি peofile view req এইরকম req আসবে প্রতিবার password সেট করা চাইবে।
    //শুধু login,register এর বেলায় password লাগবে ,অন্যসময় দরকার নেই, নরমাল refreshToken চলবে। তাই (validateBeforeSave: false) করেছি।

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("REAL ERROR:", error);

    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  //username or email
  //find the user
  //password check
  //access & refresh token
  //send cookie

  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  /*
  alternative:-

  if (!(username || email)) {
    throw new ApiError(400, "username or password is required");
  }
    */

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  ); //{accessToken ,refreshToken} return value

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //send cookie
  const options = {
    //only modified by server(more secure)
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

//Logout
const logoutUser = asyncHandler(async (req, res) => {
  //user_id, refreshToken থেকে নিয়ে logout করা যেতো।
  //কিন্তু এখানে async func এ User model এর access নেই।
  //তাই এভাবে user_id দিয়ে করা যাবেনা। middleware design করবো

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, //return value: all new
    }
  );

  const options = {
    //only modified by server(more secure)
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

//End-point create: যাতে user refreshToken কে use করে again accessToken create করতে পারে।
const refreshAccessToken = asyncHandler(async (req, res) => {
  //1st cookies access
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  //Payload optional, not mandatory
  //decodedToken create এর মাধ্যমে refreshToken এর সকল তথ্য decodedToken এর মধ্যে চলে এসেছে
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = await User.findById(decodedToken?._id);
  
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
  
    if (incomingRefreshToken != user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used ");
    }
    //New Token Generate by generateAccessAndRefreshToken method
    //options কে global এ declare করা যায় কারন এর কাজ বারবার লাগছে।
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
           { accessToken, refreshToken: newRefreshToken },
           "Access token refreshed"
        ));
  } catch (error) {
    throw new ApiError(401 , error?.message || "Invalid refresh token" )
    
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
