import { Router } from 'express';
import verifyJwt from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import {
  allUsers,
  forgetPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateProfile,
} from '../controllers/user.controllers.js';

const router = Router();

//unsecured routes
router
  .route('/')
  .post(upload.single('pic'), registerUser)
  .get(verifyJwt, allUsers);

router.route('/login').post(loginUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/logout').post(verifyJwt, logoutUser);
router.route('/forget-password').patch(verifyJwt, forgetPassword);
router.route('/update').patch(verifyJwt, upload.single('image'), updateProfile);

export default router;
