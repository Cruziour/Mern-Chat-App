import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaHome } from 'react-icons/fa';
import { forgetPassword } from '../../services';
import SideDrawer from './SideDrawer';

const ForgetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm({ mode: 'onChange' });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (data) => {
    setSuccess('');
    setError('');
    try {
      const responseData = await forgetPassword(data);
      if (responseData?.statusCode === 200) {
        setSuccess(responseData.message || 'Password updated successfully ✅');
        reset();
        setTimeout(() => navigate('/chatpage'), 2000);
      } else {
        setError(responseData.message || 'Old password is incorrect ❌');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  const handleCancel = () => navigate('/chatpage');

  const oldPassword = watch('oldPassword');
  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const isButtonDisabled =
    !isValid || oldPassword === newPassword || newPassword !== confirmPassword;

  return (
    <>
      <SideDrawer />
      <div className=" h-[90vh] bg-gray-100 p-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg  text-black font-medium hover:bg-gray-200 transition shadow-md"
        >
          <FaHome className="text-lg" />
          Home
        </button>
        <div className="flex justify-center items-center mt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-8 rounded-2xl shadow-lg w-96"
          >
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              🔒 Reset Password
            </h2>

            {success && (
              <p className="text-green-600 text-sm mb-3">{success}</p>
            )}
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            {/* Old Password */}
            <div className="mb-4 relative">
              <label className="block mb-1 font-medium text-gray-700">
                Old Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showOld ? 'text' : 'password'}
                {...register('oldPassword', {
                  required: 'Old password is required',
                })}
                className="w-full border rounded-md px-3 py-2 border-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Enter old password"
              />
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
                onClick={() => setShowOld(!showOld)}
              >
                {showOld ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
              </span>
              {errors.oldPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.oldPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="mb-4 relative">
              <label className="block mb-1 font-medium text-gray-700">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showNew ? 'text' : 'password'}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'At least 6 characters required',
                  },
                  validate: (value) =>
                    value !== oldPassword ||
                    'New password must differ from old',
                })}
                className="w-full border rounded-md px-3 py-2 border-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Enter new password"
              />
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
              </span>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-5 relative">
              <label className="block mb-1 font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showConfirm ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Confirm password is required',
                  minLength: {
                    value: 6,
                    message: 'At least 6 characters required',
                  },
                  validate: (value) =>
                    value === newPassword || 'Passwords do not match',
                })}
                className="w-full border rounded-md px-3 py-2 border-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Confirm new password"
              />
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
              </span>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Buttons */}
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`w-full py-2 rounded-lg text-white font-medium transition ${
                !isButtonDisabled
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Reset Password
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-2 rounded-lg mt-3 text-gray-700 border border-gray-400 hover:bg-gray-100 font-medium transition"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;
