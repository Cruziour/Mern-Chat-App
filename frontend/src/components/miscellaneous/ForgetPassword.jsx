import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // 👈 FontAwesome icons
import { forgetPassword } from '../../services';

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

  // Password visibility states
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
        setTimeout(() => {
          navigate('/chatpage');
        }, 2000);
      } else {
        setError(responseData.message || 'Old password is incorrect ❌');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  const handleCancel = () => {
    navigate('/chatpage');
  };

  const oldPassword = watch('oldPassword');
  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const isButtonDisabled =
    !isValid || oldPassword === newPassword || newPassword !== confirmPassword;

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold text-center mb-4 text-black">
          Reset Password
        </h2>

        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        {/* Old Password */}
        <div className="mb-3 relative">
          <label className="block mb-1 font-medium text-black">
            Old Password
          </label>
          <input
            type={showOld ? 'text' : 'password'}
            {...register('oldPassword', {
              required: 'Old password is required',
            })}
            className="w-full border rounded-md px-3 py-2 border-black text-black pr-10"
            placeholder="Enter old password"
          />
          <span
            className="absolute right-3 top-9 cursor-pointer text-gray-600"
            onClick={() => setShowOld(!showOld)}
          >
            {showOld ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
          </span>
          {errors.oldPassword && (
            <p className="text-red-500 text-sm mb-2">
              {errors.oldPassword.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="mb-3 relative">
          <label className="block mb-1 font-medium text-black">
            New Password
          </label>
          <input
            type={showNew ? 'text' : 'password'}
            {...register('newPassword', {
              required: 'New password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
              validate: (value) =>
                value !== oldPassword ||
                'New password must be different from old password',
            })}
            className="w-full border rounded-md px-3 py-2 border-black text-black pr-10"
            placeholder="Enter new password"
          />
          <span
            className="absolute right-3 top-9 cursor-pointer text-gray-600"
            onClick={() => setShowNew(!showNew)}
          >
            {showNew ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
          </span>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mb-2">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-4 relative">
          <label className="block mb-1 font-medium text-black">
            Confirm Password
          </label>
          <input
            type={showConfirm ? 'text' : 'password'}
            {...register('confirmPassword', {
              required: 'Confirm password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
              validate: (value) =>
                value === newPassword || 'Passwords do not match',
            })}
            className="w-full border rounded-md px-3 py-2 border-black text-black pr-10"
            placeholder="Confirm new password"
          />
          <span
            className="absolute right-3 top-9 cursor-pointer text-gray-600"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
          </span>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mb-2">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <button
          type="submit"
          className={`w-full py-2 rounded-md text-white ${
            !isButtonDisabled
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={isButtonDisabled}
        >
          Reset Password
        </button>

        <button
          type="button"
          onClick={handleCancel}
          className="w-full py-2 rounded-md mt-4 text-black border-4"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ForgetPassword;
