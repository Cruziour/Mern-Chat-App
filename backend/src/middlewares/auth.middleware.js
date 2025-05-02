import { User } from '../models/user.model.js';
import { ApiError, asyncHandler } from '../utils/index.js';
import jwt from 'jsonwebtoken';


const verifyJwt = asyncHandler(async (req, _, next) => { 
   const authHeader = req.headers.authorization;
   if (!authHeader || !authHeader.startsWith('Bearer ')) {
     return res.status(401).json({ message: 'Unauthorized' });
   }
   const token = authHeader.split(' ')[1];
   try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      return next(new ApiError(401, 'Access denied. Invalid token.'));
    }

    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken'
    );
 
    if (!user) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, error?.message || 'Invalid access token'));
  }
})

export default verifyJwt;

// const verifyJwt = asyncHandler(async (req, _, next) => {
//   const token = req.cookies?.accessToken;

//   if (!token) {
//     return next(new ApiError(401, 'Access denied. No token provided.'));
//   }
//   try {
//     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//     if (!decodedToken) {
//       return next(new ApiError(401, 'Access denied. Invalid token.'));
//     }

//     const user = await User.findById(decodedToken?._id).select(
//       '-password -refreshToken'
//     );

//     if (!user) {
//       return next(new ApiError(401, 'Unauthorized'));
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     return next(new ApiError(401, error?.message || 'Invalid access token'));
//   }
// });

