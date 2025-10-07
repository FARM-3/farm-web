// src/components/Button.jsx (UPDATE)

import React from 'react';

const Button = ({ children, onClick, type = 'button', disabled = false, className = '', style = {} }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // REMOVE BG-INDIGO-600 HERE. It will be set by the inline 'style' prop in WageEntry.jsx
      className={`
        w-full py-2 px-4 
        border border-transparent 
        rounded-md 
        shadow-sm 
        text-sm font-medium text-white 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={style} // Pass the style prop for background color
    >
      {children}
    </button>
  );
};

export default Button;