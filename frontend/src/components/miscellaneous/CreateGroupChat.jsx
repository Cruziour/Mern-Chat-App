import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../../Forms';
import { searchUserService, createGroupChatService } from '../../services';
import Toast from '../../Forms/Toast';

const CreateGroupChat = ({ setCreateGroupChat }) => {
  const [allSelecteUser, setAllSelecteUser] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const watchedUsers = watch('users');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const log = async (data) => {
    // Prepare data for group chat creation
    const groupData = {
      name: data.name,
      users: allSelecteUser.map((user) => user?._id),
    };

    groupData.users = JSON.stringify(groupData.users);

    if (!groupData.name || groupData.users.length === 0) {
      showToast(
        'Please provide a chat name and add at least one user.',
        'error'
      );
      return;
    }

    try {
      const response = await createGroupChatService(groupData);
      if (response) {
        reset();
        setAllSelecteUser([]);
        setAvailableUsers([]); //clear available users
        setCreateGroupChat(false);
        showToast('Group chat created successfully!', 'success');
      }
    } catch (error) {
      showToast(
        error?.message || 'Failed to create group chat. Please try again.',
        'error'
      );
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!watchedUsers || watchedUsers.trim() === '') {
        setAvailableUsers([]);
        return;
      }

      try {
        const response = await searchUserService(watchedUsers.trim());
        if (response?.data && Array.isArray(response.data)) {
          const uniqueUsers = response.data.filter(
            (user) =>
              !allSelecteUser.find(
                (selectedUser) => selectedUser._id === user._id
              )
          );
          const userIds = new Set();
          const filteredUniqueUsers = [];
          uniqueUsers.forEach((user) => {
            if (!userIds.has(user._id)) {
              userIds.add(user._id);
              filteredUniqueUsers.push(user);
            }
          });
          setAvailableUsers(filteredUniqueUsers);
        }
      } catch (err) {
        showToast(
          err?.message || 'Failed to search user. Please try again.',
          'error'
        );
        setAvailableUsers([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [watchedUsers, allSelecteUser]);

  const removeUser = (userId) => {
    setAllSelecteUser((prevUsers) => {
      const removedUser = prevUsers.find((user) => user._id === userId);
      if (removedUser) {
        setAvailableUsers((prevAvailableUsers) => [
          ...prevAvailableUsers,
          removedUser,
        ]);
      }

      return prevUsers.filter((user) => user._id !== userId);
    });
  };

  const addUserToSelected = (user) => {
    if (!allSelecteUser.find((selectedUser) => selectedUser._id === user._id)) {
      setAllSelecteUser([...allSelecteUser, user]);
      setAvailableUsers((prevAvailableUsers) =>
        prevAvailableUsers.filter(
          (availableUser) => availableUser._id !== user._id
        )
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
      <div className=" border-2 border-black p-6 rounded-lg shadow-lg w-[90vw] md:w-[25vw] bg-gray-100">
        <div className="flex flex-col items-center">
          <h1 className="text-black mb-4 text-2xl underline">
            Create Group Chat
          </h1>
          <div>
            <form onSubmit={handleSubmit(log)}>
              <Input
                type="text"
                inputClass="h-8 border bg-gray-200 rounded-2xl text-black px-4 py-1"
                placeholder="Chat Name"
                {...register('name', { required: 'Chat name is required' })}
              />
              {errors.chatName && <p className="text-red">{errors.message}</p>}
              <br />
              <Input
                type="text"
                inputClass="h-8 border bg-gray-200 rounded-2xl text-black px-4 py-1"
                placeholder="Add User in a Chat"
                {...register('users')}
              />
              {errors.users && <p className="text-red">{errors.message}</p>}

              <div className="mt-2 w-full max-h-40 overflow-y-auto">
                {availableUsers.length > 0 && (
                  <>
                    <h3 className="text-md font-semibold mb-1">
                      Available Users:
                    </h3>
                    {availableUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between bg-white text-black border rounded-2xl px-1 pl-3 py-1 mb-1 shadow cursor-pointer hover:bg-gray-200"
                      >
                        <span className="text-black">{user.name}</span>
                        <Button
                          btnName="Add User"
                          btnClass="bg-red-500 text-white px-2 py-1 rounded ml-2"
                          onClick={() => addUserToSelected(user)}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="mt-4 w-full">
                {allSelecteUser.length > 0 && (
                  <>
                    <h3 className="text-md font-semibold mb-1 text-black">
                      Selected Users:
                    </h3>
                    {allSelecteUser.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between bg-white border rounded-2xl pl-3 pr-1 py-1 mb-1 shadow"
                      >
                        <span className="text-black">{user.name}</span>
                        <Button
                          btnName="Remove"
                          btnClass="bg-red-500 text-white px-2 py-1 rounded ml-2"
                          onClick={() => removeUser(user._id)}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>

              <Button btnName="create group chat" />
            </form>
          </div>
          <Button
            btnName="Close"
            btnClass="mt-4 w-full bg-red-500 text-white py-2 px-2 rounded"
            onClick={() => setCreateGroupChat(false)}
          />
          {toast.show && <Toast message={toast.message} type={toast.type} />}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupChat;
