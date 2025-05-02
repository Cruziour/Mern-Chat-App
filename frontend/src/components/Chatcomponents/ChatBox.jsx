import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMessagesService, sendMessageSerive } from '../../services';
import MyProfile from '../miscellaneous/MyProfile';
import { setSelectedUser } from '../../redux/slices/selectedUserSlice';
import { setMessages, addMessage } from '../../redux/slices/messagesSlice';
import { Button, Input } from '../../Forms';
import {
  isSameSenderMargin,
  isSameSender,
  isLastMessage,
} from '../../utils/messageUtils';
import Lottie from 'react-lottie';
import animationData from '../../animations/typing.json';
import { useForm } from 'react-hook-form';

// Socket io
import io from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_BACKEND_URL;
let socket, selectedChatCompare;

const ChatBox = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.user);
  const selectedChat = useSelector((state) => state.selectedUser?.selectedUser);
  const loggedInUser = useSelector((state) => state.user?.user);
  const messages = useSelector(
    (state) => state.messages.messagesByChat[selectedChat?._id] || []
  );
  const [loading, setLoading] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const defaultOption = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    renderSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));
  }, []);

  // useEffect(() => {
  //   const loadMessages = async () => {
  //     if (!selectedChat || !selectedChat._id) {
  //       dispatch(setMessages({ chatId: '', messages: [] }));
  //       return;
  //     }
  //     setLoading(true);
  //     try {
  //       const data = await fetchMessagesService(selectedChat._id);
  //       console.log(data);

  //       dispatch(
  //         setMessages({ chatId: selectedChat._id, messages: data.data })
  //       );
  //     } catch (error) {
  //       console.log(error);
  //       // Toast removed as per request
  //       dispatch(setMessages({ chatId: selectedChat._id, messages: [] }));
  //     }
  //     setLoading(false);
  //   };
  //   loadMessages();
  // }, [selectedChat, dispatch]);

  const loadMessages = async () => {
    if (!selectedChat || !selectedChat._id) {
      dispatch(setMessages({ chatId: '', messages: [] }));
      return;
    }
    setLoading(true);
    try {
      const data = await fetchMessagesService(selectedChat._id);
      console.log(data);

      dispatch(setMessages({ chatId: selectedChat._id, messages: data.data }));
      socket.emit('join chat', selectedChat?._id);
    } catch (error) {
      console.log(error);
      // Toast removed as per request
      dispatch(setMessages({ chatId: selectedChat._id, messages: [] }));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    const messageHandler = (newMessageRecieved) => {
      console.log('Received message:', newMessageRecieved);
      // Temporarily remove chat check to test receiving messages
      dispatch(
        addMessage({
          chatId: newMessageRecieved.chat._id,
          message: newMessageRecieved,
        })
      );
    };

    socket.on('message recieved', messageHandler);

    return () => {
      socket.off('message recieved', messageHandler);
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (data) => {
    if (!data.newMessage.trim() || !selectedChat || !selectedChat._id) return;
    const messageData = {
      content: data.newMessage.trim(),
      chatId: selectedChat._id,
    };
    socket.emit('stop typing', selectedChat?._id);
    try {
      const sentMessage = await sendMessageSerive(messageData);
      console.log(sentMessage);

      dispatch(
        addMessage({ chatId: selectedChat._id, message: sentMessage.data })
      );
      socket.emit('new message', sentMessage.data);
      reset();
    } catch (error) {
      console.log(error);
      // Toast removed as per request
    }
  };

  const handleCloseChat = () => {
    dispatch(setSelectedUser(null));
  };

  if (!selectedChat) {
    return (
      <div className="flex flex-col h-full p-4 bg-white rounded-lg shadow-md w-[66vw] text-black">
        <div className="flex items-center justify-center flex-grow text-gray-500 text-lg">
          No chat selected. Please select a chat to start messaging.
        </div>
      </div>
    );
  }

  const otherUser = selectedChat.users?.find(
    (user) => user._id !== loggedInUser?._id
  );

  const handleProfileClick = (user) => {
    setProfileUser(user);
    setShowProfileCard(true);
  };

  const typingHandler = () => {
    if (!socketConnected) return; // ← This is the correct logic
    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat?._id);
    }

    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat?._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <div className="flex flex-col h-full p-4 bg-white rounded-lg shadow-md md:w-[66vw] w-full text-black">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b pb-4 mb-4">
        <div className="flex items-center gap-4">
          {selectedChat.isGroupChat ? (
            <>
              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg cursor-default">
                {selectedChat.chatName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedChat?.chatName}
                </h2>
                {selectedChat?.users.map((user, index) => (
                  <span key={user?._id} className="text-gray-500 text-sm">
                    {user?.name}
                    {index < selectedChat.users.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <img
                src={otherUser?.pic || 'default-avatar.png'}
                alt={otherUser?.name}
                className="w-12 h-12 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProfileClick(otherUser);
                }}
              />
              <div>
                <h2 className="text-xl font-semibold">{otherUser?.name}</h2>
                <p className="text-gray-500 text-sm">{otherUser?.email}</p>
              </div>
            </>
          )}
        </div>
        <Button
          onClick={handleCloseChat}
          btnClass="text-gray-500 hover:text-gray-700 focus:outline-none text-2xl font-bold"
          aria-label="Close chat"
          title="Close chat"
          btnName="X"
        />
      </div>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-2 bg-gray-200 rounded-lg flex flex-col gap-2">
        {loading ? (
          <p className="text-center text-gray-400 mt-10">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">
            Start your conversation...
          </p>
        ) : (
          messages.map((msg, i) => {
            if (!msg || !msg.sender || !msg.sender._id) {
              return null; // Skip invalid messages
            }
            return (
              <div
                key={msg._id}
                style={{
                  marginLeft: isSameSenderMargin(
                    messages,
                    msg,
                    i,
                    loggedInUser?._id
                  ),
                }}
                className={`p-2 rounded-lg max-w-[70%] ${
                  msg.sender._id === loggedInUser?._id
                    ? 'bg-green-300 text-black self-end ml-auto'
                    : 'bg-gray-950 opacity-80 text-white self-start mr-auto'
                }`}
              >
                {(isSameSender(messages, msg, i, loggedInUser?._id) ||
                  isLastMessage(messages, i, loggedInUser?._id)) && (
                  <div className="text-xs font-semibold text-amber-500">
                    {msg.sender.name}
                  </div>
                )}
                <p>{msg.content}</p>
              </div>
            );
          })
        )}

        {/* Typing animation displayed as a new message bubble */}
        {isTyping && (
          <div
            className="flex items-center gap-2 p-2 rounded-lg max-w-[70%] bg-gray-200 text-black self-start mr-auto mb-16"
            style={{ maxHeight: '60px' }}
          >
            <div className="w-[50px] h-[40px]">
              {/* Lottie typing animation */}
              <Lottie options={defaultOption} width={50} height={40} />
            </div>
            <span className="text-sm text-gray-500">Typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* {isTyping && (
        <div
          className="flex items-center gap-2 bg-gray-200 text-black px-4 py-2 rounded-lg max-w-[60%] self-start mr-auto shadow-sm"
          style={{ maxHeight: '60px' }}
        >
          <div className="w-[50px] h-[40px]">
            <Lottie options={defaultOption} width={50} height={40} />
          </div>
          <span className="text-sm text-gray-500">Typing...</span>
        </div>
      )} */}

      {/* Input box */}
      <div className="mt-4 flex items-center gap-2">
        <form onSubmit={handleSubmit(handleSendMessage)}>
          <div className="flex justify-center items-center w-full">
            <Input
              type="text"
              placeholder="Type a Message...."
              inputClass="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-[70vw]"
              {...register('newMessage')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Don't call handleSendMessage() here
                }
                typingHandler();
              }}
            />
            <Button
              btnName="Send"
              btnClass="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-full"
              type="submit"
            />
          </div>
        </form>
      </div>
      {showProfileCard && profileUser && (
        <MyProfile user={profileUser} setShowProfileCard={setShowProfileCard} />
      )}
    </div>
  );
};

export default ChatBox;
