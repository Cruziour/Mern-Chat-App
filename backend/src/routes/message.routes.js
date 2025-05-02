import { Router } from 'express';
import verifyJwt from '../middlewares/auth.middleware.js';
import { allMessages, sendMessage } from '../controllers/mesage.controllers.js';

const router = Router();

router.route('/').post(verifyJwt, sendMessage);
router.route('/:chatId').get(verifyJwt, allMessages);

export default router;
