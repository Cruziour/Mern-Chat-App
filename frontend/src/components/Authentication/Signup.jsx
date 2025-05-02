import React, { useRef, useState } from 'react';
import { Button, Input } from '../../Forms';
import { registerUserService } from '../../services';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useForm } from 'react-hook-form';

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const serviceForSignUp = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await registerUserService(formData);
      reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSuccess(`${response?.data.name} is successfuly signup....`);
    } catch (error) {
      setError(
        error.response?.data?.message || 'An error occurred during signup'
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    if (data.pic && data.pic[0]) {
      formData.append('pic', data.pic[0]);
    }
    serviceForSignUp(formData);
  };

  return (
    <div className="mt-7">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Name"
          type="text"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}

        <Input
          label="Email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters long',
              },
            })}
          />
          <span
            className="absolute top-1/2 right-7 transform -translate-y-1/5 text-green-600 cursor-pointer"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              size="lg"
            />
          </span>
        </div>
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}

        <Input
          label="Avatar"
          type="file"
          inputClass="w-full border rounded-md h-10 px-0 mb-2 text-[1rem] cursor-pointer file:bg-green-100 file:border-2 file:px-4 file:py-2 file:rounded-md file:text-sm file:text-green-800"
          {...register('pic')}
          ref={(e) => {
            register('pic').ref(e);
            fileInputRef.current = e;
          }}
        />

        <Button
          btnName={loading ? 'Signing Up...' : 'Sign Up'}
          disabled={loading}
        />

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-600 mt-2">{success}</p>}
      </form>
    </div>
  );
};

export default Signup;
