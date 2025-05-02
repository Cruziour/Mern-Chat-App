import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MyProfile from '../miscellaneous/MyProfile';
import { fetchAllChatsService } from '../../services';
import { setChatAllUsers } from '../../redux/slices/chatsAllUserSlice';
import { setSelectedUser } from '../../redux/slices/selectedUserSlice';
import Toast from '../../Forms/Toast';
import { Button } from '../../Forms';
import CreateGroupChat from '../miscellaneous/CreateGroupChat';

const MyChats = () => {
  const dispatch = useDispatch();
  const chatsAllUser = useSelector((state) => state.chatsAllUser?.chatsAllUser);
  const loggedInUser = useSelector((state) => state.user?.user);
  const notificationsByUser = useSelector((state) => state.notifications?.notificationsByUser);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [createGroupChat, setCreateGroupChat] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000); // Hide after 3 seconds
  };

  useEffect(() => {
    const getChats = async () => {
      try {
        const response = await fetchAllChatsService();
        if (response && response.data) {
          response.data.forEach((chat) => {
            dispatch(setChatAllUsers(chat));
          });
          showToast('Chats loaded successfully!', 'success');
        }
      } catch (error) {
        const message = 'Failed to fetch chats!';
        showToast(message || error.message, 'error');
      }
    };
    getChats();
  }, [dispatch]);

  const handleProfileClick = (user) => {
    setProfileUser(user);
    setShowProfileCard(true);
  };

  const handleCreateGroupChat = () => {
    setCreateGroupChat(true)
  };

  const isChatsEmpty = !chatsAllUser || chatsAllUser.length === 0;

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      <div className="my-chats-container p-4 md:w-[30vw] w-full bg-white rounded-lg shadow-md h-full overflow-y-auto z-10">
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-2xl font-semibold text-indigo-700">
            Chats Users
          </h2>
          <Button
            btnName="Create Group Chat"
            btnClass="bg-indigo-600 text-white md:px-4 md:py-2 rounded-lg hover:bg-indigo-700 transition text-sm px-2 py-1"
            onClick={handleCreateGroupChat}
          />
        </div>

        <div className="flex flex-col gap-4 h-[77vh] overflow-y-auto">
          {isChatsEmpty ? (
            <div className="text-center text-gray-500 mt-10">
              No chats users found
            </div>
          ) : (
            chatsAllUser?.map((chat) => {
              if (chat?.isGroupChat) {
                return (
                  <div
                    key={chat._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-2xl bg-gray-200 hover:bg-indigo-300 cursor-pointer transition"
                    onClick={() => dispatch(setSelectedUser(chat))}
                  >
                    <p className="font-bold text-lg text-gray-900">{chat.chatName}</p>
                  </div>
                );
              } else {
                const otherUser = chat.users.find(
                  (user) => user._id !== loggedInUser._id
                );
                const unreadCount = notificationsByUser[otherUser._id] || 0;
                return (
                  <div
                    key={chat._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-2xl bg-gray-200 hover:bg-indigo-300 cursor-pointer transition"
                    onClick={() => dispatch(setSelectedUser(chat))}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={otherUser.pic || 'default-avatar.png'}
                        alt={otherUser.name}
                        className="w-14 h-14 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileClick(otherUser);
                        }}
                      />
                      <div>
                        <p className="font-bold text-lg text-gray-900">
                          {otherUser.name}
                        </p>
                        <p className="text-gray-600">{otherUser.email}</p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-1">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                );
              }
            })
          )}
        </div>
      </div>

      {showProfileCard && profileUser && (
        <MyProfile user={profileUser} setShowProfileCard={setShowProfileCard} />
      )}

      {createGroupChat && <CreateGroupChat setCreateGroupChat={setCreateGroupChat} />}
    </>
  );
};

export default MyChats;