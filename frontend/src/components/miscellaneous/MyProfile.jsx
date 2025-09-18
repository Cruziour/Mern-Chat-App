import React from 'react';
import { Button } from '../../Forms';

const MyProfile = ({ user, setShowProfileCard }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-500 p-6 rounded-lg shadow-lg w-[90vw] md:w-[25vw]">
        <div className="flex flex-col items-center">
          <img
            src={user?.pic || 'default-avatar.png'}
            alt="User"
            className="w-35 h-34 rounded-full mb-4 border-5 border-indigo-700"
          />
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-gray-800">{user?.email}</p>
          <Button
            btnName="Close"
            btnClass="mt-4 w-full bg-red-500 text-white py-2 px-2 rounded"
            onClick={() => setShowProfileCard(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
