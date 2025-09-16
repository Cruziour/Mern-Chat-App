import React, { useEffect, useState } from 'react';
import { Button } from '../../Forms';

const MyProfile = ({ user, setShowProfileCard }) => {
  const [profile, setProfile] = useState(user);

  // Auto-refresh when component loads
  useEffect(() => {
    const fetchUser = () => {
      // Example: Get from localStorage (or you can call API here)
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setProfile(storedUser);
      }
    };

    fetchUser();

    // Optional: refresh every time window reloads
    window.addEventListener('storage', fetchUser);

    return () => {
      window.removeEventListener('storage', fetchUser);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-500 p-6 rounded-lg shadow-lg w-[90vw] md:w-[25vw]">
        <div className="flex flex-col items-center">
          <img
            src={profile?.pic || 'default-avatar.png'}
            alt="User"
            className="w-35 h-34 rounded-full mb-4 border-5 border-indigo-700"
          />
          <h2 className="text-xl font-semibold">{profile?.name}</h2>
          <p className="text-gray-800">{profile?.email}</p>
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
