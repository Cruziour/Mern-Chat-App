import mongoose from 'mongoose';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';
import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';

const allMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.aggregate([
      { $match: { chat: new mongoose.Types.ObjectId(chatId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender',
        },
      },
      { $unwind: '$sender' },
      {
        $lookup: {
          from: 'chats',
          localField: 'chat',
          foreignField: '_id',
          as: 'chat',
        },
      },
      { $unwind: '$chat' },
      {
        $lookup: {
          from: 'users',
          localField: 'chat.users',
          foreignField: '_id',
          as: 'chat.users',
        },
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          sender: {
            _id: 1,
            name: 1,
            email: 1,
            pic: 1,
          },
          chat: {
            _id: 1,
            chatName: 1,
            isGroupChat: 1,
            users: {
              _id: 1,
              name: 1,
              email: 1,
              pic: 1,
            },
          },
        },
      },
      { $sort: { createdAt: 1 } },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, messages, 'Fetched messages successfully'));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    throw new ApiError(400, 'Content and chatId are required');
  }

  const newMessage = {
    sender: req.user?._id,
    content,
    chat: chatId,
  };

  try {
    const messageDoc = await Message.create(newMessage);

    // Fetch the created message with aggregation
    const [message] = await Message.aggregate([
      { $match: { _id: messageDoc?._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender',
        },
      },
      { $unwind: '$sender' },
      {
        $lookup: {
          from: 'chats',
          localField: 'chat',
          foreignField: '_id',
          as: 'chat',
        },
      },
      { $unwind: '$chat' },
      {
        $lookup: {
          from: 'users',
          localField: 'chat.users',
          foreignField: '_id',
          as: 'chat.users',
        },
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          sender: {
            _id: 1,
            name: 1,
            email: 1,
            pic: 1,
          },
          chat: {
            _id: 1,
            chatName: 1,
            isGroupChat: 1,
            users: {
              _id: 1,
              name: 1,
              email: 1,
              pic: 1,
            },
          },
        },
      },
    ]);

    // Update chat's latestMessage
    await Chat.findByIdAndUpdate(chatId, { latestMessage: messageDoc });

    return res
      .status(201)
      .json(new ApiResponse(201, message, 'Message sent successfully'));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

export { sendMessage, allMessages };
