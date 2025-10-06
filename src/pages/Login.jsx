

import React, { useState, useRef } from 'react';
import PinInput from '../components/PinInput'; // Our new component
import Button from '../components/Button';
// We'll use a cloud icon for the UI based on your image
import { CloudUpload } from 'lucide-react'; // Need to install lucide-react for icons

// NOTE: If you haven't installed it yet, run: npm install lucide-react

function Login() {
  // State to hold the 4 PIN digits
  const [pin, setPin] = useState(['', '', '', '']);
  const isPinComplete = pin.every(digit => digit !== '');

  const PinInputRefs = useRef([]); // To hold refs for focusing logic

  const focusNext = (index) => {
    if (index < pin.length - 1) {
      // Focus the next input field
      document.getElementById(`pin-${index + 1}`).focus();
    }
  };

  const focusPrev = (index) => {
    if (index > 0) {
      // Focus the previous input field
      document.getElementById(`pin-${index - 1}`).focus();
    }
  };

  const handleChange = (index, value) => {
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPinComplete) {
      const fullPin = pin.join('');
      console.log('PIN Submitted:', fullPin);
      alert(`PIN Submitted: ${fullPin}. Redirecting...`);
      // In a real app, you would validate the PIN here and redirect
    } else {
      alert('Please enter the complete 4-digit PIN.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      
      {/* Login Card Container */}
      <div className="max-w-sm w-full space-y-8 p-8 bg-white shadow-xl rounded-xl text-center">
        
        {/* Icon and Title Section */}
        <div className="space-y-4">
          <CloudUpload className="mx-auto h-12 w-12 text-red-700" />
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600">
            Enter your PIN to securely access your farm data.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="mt-8">
          <label htmlFor="pin-0" className="block text-md font-semibold text-gray-700 mb-4 uppercase tracking-wider">
            Enter PIN
          </label>
          
          {/* PIN Input Group */}
          <div className="flex justify-center space-x-3 mb-6">
            {pin.map((digit, index) => (
              <PinInput
                key={index}
                index={index}
                value={digit}
                onChange={handleChange}
                onFocusNext={focusNext}
                onFocusPrev={focusPrev}
              />
            ))}
          </div>
          
          {/* Unlock Button */}
          <Button 
            type="submit" 
            disabled={!isPinComplete}
            // Overriding the default indigo color for a custom red/brown color from your image
            className="w-full py-3 bg-red-800 hover:bg-red-900 focus:ring-red-500"
          >
            Unlock
          </Button>
          
          {/* Reset Pin Link */}
          <div className="mt-4 text-center">
            <a 
              href="#" 
              className="text-sm font-medium text-gray-500 hover:text-red-700 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 w-4 h-4">
                <path d="M17.8 7.8A7.8 7.8 0 0 0 5 12"></path>
                <path d="M5 5v5h5"></path>
                <path d="M6.2 16.2A7.8 7.8 0 0 0 19 12"></path>
                <path d="M19 19v-5h-5"></path>
              </svg>
              Reset Pin
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

// Ensure the component name exported from App.jsx matches this!
export default Login;