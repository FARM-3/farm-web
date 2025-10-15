import React, { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';

// --- Coffee Theme Colors ---
const CoffeeColors = {
  SCREEN_BG: '#FFF8F6',
  LIGHT_BG: '#FEEFEA',
  DARK_BROWN: '#4A3423',
  BUTTON_BROWN: '#8B4513',
  MEDIUM_BROWN: '#795548',
  LIGHT_BROWN: '#BCAAA4',
  WHITE: '#FFFFFF',
  GRAY_TEXT: '#8D8D8D',
  ERROR_RED: '#D32F2F',
  SUCCESS_GREEN: '#4CAF50',
};

// --- Mock API Client ---
const ApiClient = {
  post: async (url, data) => {
    console.log('API Called:', url, 'Data:', data);
    await new Promise((r) => setTimeout(r, 800));

    if (url === "login/") {
      console.log('Login attempt - Phone:', data.phone_number, 'PIN:', data.pin);
      if (data.phone_number.length === 10 && data.pin.length === 4) {
        console.log('Login SUCCESS');
        return { status: 200, data: { success: true, token: "mock-token" } };
      } else {
        console.log('Login FAILED - Invalid format');
        throw new Error("Invalid credentials");
      }
    }

    if (url === "reset-pin/") {
      if (data.phone_number.length === 10) {
        return { status: 200, data: { success: true, message: "Phone verified" } };
      } else {
        throw new Error("Phone number not found");
      }
    }

    return { status: 500, data: { success: false, message: "Internal Server Error" } };
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
      console.log('Calling API...');
      const response = await ApiClient.post("login/", {
        phone_number: phoneNumber,
        pin: fullPin,
      });
      console.log('API Response:', response);

      setMessage("Login successful! Redirecting...");
      setMessageType("success");
      
      setTimeout(() => {
        console.log('Navigating to sales-entry...');
        navigate('/sales-entry');
      }, 800);

    } catch (err) {
      console.log('Login Error:', err.message);
      setMessage("Invalid credentials. Please check your phone number and PIN.");
      setMessageType("error");
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
      await ApiClient.post("reset-pin/", {
        phone_number: phoneNumber,
      });

      setMessage("Phone number verified! Check your SMS for security question.");
      setMessageType("success");
      
      setTimeout(() => {
        setIsResetMode(false);
        setPhoneNumber("");
        setMessage("");
        setMessageType("");
      }, 2000);

    } catch (error) {
      setMessage("Phone number not found in our system.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const getPinBoxBorderColor = (idx) => {
    const isFocused = focusedField.row === 'pin' && focusedField.idx === idx;
    const isError = messageType === 'error' && pin.join('').length === 4;

    if (isFocused) return CoffeeColors.BUTTON_BROWN;
    if (isError) return CoffeeColors.ERROR_RED;
    return CoffeeColors.LIGHT_BROWN;
  };

  const renderPinInput = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', marginTop: '2px', width: '100%', paddingLeft: '10px', paddingRight: '10px' }}>
      {pin.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (pinRefs.current[index] = el)}
          type="password"
          value={digit}
          onChange={(e) => handlePinChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          maxLength={1}
          disabled={loading}
          onFocus={() => setFocusedField({ row: 'pin', idx: index })}
          onBlur={() => setFocusedField({ row: null, idx: null })}
          style={{
            width: '55px',
            height: '65px',
            backgroundColor: CoffeeColors.WHITE,
            borderRadius: '12px',
            border: `2px solid ${getPinBoxBorderColor(index)}`,
            fontSize: '26px',
            fontWeight: 'bold',
            color: CoffeeColors.DARK_BROWN,
            textAlign: 'center',
            outline: 'none',
          }}
        />
      ))}
    </div>
  );

  if (isResetMode) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: CoffeeColors.SCREEN_BG, 
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ width: '95%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{
            backgroundColor: CoffeeColors.LIGHT_BG,
            borderRadius: '50px',
            width: '65px',
            height: '65px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto 25px',
            border: `1px solid ${CoffeeColors.LIGHT_BROWN}`,
            opacity: 0.85,
          }}>
            <span style={{ fontSize: '32px' }}>🔑</span>
          </div>

          <h2 style={{
            fontSize: '26px',
            fontWeight: '900',
            color: CoffeeColors.DARK_BROWN,
            marginBottom: '6px',
          }}>Reset PIN</h2>

          <div style={{
            width: '100%',
            padding: '20px',
            backgroundColor: CoffeeColors.WHITE,
            borderRadius: '20px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          }}>
            <p style={{
              fontSize: '14px',
              color: CoffeeColors.GRAY_TEXT,
              textAlign: 'center',
              marginBottom: '25px',
              lineHeight: '20px',
              maxWidth: '300px',
              margin: '0 auto 25px',
            }}>
              Enter your phone number to retrieve your security question.
            </p>

            <form onSubmit={handleResetPin}>
              <label style={{
                fontSize: '15px',
                color: CoffeeColors.DARK_BROWN,
                marginBottom: '10px',
                fontWeight: '600',
                display: 'block',
                textAlign: 'left',
                marginTop: '15px',
              }}>Phone Number</label>
              
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const cleanText = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                  setPhoneNumber(cleanText);
                  setMessage("");
                }}
                placeholder="Enter phone number"
                maxLength={10}
                disabled={loading}
                style={{
                  width: '100%',
                  height: '50px',
                  backgroundColor: CoffeeColors.WHITE,
                  borderRadius: '12px',
                  border: `1px solid ${CoffeeColors.LIGHT_BROWN}`,
                  padding: '0 15px',
                  fontSize: '16px',
                  color: CoffeeColors.DARK_BROWN,
                  marginBottom: '10px',
                  outline: 'none',
                }}
              />

              {message && (
                <div style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  minHeight: '40px',
                  border: '1px solid',
                  backgroundColor: messageType === 'error' ? '#FFE5E5' : '#E6FFE6',
                  borderColor: messageType === 'error' ? CoffeeColors.ERROR_RED : CoffeeColors.SUCCESS_GREEN,
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
                  padding: '18px',
                  borderRadius: '15px',
                  border: 'none',
                  color: CoffeeColors.WHITE,
                  fontSize: '18px',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  cursor: loading || phoneNumber.length !== 10 ? 'not-allowed' : 'pointer',
                  opacity: loading || phoneNumber.length !== 10 ? 0.7 : 1,
                  marginBottom: '18px',
                }}
              >
                {loading ? 'Processing...' : 'Continue'}
              </button>

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
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '6px',
                }}
              >
                Back to Login
              </button>
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
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ width: '95%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{
          backgroundColor: CoffeeColors.LIGHT_BG,
          borderRadius: '50px',
          width: '65px',
          height: '65px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto 25px',
          border: `1px solid ${CoffeeColors.LIGHT_BROWN}`,
          opacity: 0.85,
        }}>
          <span style={{ fontSize: '32px' }}>🔒</span>
        </div>

        <h2 style={{
          fontSize: '26px',
          fontWeight: '900',
          color: CoffeeColors.DARK_BROWN,
          marginBottom: '6px',
        }}>Welcome Back</h2>

        <div style={{
          width: '100%',
          padding: '20px',
          backgroundColor: CoffeeColors.WHITE,
          borderRadius: '20px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        }}>
          <p style={{
            fontSize: '14px',
            color: CoffeeColors.GRAY_TEXT,
            textAlign: 'center',
            marginBottom: '25px',
            lineHeight: '20px',
            maxWidth: '300px',
            margin: '0 auto 25px',
          }}>
            Enter your phone number and PIN to securely access your data.
          </p>

          <form onSubmit={handleLogin}>
            <label style={{
              fontSize: '15px',
              color: CoffeeColors.DARK_BROWN,
              marginBottom: '10px',
              fontWeight: '600',
              display: 'block',
              textAlign: 'left',
              marginTop: '15px',
            }}>Phone Number</label>
            
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                const cleanText = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                setPhoneNumber(cleanText);
                setMessage("");
              }}
              placeholder="Enter phone number"
              maxLength={10}
              disabled={loading}
              onFocus={() => setFocusedField({ row: 'phone', idx: -1 })}
              onBlur={() => setFocusedField({ row: null, idx: null })}
              style={{
                width: '100%',
                height: '50px',
                backgroundColor: CoffeeColors.WHITE,
                borderRadius: '12px',
                border: `1px solid ${focusedField.row === 'phone' ? CoffeeColors.BUTTON_BROWN : CoffeeColors.LIGHT_BROWN}`,
                padding: '0 15px',
                fontSize: '16px',
                color: CoffeeColors.DARK_BROWN,
                marginBottom: '10px',
                outline: 'none',
              }}
            />

            <label style={{
              fontSize: '15px',
              color: CoffeeColors.DARK_BROWN,
              marginBottom: '10px',
              fontWeight: '600',
              display: 'block',
              textAlign: 'left',
              marginTop: '15px',
            }}>PIN</label>
            
            {renderPinInput()}

            {message && (
              <div style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px',
                minHeight: '40px',
                border: '1px solid',
                backgroundColor: messageType === 'error' ? '#FFE5E5' : '#E6FFE6',
                borderColor: messageType === 'error' ? CoffeeColors.ERROR_RED : CoffeeColors.SUCCESS_GREEN,
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
                padding: '18px',
                borderRadius: '15px',
                border: 'none',
                color: CoffeeColors.WHITE,
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                cursor: loading || pin.join("").length !== 4 || phoneNumber.length !== 10 ? 'not-allowed' : 'pointer',
                opacity: loading || pin.join("").length !== 4 || phoneNumber.length !== 10 ? 0.7 : 1,
                marginBottom: '18px',
              }}
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>

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
                color: CoffeeColors.BUTTON_BROWN,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '6px',
              }}
            >
              Reset PIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Export statement at the bottom
export default Login;
