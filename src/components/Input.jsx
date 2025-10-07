
import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  style = {} // Added style prop for custom colors
}) => {
  return (
    <div className="w-full">
      {/* Label is intentionally left out here because we handle it directly in WageEntry.jsx 
          to apply the custom brown/cream colors easily.
      */}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        // Tailwind classes for base styling:
        className={`
          w-full px-3 py-2 
          border border-gray-300 rounded-md 
          focus:outline-none 
          focus:ring-2 focus:ring-amber-500 focus:border-amber-500
          text-sm
          ${className}
        `}
        style={style}
      />
    </div>
  );
};

export default Input;