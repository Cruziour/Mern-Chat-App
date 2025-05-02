import React from 'react';

const Toast = ({ message, type }) => {
  return (
    <div
      className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50
      ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}
    `}
    >
      {message}
    </div>
  );
};

export default Toast;
