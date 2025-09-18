import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { updateUserService } from '../../services';
import { useNavigate } from 'react-router-dom';
import SideDrawer from './SideDrawer';
import { FaHome } from 'react-icons/fa';

const EditProfile = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm({
    mode: 'onChange',
  });

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }
    await serviceUpdateUser(formData);
  };

  const serviceUpdateUser = async (formData) => {
    try {
      const response = await updateUserService(formData);

      if (response.statusCode === 201) {
        // ✅ Update user object in localStorage
        const updatedUser = response?.data; // make sure your backend sends updated user data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Update Profile Successfully ✅');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleClearClick = () => {
    reset();
  };

  // ❌ disable scrolling globally while this component is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <>
      <SideDrawer />
      <div className=" h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg  text-black font-medium hover:bg-gray-200 transition shadow-md"
        >
          <FaHome className="text-lg" />
          Home
        </button>

        <div className="flex justify-center pt-[10vh]">
          <div className="max-w-md w-full h-[50vh] flex flex-col justify-between p-8 shadow-2xl rounded-2xl bg-white border border-gray-200">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Edit Profile
            </h2>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col flex-1 justify-center gap-5"
            >
              {/* Name Input */}
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full p-3 border border-black text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Image Input */}
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...register('image', { required: 'Image is required' })}
                  className="w-full p-3 border border-black text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.image.message}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-auto">
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={`flex-1 p-3 rounded-xl font-semibold transition ${
                    !isValid || isSubmitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  {isSubmitting ? 'Updating...' : 'Update'}
                </button>

                <button
                  type="button"
                  className="flex-1 border-2 border-black text-black p-3 rounded-xl hover:bg-gray-100 transition font-semibold"
                  onClick={handleClearClick}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
