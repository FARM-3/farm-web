// src/components/PinInput.jsx (A component for one box)

import React, { useRef, useEffect } from 'react';

// PinInput handles one single input box
const PinInput = ({ index, value, onChange, onFocusNext, onFocusPrev }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    // This effect ensures the input is focused when needed by the parent
    if (value === '' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [value]);

  const handleKeyDown = (e) => {
    // If Backspace is pressed and the box is empty, focus the previous box
    if (e.key === 'Backspace' && value === '') {
      onFocusPrev(index);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value.slice(-1); // Only allow one character

    if (newValue && /^[0-9]$/.test(newValue)) {
      onChange(index, newValue);
      onFocusNext(index);
    } else if (newValue === '') {
      onChange(index, ''); // Allow clearing the field
    }
  };

  return (
    <input
      ref={inputRef}
      id={`pin-${index}`}
      type="number" // Use number to bring up the numeric keyboard on mobile
      maxLength="1"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="
        w-14 h-14 text-center text-xl 
        font-bold text-gray-800 
        border-2 border-gray-300 rounded-lg 
        shadow-sm transition-all duration-150
        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 
        outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:hidden 
        [&::-webkit-outer-spin-button]:hidden
      "
      // Added classes to remove default number input arrows
    />
  );
};

export default PinInput;