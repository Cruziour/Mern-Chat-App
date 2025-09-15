import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBell,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Button, Input } from '../../Forms';
import { logout } from '../../redux/slices/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedUser } from '../../redux/slices/selectedUserSlice';
import { setChatAllUsers } from '../../redux/slices/chatsAllUserSlice';
import { useNavigate } from 'react-router-dom';
import {
  createChatService,
  logoutService,
  searchUserService,
} from '../../services';
import MyProfile from './MyProfile';
import Toast from '../../Forms/Toast';
import { clearNotification } from '../../redux/slices/notificationsSlice';

const SideDrawer = () => {
  const user = useSelector((state) => state.user?.user);
  const notifications = useSelector((state) => state.notifications.notificationsByUser);
  const chatAllUsers = useSelector((state) => state.chatsAllUser?.chatAllUsers || []);
  const selectedUser = useSelector((state) => state.selectedUser?.selectedUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [searchedUser, setSearchedUser] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showSearchSidebar, setShowSearchSidebar] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const sidebarRef = useRef(null);
  const toastTimeoutRef = useRef();

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown((prev) => !prev);
    setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown((prev) => !prev);
    setShowNotificationDropdown(false);
  };

  const openSearchSidebar = () => {
    setShowSearchSidebar(true);
  };

  const searchUser = async (data) => {
    if (!data.name) {
      showToast('Please enter a name to search', 'error');
      return;
    }
    try {
      const response = await searchUserService(data.name);
      setSearchedUser(response?.data || []);
      reset();
      showToast('Users fetched successfully');
    } catch (error) {
      showToast(error?.message || 'Error searching users', 'error');
    }
  };

  const handleProfileClick = () => {
    setShowProfileCard(true);
    setShowProfileDropdown(false);
  };

  const handleLogoutClick = async () => {
    try {
      const res = await logoutService();
      if (res.success) {
        localStorage.clear();
        dispatch(logout());
        navigate('/');
        showToast('Logout successful');
      } else {
        showToast('Logout failed', 'error');
      }
    } catch (err) {
      showToast('Logout error: ' + err.message, 'error');
    }
  };

  const handleResetClick = () => {
    navigate('/reset-password')
  }

  const createChat = async (user) => {
    try {
      const response = await createChatService({ userId: user._id });
      dispatch(setSelectedUser(user));
      dispatch(setChatAllUsers(response?.data));
      showToast('Chat created successfully');
    } catch (error) {
      showToast(`${error.message}`, 'error');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotificationDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest('.search-button')
      ) {
        setShowSearchSidebar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate total unread count
  const totalUnreadCount = Object.values(notifications || {}).reduce((acc, count) => acc + count, 0);

  // Clear notification for a user when their chat is opened
  useEffect(() => {
    if (selectedUser) {
      dispatch(clearNotification(selectedUser._id));
    }
  }, [selectedUser, dispatch]);

  // Render notification dropdown items
  const renderNotificationItems = () => {
    if (!notifications || Object.keys(notifications).length === 0) {
      return <div className="px-4 py-2 text-gray-700 text-sm">No new notifications</div>;
    }
    return Object.entries(notifications).map(([userId, count]) => {
      const user = chatAllUsers.find((u) => u._id === userId);
      if (!user) return null;
      return (
        <div
          key={userId}
          className="px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm cursor-pointer"
          onClick={() => {
            dispatch(setSelectedUser(user));
            dispatch(clearNotification(userId));
            setShowNotificationDropdown(false);
          }}
        >
          {user.name} - {count} new message{count > 1 ? 's' : ''}
        </div>
      );
    });
  };

  return (
    <div className="relative w-full h-[9.5vh] bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-500 shadow-md text-black">
      <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8">
        {/* Left - Search */}
        <div className="flex items-center w-1/3">
          <FontAwesomeIcon
            icon={faSearch}
            className="text-white text-2xl cursor-pointer search-button"
            onClick={openSearchSidebar}
          />
          <form onSubmit={handleSubmit(searchUser)}>
            <Input
              type="text"
              placeholder="Search Users..."
              inputClass="hidden md:block border rounded-md py-1 px-2 w-full bg-gray-100 focus:outline-none text-black"
              onClick={openSearchSidebar}
              readOnly
            />
            {errors.search && <p>{errors.search.message}</p>}
          </form>
        </div>

        {/* Center - App Name */}
        <div className="text-white text-center w-1/3">
          <h1 className="text-md md:text-2xl font-light">
            Online Chatting App
          </h1>
        </div>

        {/* Right - Notifications & Profile */}
        <div className="flex items-center justify-end w-1/3 space-x-6">
          <div ref={notificationRef} className="relative">
            <FontAwesomeIcon
              icon={faBell}
              className="text-white text-2xl cursor-pointer"
              onClick={toggleNotificationDropdown}
            />
            {totalUnreadCount > 0 && (
              <div className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {totalUnreadCount}
              </div>
            )}
            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow-lg py-2 z-50">
                {renderNotificationItems()}
              </div>
            )}
          </div>

          <div ref={profileRef} className="relative">
            <FontAwesomeIcon
              icon={faUserCircle}
              className="text-white text-2xl cursor-pointer"
              onClick={toggleProfileDropdown}
            />
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg py-2 z-50">
                <Button
                  btnName="Profile"
                  btnClass="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={handleProfileClick}
                />
                <Button
                  btnName="Reset Password"
                  btnClass="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={handleResetClick}
                />
                <Button
                  btnName="Logout"
                  btnClass="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={handleLogoutClick}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar for search */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-72 md:w-96 bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-500 shadow-lg transform ${
          showSearchSidebar ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="p-4 flex flex-col gap-4">
          <form
            onSubmit={handleSubmit(searchUser)}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              <Input
                type="text"
                placeholder="Search Users..."
                inputClass="border rounded-md py-1 px-2 w-full bg-gray-100 focus:outline-none text-black"
                {...register('name')}
              />
              <Button
                btnName="Search"
                type="submit"
                btnClass="bg-red-800 text-white py-1 px-2 rounded ml-2"
              />
            </div>
          </form>

          {/* Searched users */}
          <div className="mt-4">
            {searchedUser?.length > 0 ? (
              <div className="flex flex-col gap-2">
                {searchedUser.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white rounded-md p-2 shadow-sm flex items-center gap-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => createChat(user)}
                  >
                    <img
                      src={user.pic || 'default-avatar.png'}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-black">
                        {user.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {user.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white text-sm">No users found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Card */}
      {showProfileCard && user && (
        <MyProfile user={user} setShowProfileCard={setShowProfileCard} />
      )}

      {/* Toast message */}
      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default SideDrawer;
