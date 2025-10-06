// src/components/Button.jsx

import React from 'react';

const Button = ({ children, onClick, type = 'button', disabled = false, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // Base Tailwind classes for a solid button style
      className={`
        w-full py-2 px-4 
        border border-transparent 
        rounded-md 
        shadow-sm 
        text-sm font-medium text-white 
        bg-indigo-600 
        hover:bg-indigo-700 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className} 
      `}
    >
      {children}
    </button>
  );
};

export default Button;