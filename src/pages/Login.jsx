import React, { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';

// --- Coffee Theme Colors (with brown accents) ---
const CoffeeColors = {
  SCREEN_BG: '#8B4513', // Brown background
  LIGHT_BG: '#8FBC8F', // Light green
  DARK_BROWN: '#4A3423',
  BUTTON_BROWN: '#8B4513',
  MEDIUM_BROWN: '#795548',
  LIGHT_BROWN: '#BCAAA4',
  WHITE: '#FFFFFF',
  GRAY_TEXT: '#666666',
  LIGHT_GRAY_BG: '#f0ead6',
  ERROR_RED: '#D32F2F',
  SUCCESS_GREEN: '#4CAF50',
  PALE_GREEN: '#E8F5E9',
};

// --- API Client - Connected to your Django backend ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-3181.onrender.com';

const ApiClient = {
  post: async (url, data) => {
    console.log('🔵 API Called:', url);
    console.log('📤 Request Data:', data);
    console.log('🌐 Full URL:', `${API_BASE_URL}/api/users/${url}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${url}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📥 Response Status:', response.status);
      
      const responseData = await response.json();
      console.log('📥 Response Data:', responseData);

      if (!response.ok) {
        // Handle different error cases based on Django response
        if (response.status === 404) {
          throw new Error("USER_NOT_REGISTERED");
        } else if (response.status === 401) {
          throw new Error("INVALID_CREDENTIALS");
        } else if (response.status === 400) {
          // Django validation errors
          const errorMsg = responseData.detail 
            || responseData.error 
            || responseData.non_field_errors?.[0]
            || responseData.pin?.[0]
            || responseData.phone?.[0]
            || "Invalid input";
          throw new Error(errorMsg);
        } else {
          throw new Error(responseData.detail || responseData.error || "Login failed");
        }
      }

      return responseData;

    } catch (error) {
      console.error('❌ API Error:', error);
      
      // Handle network errors
      if (error.message === "Failed to fetch") {
        throw new Error("Cannot connect to server. Please check your internet connection.");
      }
      
      throw error;
    }
  },
};

function Login() {
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const pinRefs = useRef([]);

  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [focusedField, setFocusedField] = useState({ row: null, idx: null });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handlePinChange = (value, index) => {
    setMessage("");
    setMessageType("");

    const newVal = value.replace(/[^0-9]/g, "").slice(-1);
    const updated = [...pin];
    updated[index] = newVal;
    setPin(updated);

    setFocusedField({ row: 'pin', idx: index });

    if (newVal && index < 3) pinRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    const fullPin = pin.join("");

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Phone:', phoneNumber);
    console.log('PIN:', fullPin);

    if (!/^\d{10}$/.test(phoneNumber)) {
      setMessage("Phone number must be exactly 10 digits.");
      setMessageType("error");
      return;
    }
    if (fullPin.length !== 4) {
      setMessage("PIN must be 4 digits.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('📱 Phone:', phoneNumber);
      console.log('🔐 PIN Length:', fullPin.length);
      
      const response = await ApiClient.post("login/", {
        phone: phoneNumber,  // Changed from phone_number to phone
        pin: fullPin,
      });
      
      console.log('✅ Login Response:', response);

      // Store token and user data based on your API response structure
      const token = response.access || response.token || response.access_token;
      const refreshToken = response.refresh || response.refresh_token;
      
      if (token) {
        if (rememberMe) {
          localStorage.setItem('authToken', token);
          localStorage.setItem('userPhone', phoneNumber);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        } else {
          sessionStorage.setItem('authToken', token);
          sessionStorage.setItem('userPhone', phoneNumber);
          if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
        }
      }

      setMessage("Login successful! Redirecting...");
      setMessageType("success");
      
      setTimeout(() => {
        console.log('🚀 Navigating to dashboard...');
        navigate('/dashboard');
      }, 800);

    } catch (err) {
      console.error('❌ Login Error:', err.message);
      
      if (err.message === "USER_NOT_REGISTERED") {
        setMessage("This phone number is not registered. Please contact support to register.");
        setMessageType("error");
      } else if (err.message === "INVALID_CREDENTIALS") {
        setMessage("Invalid phone number or PIN. Please check your credentials and try again.");
        setMessageType("error");
      } else if (err.message.includes("Cannot connect to server")) {
        setMessage("Cannot connect to server. Please check your internet connection.");
        setMessageType("error");
      } else if (err.message.includes("PIN must be")) {
        setMessage(err.message);
        setMessageType("error");
      } else {
        setMessage(err.message || "Login failed. Please try again.");
        setMessageType("error");
      }
      
      setPin(["", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!/^\d{10}$/.test(phoneNumber)) {
      setMessage("Phone number must be exactly 10 digits.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const response = await ApiClient.post("security-question/", {
        phone: phoneNumber,  // Changed from phone_number to phone
      });

      if (response.security_question) {
        setMessage(`Security Question: ${response.security_question}. Check your SMS for instructions.`);
        setMessageType("success");
      } else {
        setMessage("Phone number verified! Check your SMS for reset instructions.");
        setMessageType("success");
      }
      
      setTimeout(() => {
        setIsResetMode(false);
        setPhoneNumber("");
        setMessage("");
        setMessageType("");
      }, 3000);

    } catch (error) {
      console.error('❌ Reset PIN Error:', error.message);
      
      if (error.message === "USER_NOT_REGISTERED" || error.message.includes("not found")) {
        setMessage("Phone number not found in our system. Please contact support.");
        setMessageType("error");
      } else if (error.message.includes("Cannot connect to server")) {
        setMessage("Cannot connect to server. Please check your internet connection.");
        setMessageType("error");
      } else {
        setMessage(error.message || "Reset failed. Please try again.");
        setMessageType("error");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPinBoxBorderColor = (idx) => {
    const isFocused = focusedField.row === 'pin' && focusedField.idx === idx;
    const isError = messageType === 'error' && pin.join('').length === 4;

    if (isFocused) return CoffeeColors.BUTTON_BROWN;
    if (isError) return CoffeeColors.ERROR_RED;
    return '#D0D0D0';
  };

  if (isResetMode) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: CoffeeColors.SCREEN_BG,
        backgroundImage: 'url(/path-to-your-background-image.jpg)', // Add your background image path
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Optional overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(139, 69, 19, 0.85)',
        }} />

        <div style={{ 
          position: 'relative',
          zIndex: 1,
          width: '95%', 
          maxWidth: '450px',
        }}>
          {/* Left side content */}
          <div style={{
            marginBottom: '40px',
            color: CoffeeColors.WHITE,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
            }}>
              <img src="/logo.jpg" alt="Logo" style={{ width: '50px', height: '50px', marginRight: '12px' }} />
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                margin: 0,
              }}>Rugyeyo Farm</h1>
            </div>

            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              marginBottom: '15px',
              lineHeight: '1.2',
            }}>Reset Your PIN</h2>

            <p style={{
              fontSize: '16px',
              opacity: 0.9,
              marginBottom: '20px',
            }}>
              Not currently registered?<br />
              We'd love for you to join us.
            </p>

          </div>

          {/* Right side - Reset form */}
          <div style={{
            backgroundColor: CoffeeColors.WHITE,
            borderRadius: '20px',
            padding: '40px 35px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: CoffeeColors.DARK_BROWN,
              marginBottom: '10px',
            }}>Reset your PIN</h3>

            <form onSubmit={handleResetPin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '14px',
                  color: CoffeeColors.DARK_BROWN,
                  marginBottom: '8px',
                  fontWeight: '600',
                  display: 'block',
                }}>Phone Number</label>
                
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const cleanText = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    setPhoneNumber(cleanText);
                    setMessage("");
                  }}
                  placeholder="0700000000"
                  maxLength={10}
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '50px',
                    backgroundColor: CoffeeColors.LIGHT_GRAY_BG,
                    borderRadius: '10px',
                    border: 'none',
                    padding: '0 15px',
                    fontSize: '16px',
                    color: CoffeeColors.DARK_BROWN,
                    outline: 'none',
                  }}
                />
              </div>

              {message && (
                <div style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  backgroundColor: messageType === 'error' ? '#FFE5E5' : CoffeeColors.PALE_GREEN,
                  color: messageType === 'error' ? CoffeeColors.ERROR_RED : CoffeeColors.SUCCESS_GREEN,
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center',
                }}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                style={{
                  backgroundColor: CoffeeColors.BUTTON_BROWN,
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  color: CoffeeColors.DARK_BROWN,
                  fontSize: '16px',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  cursor: loading || phoneNumber.length !== 10 ? 'not-allowed' : 'pointer',
                  opacity: loading || phoneNumber.length !== 10 ? 0.6 : 1,
                  marginBottom: '15px',
                  textTransform: 'uppercase',
                }}
              >
                {loading ? 'Processing...' : 'Continue'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setPhoneNumber("");
                    setMessage("");
                    setMessageType("");
                  }}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: CoffeeColors.DARK_BROWN,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: CoffeeColors.SCREEN_BG,
      backgroundImage: 'url(/path-to-your-background-image.jpg)', // Add your background image path here
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Overlay for better text readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(139, 69, 19, 0.85)', // Semi-transparent brown overlay
      }} />

      <div style={{ 
        position: 'relative',
        zIndex: 1,
        width: '95%', 
        maxWidth: '1000px',
        display: 'flex',
        gap: '40px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Left side content */}
        <div style={{
          flex: '1',
          minWidth: '300px',
          color: CoffeeColors.WHITE,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '30px',
          }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '50px', height: '50px', marginRight: '12px' }} />
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: 0,
            }}>Rugyeyo Farm</h1>
          </div>

          <h2 style={{
            fontSize: '42px',
            fontWeight: '700',
            marginBottom: '15px',
            lineHeight: '1.2',
          }}>Welcome Back,<br />Administrator!</h2>

          <p style={{
            fontSize: '16px',
            opacity: 0.9,
            marginBottom: '25px',
          }}>
            Not currently a registered user?<br />
            We'd love for you to join us.
          </p>

        </div>

        {/* Right side - Login form */}
        <div style={{
          flex: '0 0 420px',
          backgroundColor: CoffeeColors.WHITE,
          borderRadius: '20px',
          padding: '40px 35px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: CoffeeColors.DARK_BROWN,
            marginBottom: '10px',
          }}>Enter Your Phone Number and Pin to Login</h3>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '14px',
                color: CoffeeColors.DARK_BROWN,
                marginBottom: '8px',
                fontWeight: '600',
                display: 'block',
              }}>Phone Number</label>
              
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const cleanText = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                  setPhoneNumber(cleanText);
                  setMessage("");
                }}
                placeholder="0700000000"
                maxLength={10}
                disabled={loading}
                onFocus={() => setFocusedField({ row: 'phone', idx: -1 })}
                onBlur={() => setFocusedField({ row: null, idx: null })}
                style={{
                  width: '100%',
                  height: '50px',
                  backgroundColor: CoffeeColors.LIGHT_GRAY_BG,
                  borderRadius: '10px',
                  border: 'none',
                  padding: '0 15px',
                  fontSize: '16px',
                  color: CoffeeColors.DARK_BROWN,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '14px',
                color: CoffeeColors.DARK_BROWN,
                marginBottom: '8px',
                fontWeight: '600',
                display: 'block',
              }}>PIN</label>
              
              <div style={{ position: 'relative' }}>
                <input
                  type={showPin ? "text" : "password"}
                  value={pin.join("")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    const newPin = value.split('');
                    while (newPin.length < 4) newPin.push('');
                    setPin(newPin);
                    setMessage("");
                  }}
                  placeholder="••••"
                  maxLength={4}
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '50px',
                    backgroundColor: CoffeeColors.LIGHT_GRAY_BG,
                    borderRadius: '10px',
                    border: 'none',
                    padding: '0 45px 0 15px',
                    fontSize: '24px',
                    color: CoffeeColors.DARK_BROWN,
                    outline: 'none',
                    letterSpacing: '8px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                  }}
                >
                  {showPin ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: CoffeeColors.DARK_BROWN,
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                Remember me
              </label>
            </div>

            {message && (
              <div style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '20px',
                backgroundColor: messageType === 'error' ? '#FFE5E5' : CoffeeColors.PALE_GREEN,
                color: messageType === 'error' ? CoffeeColors.ERROR_RED : CoffeeColors.SUCCESS_GREEN,
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'center',
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pin.join("").length !== 4 || phoneNumber.length !== 10}
              style={{
                backgroundColor: CoffeeColors.BUTTON_BROWN,
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                color: CoffeeColors.DARK_BROWN,
                fontSize: '16px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                cursor: loading || pin.join("").length !== 4 || phoneNumber.length !== 10 ? 'not-allowed' : 'pointer',
                opacity: loading || pin.join("").length !== 4 || phoneNumber.length !== 10 ? 0.6 : 1,
                marginBottom: '15px',
                textTransform: 'uppercase',
              }}
            >
              {loading ? 'Processing...' : 'Login'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(true);
                  setMessage("");
                  setMessageType("");
                  setPin(["", "", "", ""]);
                  setPhoneNumber("");
                }}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: CoffeeColors.DARK_BROWN,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Reset Pin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;