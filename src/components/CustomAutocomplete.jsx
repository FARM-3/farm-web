import React, { useState, useRef, useEffect } from 'react';

const CustomAutocomplete = ({
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  style = {},
  className = '',
  onFocus,
  onBlur,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
    // When value is cleared, reset filtered options to show all available options
    if (!value || value === '') {
      setFilteredOptions(options);
    }
  }, [value, options]);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Filter options based on input
    const filtered = options.filter((option) =>
      option.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredOptions(filtered);
    setShowDropdown(true);
  };

  const handleSelectOption = (option) => {
    setInputValue(option);
    setShowDropdown(false);
    
    // Trigger onChange with the selected value
    if (onChange) {
      onChange({ target: { value: option } });
    }
  };

  const handleInputFocus = (e) => {
    setShowDropdown(true);
    if (onFocus) onFocus(e);
  };

  const handleInputBlur = (e) => {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      if (onBlur) onBlur(e);
    }, 200);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={disabled ? placeholder : placeholder}
        disabled={disabled}
        className={className}
        style={{
          ...style,
          width: '100%',
          backgroundColor: disabled ? '#F3F4F6' : '#FFFFFF',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
      
      {showDropdown && !disabled && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D1D5DB',
            borderRadius: '4px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            marginTop: '4px',
          }}
        >
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelectOption(option)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: index < filteredOptions.length - 1 ? '1px solid #F3F4F6' : 'none',
                fontSize: '14px',
                color: '#374151',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#FFFFFF';
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
      
      {showDropdown && !disabled && filteredOptions.length === 0 && inputValue && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            border: '1px solid #D1D5DB',
            borderRadius: '4px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            marginTop: '4px',
            padding: '10px 12px',
            fontSize: '14px',
            color: '#6B7280',
            fontStyle: 'italic',
          }}
        >
          No results found
        </div>
      )}
    </div>
  );
};

export default CustomAutocomplete;
