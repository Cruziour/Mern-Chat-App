import React, { useState } from 'react';
import { Button, Input } from '../../Forms';
import { loginService } from '../../services';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const serviceLogin = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await loginService(data);
      dispatch(loginSuccess(response.data));
      navigate('/chatpage', { replace: true });
      reset();
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message || 'An error occurred during login'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-16">
      <form onSubmit={handleSubmit(serviceLogin)}>
        <Input
          label="Email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email',
            },
          })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}

        <div className="relative mb-4">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Minimum 6 characters required',
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
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}

        <Button
          btnName={isLoading ? 'Logging in...' : 'Login'}
          disabled={isLoading}
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
