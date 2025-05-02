import { Router } from 'express';
import verifyJwt from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import {
  allUsers,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
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

export default router;
