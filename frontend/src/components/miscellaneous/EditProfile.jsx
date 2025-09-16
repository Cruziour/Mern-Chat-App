import React from 'react';
import { useForm } from 'react-hook-form';
import { updateUserService } from '../../services';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    console.log('Form Data:', data);
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }
    console.log('FormData ready to send:', formData);
    await serviceUpdateUser(formData);
  };

  const serviceUpdateUser = async (formData) => {
    try {
      const response = await updateUserService(formData);
      if (response.statusCode === 201) {
        alert('Update Profile Successfully ✅');

        // Save updated user to localStorage
        // localStorage.setItem('user', JSON.stringify(response?.data));

        setTimeout(() => {
          navigate('/chatpage');
        }, 2000);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancelClick = () => {
    navigate('/chatpage');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="max-w-md w-full p-6 shadow-lg rounded-2xl bg-white border border-gray-300 text-black">
        <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Image Input */}
          <div>
            <label className="block mb-1 font-medium">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              {...register('image', { required: 'Image is required' })}
              onChange={(e) => {
                register('image').onChange(e);
              }}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.image && (
              <p className="text-red-500 text-sm">{errors.image.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            Update
          </button>
          <button
            type="button"
            className="w-full border-2 text-black p-2 rounded-lg hover:bg-blue-100 transition"
            onClick={handleCancelClick}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
