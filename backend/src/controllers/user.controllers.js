import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import {
  ApiError,
  ApiResponse,
  asyncHandler,
  deleteFromCloudinary,
  uploadOnCloudinary,
} from '../utils/index.js';

const generateAccessAndRefreshToken = async (userId) => {
  try {
    if (!userId) {
      throw new ApiError(400, 'User ID is required');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const accessToken = user.generateAccessToken(); // Check this method
    const refreshToken = user.generateRefreshToken(); // Check this too

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Token generation error:', error); // ✅ Add this
    throw new ApiError(
      500,
      'Something went wrong while generating access and refresh tokens.'
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new ApiError(404, 'Request body is required');
  }

  const { name, email, password } = req.body;

  if ([name, email, password].some((field) => !field || field?.trim() === '')) {
    throw new ApiError(400, 'Please fill in all fields');
  }

  if (!req.file) {
    throw new ApiError(404, 'Image is required');
  }

  const picLocalPath = req.file?.path;

  if (!picLocalPath) {
    throw new ApiError(404, 'Image is required');
  }

  const pic = await uploadOnCloudinary(picLocalPath);
  if (!pic.secure_url) {
    throw new ApiError(500, 'Failed to upload avatar');
  }

  const isUserExists = await User.findOne({ email });
  if (isUserExists) {
    throw new ApiError(400, 'Email already exists');
  }

  try {
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      pic: pic?.secure_url,
    });

    if (!user || !user._id) {
      throw new ApiError(500, 'User creation failed');
    }

    const createdUser = await User.findById(user._id).select(
      '-password -refreshToken -createdAt -updatedAt'
    );
    if (!createdUser) {
      throw new ApiError(500, 'Failed to retrieve created user');
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, 'User created successfully'));
  } catch (error) {
    console.error('Register error:', error);
    await deleteFromCloudinary(pic?.public_id);
    throw new ApiError(500, 'Failed to create user');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError(400, 'Invalid request body');
  }

  const { email, password } = req.body;
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }
  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid email or password');
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user?._id
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
  };
  const userData = await User.findById(user._id).select(
    '-password -refreshToken'
  );
  return res
    .status(200)
    .json(new ApiResponse(200, { user: userData, accessToken }, 'User logged in successfully'));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'User logged out successfully.'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'refresh token is required.');
  }
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  if (!decodedToken) {
    throw new ApiError(404, 'Provided token is wrong');
  }
  try {
    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(404, 'User is not found.');
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Invalid refresh token.');
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
    };
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user?._id);

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          'Access Token refreshed successfully.'
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      'Something went wrong while refreshing access token.'
    );
  }
});

// /api/user?search=rupesh
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          {
            name: {
              $regex: req.query.search,
              $options: 'i',
            },
          },
          {
            email: {
              $regex: req.query.search,
              $options: 'i',
            },
          },
        ],
      }
    : {};
  // console.log(keyword);

  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user?._id } })
    .select('-password -refreshToken');
  if (!users) {
    throw new ApiError(404, 'No users found');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, users, 'Users retrieved successfully'));
});

export { registerUser, loginUser, logoutUser, allUsers, refreshAccessToken };
