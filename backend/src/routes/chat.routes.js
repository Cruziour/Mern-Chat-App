import { Router } from 'express';
import verifyJwt from '../middlewares/auth.middleware.js';
import {
  accessChat,
  addToGroup,
  createGroupChat,
  fetchChats,
  removeFromGroup,
  renameGroup,
} from '../controllers/chat.controllers.js';

const router = Router();

// secure routes
router.route('/').post(verifyJwt, accessChat);
router.route('/').get(verifyJwt, fetchChats);
router.route('/group').post(verifyJwt, createGroupChat);
router.route('/rename').put(verifyJwt, renameGroup);
router.route('/groupremove').put(verifyJwt, removeFromGroup);
router.route('/groupadd').put(verifyJwt, addToGroup);

export default router;
