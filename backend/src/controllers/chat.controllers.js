import { Chat } from '../models/chat.model.js';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';
import mongoose from 'mongoose';

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  try {
    const chat = await Chat.aggregate([
      {
        $match: {
          isGroupChat: false,
          users: { $all: [req.user._id, new mongoose.Types.ObjectId(userId)] },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'latestMessage',
          foreignField: '_id',
          as: 'latestMessage',
        },
      },
      { $unwind: { path: '$latestMessage', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'latestMessage.sender',
          foreignField: '_id',
          as: 'latestMessage.sender',
        },
      },
      {
        $unwind: {
          path: '$latestMessage.sender',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          chatName: 1,
          isGroupChat: 1,
          users: {
            _id: 1,
            name: 1,
            email: 1,
            pic: 1,
          },
          latestMessage: {
            _id: 1,
            content: 1,
            sender: {
              _id: 1,
              name: 1,
              email: 1,
              pic: 1,
            },
          },
        },
      },
    ]);

    if (chat.length > 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, chat[0], 'Chat reterive sccess.'));
    }

    // Chat not found, so create new one
    const chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.aggregate([
      { $match: { _id: createdChat?._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $project: {
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
    ]);

    return res.status(201).json(new ApiResponse(200, fullChat[0], 'success'));
  } catch (error) {
    console.error('Error in accessChat:', error);
    throw new ApiError(500, error.message || 'Server Error');
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    // Check if user ID exists in the request
    if (!req.user || !req.user._id) {
      throw new ApiError(401, 'Unauthorized access');
    }

    const chats = await Chat.aggregate([
      {
        $match: {
          users: { $elemMatch: { $eq: req.user._id } },
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'groupAdmin',
          foreignField: '_id',
          as: 'groupAdmin',
        },
      },
      {
        $unwind: {
          path: '$groupAdmin',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'latestMessage',
          foreignField: '_id',
          as: 'latestMessage',
        },
      },
      {
        $unwind: {
          path: '$latestMessage',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'latestMessage.sender',
          foreignField: '_id',
          as: 'latestMessage.sender',
        },
      },
      {
        $unwind: {
          path: '$latestMessage.sender',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          chatName: 1,
          isGroupChat: 1,
          updatedAt: 1,
          users: { _id: 1, name: 1, email: 1, pic: 1 },
          groupAdmin: { _id: 1, name: 1, email: 1, pic: 1 },
          latestMessage: {
            _id: 1,
            content: 1,
            createdAt: 1,
            sender: { _id: 1, name: 1, email: 1, pic: 1 },
          },
        },
      },
    ]);

    if (!chats || chats.length === 0) {
      return res.status(204).json(new ApiResponse(204, [], 'No chats found'));
    }

    res
      .status(200)
      .json(new ApiResponse(200, chats, 'Chats fetched successfully'));
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || 'Something went wrong while fetching chats.'
    );
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    throw new ApiError(400, 'Please fill all the fields');
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    throw new ApiError(
      400,
      'More than 2 users are required to form a group chat'
    );
  }

  users.push(req.user._id); // use _id for reference

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    // Aggregation pipeline to populate users and groupAdmin
    const fullGroupChat = await Chat.aggregate([
      { $match: { _id: groupChat._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'groupAdmin',
          foreignField: '_id',
          as: 'groupAdmin',
        },
      },
      {
        $unwind: '$groupAdmin',
      },
      {
        $project: {
          chatName: 1,
          isGroupChat: 1,
          users: {
            _id: 1,
            name: 1,
            email: 1,
            pic: 1,
          },
          groupAdmin: {
            _id: 1,
            name: 1,
            email: 1,
            pic: 1,
          },
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          fullGroupChat[0],
          'successfully created group chat.'
        )
      );
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new ApiError(400, 'Request body is required');
  }
  const { chatId, chatName } = req.body;

  try {
    // Update the chat name
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    );

    if (!updatedChat) {
      throw new ApiError(404, 'Chat Not Found');
    }

    // Fetch the updated chat using aggregation
    const fullUpdatedChat = await Chat.aggregate([
      { $match: { _id: updatedChat._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'groupAdmin',
          foreignField: '_id',
          as: 'groupAdmin',
        },
      },
      { $unwind: '$groupAdmin' },
      {
        $project: {
          chatName: 1,
          isGroupChat: 1,
          users: {
            _id: 1,
            name: 1,
            email: 1,
            pic: 1,
          },
          groupAdmin: {
            _id: 1,
            name: 1,
            email: 1,
            pic: 1,
          },
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          fullUpdatedChat[0],
          'successfully update chat name'
        )
      );
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new ApiError(400, 'Request body is required');
  }
  const { chatId, userId } = req.body;

  try {
    // Add the user to the group
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true }
    );

    if (!updatedChat) {
      throw new ApiError(404, 'Chat Not Found');
    }

    // Use aggregation to fetch full populated chat
    const fullChat = await Chat.aggregate([
      { $match: { _id: updatedChat._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'groupAdmin',
          foreignField: '_id',
          as: 'groupAdmin',
        },
      },
      { $unwind: '$groupAdmin' },
      {
        $project: {
          chatName: 1,
          isGroupChat: 1,
          users: {
            _id: 1,
            name: 1,
            email: 1,
            pic: 1,
          },
          groupAdmin: {
            _id: 1,
            name: 1,
            email: 1,
            pic: 1,
          },
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(200, fullChat[0], 'successfully add user to group')
      );
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new ApiError(400, 'Request body is required');
  }
  const { chatId, userId } = req.body;

  try {
    // Check if the requester is the group admin
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new ApiError(404, 'Chat not found');
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Only the group admin can remove users');
    }

    // Remove the user from the group
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    );

    if (!updatedChat) {
      throw new ApiError(404, 'Chat Not Found after update');
    }

    // Use aggregation to populate the chat with updated data
    const fullChat = await Chat.aggregate([
      { $match: { _id: updatedChat._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'groupAdmin',
          foreignField: '_id',
          as: 'groupAdmin',
        },
      },
      { $unwind: '$groupAdmin' },
      {
        $project: {
          chatName: 1,
          isGroupChat: 1,
          users: {
            _id: 1,
            name: 1,
            email: 1,
            pic: 1,
          },
          groupAdmin: {
            _id: 1,
            name: 1,
            email: 1,
            pic: 1,
          },
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          fullChat[0],
          'successfully removed user from group'
        )
      );
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
