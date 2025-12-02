import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import rugyeyoLogo from '../assets/rugyeyo_logo.png';

// --- Coffee Theme Colors (with brown accents) ---
const CoffeeColors = {
  SCREEN_BG: '#8B4513',
  LIGHT_BG: '#8FBC8F',
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

// --- API Client ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://142.93.94.236:8000';

const ApiClient = {
  post: async (url, data) => {
    console.log('API Called:', url);
    console.log('Request Data:', data);
    console.log('Full URL:', `${API_BASE_URL}/api/users/${url}`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response Status:', response.status);

      const responseData = await response.json();
      console.log('Response Data:', responseData);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("USER_NOT_REGISTERED");
        } else if (response.status === 401) {
          throw new Error("INVALID_CREDENTIALS");
        } else if (response.status === 400) {
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
      console.error(' API Error:', error);

      if (error.message === "Failed to fetch") {
        throw new Error("Cannot connect to server. Please check your internet connection.");
      }

      throw error;
    }
  },
};

function Login() {
  const navigate = useNavigate();

  const [showLoginForm, setShowLoginForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); // Step 1: Phone, Step 2: Answer 3 questions + New PIN
  const [resetSecurityQuestions, setResetSecurityQuestions] = useState([]);
  const [resetSecurityAnswers, setResetSecurityAnswers] = useState(["", "", ""]);
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPin, setShowPin] = useState(false);

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
      const response = await ApiClient.post("login/", {
        phone: phoneNumber,
        pin: fullPin,
      });

      console.log(' Login Response:', response);

      const token = response.access || response.token || response.access_token;
      const refreshToken = response.refresh || response.refresh_token;

      // Extract user name
      const user = response.user || response;
      const userName = user.full_name ||
                      `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
                      user.name ||
                      user.username ||
                      'Unknown User';

      if (token) {
        if (rememberMe) {
          localStorage.setItem('authToken', token);
          localStorage.setItem('userPhone', phoneNumber);
          localStorage.setItem('userName', userName);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        } else {
          sessionStorage.setItem('authToken', token);
          sessionStorage.setItem('userPhone', phoneNumber);
          sessionStorage.setItem('userName', userName);
          if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
        }
      }

      setMessage("Login successful! Redirecting...");
      setMessageType("success");

      // Check if user needs to set up security questions
      const userHasSetupSecurityQuestions = response.user?.security_answers_set || response.security_answers_set;

      if (!userHasSetupSecurityQuestions) {
        console.log('User needs to set up security questions');
        setTimeout(() => {
          navigate('/security-questions', {
            state: {
              phone: phoneNumber,
              user: response.user || response,
            },
          });
        }, 800);
      } else {
        console.log('Navigating to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      }

    } catch (err) {
      console.error(' Login Error:', err.message);

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

    if (resetStep === 1) {
      // Step 1: Verify phone number and get the user's 3 security questions
      if (!/^\d{10}$/.test(phoneNumber)) {
        setMessage("Phone number must be exactly 10 digits.");
        setMessageType("error");
        return;
      }

      setLoading(true);
      try {
        const response = await ApiClient.post("user-security-questions/", {
          phone: phoneNumber,
        });

        if (response.questions && response.questions.length >= 3) {
          // Load user's specific 3 security questions
          setResetSecurityQuestions(response.questions.slice(0, 3));
          setResetSecurityAnswers(["", "", ""]);
          setResetStep(2); // Move to step 2
          setMessage("");
          setMessageType("");
        } else {
          throw new Error("Unable to load security questions for this account.");
        }
      } catch (error) {
        console.error('Reset PIN Error:', error.message);

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
    } else if (resetStep === 2) {
      // Step 2: Submit answers to 3 security questions and new PIN
      const allAnswersProvided = resetSecurityAnswers.every(a => a.trim().length > 0);
      if (!allAnswersProvided) {
        setMessage("Please answer all 3 security questions.");
        setMessageType("error");
        return;
      }

      const allAnswersValid = resetSecurityAnswers.every(a => a.trim().length >= 2);
      if (!allAnswersValid) {
        setMessage("Each answer must be at least 2 characters long.");
        setMessageType("error");
        return;
      }

      const newPinValue = newPin.join("");
      const confirmPinValue = confirmPin.join("");

      if (newPinValue.length !== 4) {
        setMessage("New PIN must be exactly 4 digits.");
        setMessageType("error");
        return;
      }

      if (confirmPinValue.length !== 4) {
        setMessage("Please confirm your PIN.");
        setMessageType("error");
        return;
      }

      if (newPinValue !== confirmPinValue) {
        setMessage("PINs do not match. Please try again.");
        setMessageType("error");
        setNewPin(["", "", "", ""]);
        setConfirmPin(["", "", "", ""]);
        return;
      }

      // Format answers for submission
      const formattedAnswers = resetSecurityQuestions.map((q, idx) => ({
        question_id: q.id,
        answer: resetSecurityAnswers[idx].trim().toLowerCase(),
      }));

      setLoading(true);
      try {
        const response = await ApiClient.post("verify-answers-reset-pin/", {
          phone: phoneNumber,
          answers: formattedAnswers,
          new_pin: newPinValue,
        });

        setMessage("PIN reset successful! You can now login with your new PIN.");
        setMessageType("success");

        setTimeout(() => {
          setIsResetMode(false);
          setPhoneNumber("");
          setResetSecurityQuestions([]);
          setResetSecurityAnswers(["", "", ""]);
          setNewPin(["", "", "", ""]);
          setConfirmPin(["", "", "", ""]);
          setResetStep(1);
          setMessage("");
          setShowLoginForm(true);
        }, 2000);
      } catch (error) {
        console.error('Reset PIN Error:', error.message);

        if (error.message.includes("incorrect") || error.message.includes("wrong")) {
          setMessage("One or more answers are incorrect. Please check and try again.");
          setMessageType("error");
          // Keep answers visible for user to correct
        } else {
          setMessage(error.message || "PIN reset failed. Please try again.");
          setMessageType("error");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Landing Page (Welcome Screen)
  if (!showLoginForm && !isResetMode) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundImage: 'url(/img/coffee%20harvest.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
      }}>
        {/* Dark overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '800px',
        }}>
          {/* Logo */}
          <div style={{
            marginBottom: '40px',
            display: 'flex',
            justifyContent: 'center',
          }}>
            <img
              src={rugyeyoLogo}
              alt="Rugyeyo Farm Logo"
              style={{
                maxWidth: '200px',
                height: 'auto',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                backgroundColor: 'transparent',
              }}
            />
          </div>

          {/* Welcome Text */}
          <h1 style={{
            fontSize: 'clamp(26px, 8vw, 58px)',
            fontWeight: '700',
            color: 'white',
            marginBottom: '20px',
            textShadow: '2px 4px 8px rgba(0, 0, 0, 0.5)',
            letterSpacing: '2px',
            lineHeight: '1.2',
            fontFamily: 'Eina03, sans-serif',
          }}>
            Welcome to<br />Rugyeyo Farm<br />Management System
          </h1>

          <p style={{
            fontSize: 'clamp(10px, 3vw, 16px)',
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: '50px',
            maxWidth: '600px',
            margin: '0 auto 50px',
            textShadow: '1px 2px 4px rgba(0, 0, 0, 0.5)',
            lineHeight: '1.6',
            fontFamily: 'Eina03, sans-serif',
            fontWeight: '400',
          }}>
            Streamline your farm operations with our comprehensive management solution
          </p>

          {/* Get Started Button */}
          <button
            onClick={() => setShowLoginForm(true)}
            style={{
              padding: '18px 48px',
              fontSize: '20px',
              fontWeight: '700',
              color: '#FFFFFF',
              background: '#8B4513',
              backdropFilter: 'blur(10px)',
              border: '2px solid #8B4513',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontFamily: 'Eina03, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px) scale(1.05)';
              e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
              e.target.style.background = '#6d3410';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
              e.target.style.background = '#8B4513';
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Reset PIN Page
  if (isResetMode) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundImage: 'url(/img/coffee%20harvest.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Dark overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }} />

        <div style={{
          position: 'relative',
          zIndex: 1,
          width: '95%',
          maxWidth: '450px',
        }}>
          {/* Glassmorphic card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '40px 35px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }}>
            {/* Logo */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '30px',
            }}>
              <img
                src={rugyeyoLogo}
                alt="Logo"
                style={{
                  width: '100px',
                  height: 'auto',
                  backgroundColor: 'transparent',
                }}
              />
            </div>

            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '10px',
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            }}>Reset Your PIN</h3>

            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              marginBottom: '30px',
            }}>
              Enter your phone number to receive reset instructions
            </p>

            <form onSubmit={handleResetPin}>
              {resetStep === 1 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    fontSize: '14px',
                    color: 'white',
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
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      padding: '0 15px',
                      fontSize: '16px',
                      color: 'white',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {resetStep === 2 && (
                <>
                  {/* Display 3 Security Questions */}
                  {resetSecurityQuestions.map((question, index) => (
                    <div key={question.id || index} style={{ marginBottom: '20px' }}>
                      <label style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: '10px',
                        display: 'block',
                        paddingRight: '20px',
                      }}>
                        <span style={{
                          background: 'rgba(139, 69, 19, 0.5)',
                          padding: '2px 8px',
                          borderRadius: '50%',
                          marginRight: '8px',
                          fontWeight: '700',
                        }}>
                          {index + 1}
                        </span>
                        {question.text}
                      </label>

                      <input
                        type="text"
                        value={resetSecurityAnswers[index]}
                        onChange={(e) => {
                          // Only allow alphanumeric characters and spaces
                          const cleaned = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                          const newAnswers = [...resetSecurityAnswers];
                          newAnswers[index] = cleaned;
                          setResetSecurityAnswers(newAnswers);
                          setMessage("");
                        }}
                        placeholder={`Your answer (min. 2 characters)`}
                        maxLength={100}
                        disabled={loading}
                        style={{
                          width: '100%',
                          height: '50px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          padding: '0 15px',
                          fontSize: '16px',
                          color: 'white',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                        }}
                        onFocus={(e) => {
                          e.target.style.border = '1px solid rgba(139, 69, 19, 0.8)';
                          e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                        }}
                        onBlur={(e) => {
                          e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        }}
                      />

                      {resetSecurityAnswers[index].length > 0 && resetSecurityAnswers[index].length < 2 && (
                        <p style={{
                          fontSize: '12px',
                          color: '#FFB74D',
                          marginTop: '6px',
                          fontWeight: '500',
                        }}>
                          ⚠ Minimum 2 characters required
                        </p>
                      )}

                      {resetSecurityAnswers[index].length >= 2 && (
                        <p style={{
                          fontSize: '12px',
                          color: '#4CAF50',
                          marginTop: '6px',
                          fontWeight: '500',
                        }}>
                          ✓ Answer looks good
                        </p>
                      )}
                    </div>
                  ))}

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      fontSize: '14px',
                      color: 'white',
                      marginBottom: '8px',
                      fontWeight: '600',
                      display: 'block',
                    }}>New PIN</label>

                    <input
                      type="password"
                      value={newPin.join("")}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                        const pinArray = value.split('');
                        while (pinArray.length < 4) pinArray.push('');
                        setNewPin(pinArray);
                        setMessage("");
                      }}
                      placeholder="••••"
                      maxLength={4}
                      disabled={loading}
                      inputMode="numeric"
                      style={{
                        width: '100%',
                        height: '50px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        padding: '0 15px',
                        fontSize: '24px',
                        color: 'white',
                        outline: 'none',
                        letterSpacing: '8px',
                        textAlign: 'center',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      fontSize: '14px',
                      color: 'white',
                      marginBottom: '8px',
                      fontWeight: '600',
                      display: 'block',
                    }}>Confirm PIN</label>

                    <input
                      type="password"
                      value={confirmPin.join("")}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                        const pinArray = value.split('');
                        while (pinArray.length < 4) pinArray.push('');
                        setConfirmPin(pinArray);
                        setMessage("");
                      }}
                      placeholder="••••"
                      maxLength={4}
                      disabled={loading}
                      inputMode="numeric"
                      style={{
                        width: '100%',
                        height: '50px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        border: `1px solid ${
                          newPin.join("") && confirmPin.join("") && newPin.join("") !== confirmPin.join("")
                            ? 'rgba(211, 47, 47, 0.5)'
                            : 'rgba(255, 255, 255, 0.3)'
                        }`,
                        padding: '0 15px',
                        fontSize: '24px',
                        color: 'white',
                        outline: 'none',
                        letterSpacing: '8px',
                        textAlign: 'center',
                      }}
                    />
                    {newPin.join("") && confirmPin.join("") && newPin.join("") !== confirmPin.join("") && (
                      <p style={{
                        fontSize: '12px',
                        color: '#FF6B6B',
                        marginTop: '6px',
                        fontWeight: '500',
                      }}>
                         PINs do not match
                      </p>
                    )}
                    {newPin.join("") === confirmPin.join("") && newPin.join("").length === 4 && (
                      <p style={{
                        fontSize: '12px',
                        color: '#4CAF50',
                        marginTop: '6px',
                        fontWeight: '500',
                      }}>
                        ✓ PINs match
                      </p>
                    )}
                  </div>
                </>
              )}

              {message && (
                <div style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  background: messageType === 'error'
                    ? 'rgba(211, 47, 47, 0.2)'
                    : 'rgba(76, 175, 80, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${messageType === 'error' ? 'rgba(211, 47, 47, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center',
                }}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (resetStep === 1 && phoneNumber.length !== 10) || (resetStep === 2 && (resetSecurityAnswers.some(a => a.trim().length < 2) || newPin.join("").length !== 4 || confirmPin.join("").length !== 4 || newPin.join("") !== confirmPin.join("")))}
                style={{
                  background: '#D2A679',
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#4A2C0F',
                  fontSize: '16px',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  cursor: loading || (resetStep === 1 && phoneNumber.length !== 10) || (resetStep === 2 && (resetSecurityAnswers.some(a => a.trim().length < 2) || newPin.join("").length !== 4 || confirmPin.join("").length !== 4 || newPin.join("") !== confirmPin.join(""))) ? 'not-allowed' : 'pointer',
                  opacity: loading || (resetStep === 1 && phoneNumber.length !== 10) || (resetStep === 2 && (resetSecurityAnswers.some(a => a.trim().length < 2) || newPin.join("").length !== 4 || confirmPin.join("").length !== 4 || newPin.join("") !== confirmPin.join(""))) ? 0.6 : 1,
                  marginBottom: '15px',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (!loading && ((resetStep === 1 && phoneNumber.length === 10) || (resetStep === 2 && resetSecurityAnswers.every(a => a.trim().length >= 2) && newPin.join("").length === 4 && confirmPin.join("").length === 4 && newPin.join("") === confirmPin.join("")))) {
                    e.target.style.background = '#C19763';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#D2A679';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {loading ? 'Processing...' : resetStep === 1 ? 'Continue' : 'Reset PIN'}
              </button>

              <div style={{ textAlign: 'center' }}>
                {resetStep === 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep(1);
                      setResetSecurityQuestions([]);
                      setResetSecurityAnswers(["", "", ""]);
                      setNewPin(["", "", "", ""]);
                      setConfirmPin(["", "", "", ""]);
                      setMessage("");
                      setMessageType("");
                    }}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      marginRight: '15px',
                    }}
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setShowLoginForm(true);
                    setPhoneNumber("");
                    setResetSecurityQuestions([]);
                    setResetSecurityAnswers(["", "", ""]);
                    setNewPin(["", "", "", ""]);
                    setConfirmPin(["", "", "", ""]);
                    setResetStep(1);
                    setMessage("");
                    setMessageType("");
                  }}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
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

  // Login Form Page
  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/img/coffee%20harvest.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '95%',
        maxWidth: '450px',
      }}>
        {/* Glassmorphic login card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '40px 35px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <img
              src={rugyeyoLogo}
              alt="Logo"
              style={{
                width: '100px',
                height: 'auto',
                backgroundColor: 'transparent',
              }}
            />
          </div>

          <h3 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '10px',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
          }}>Welcome Back</h3>

          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            marginBottom: '30px',
          }}>
            Enter your credentials to continue
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '14px',
                color: 'white',
                marginBottom: '8px',
                fontWeight: '400',
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
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '0 15px',
                  fontSize: '16px',
                  color: 'white',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '14px',
                color: 'white',
                marginBottom: '8px',
                fontWeight: '400',
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
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '0 45px 0 15px',
                    fontSize: '24px',
                    color: 'white',
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
                color: 'white',
                cursor: 'pointer',
                fontWeight: '400',
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
                background: messageType === 'error'
                  ? 'rgba(211, 47, 47, 0.2)'
                  : 'rgba(76, 175, 80, 0.2)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${messageType === 'error' ? 'rgba(211, 47, 47, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
                color: 'white',
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
                background: '#8B4513',
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                cursor: loading || pin.join("").length !== 4 || phoneNumber.length !== 10 ? 'not-allowed' : 'pointer',
                opacity: loading || pin.join("").length !== 4 || phoneNumber.length !== 10 ? 0.6 : 1,
                marginBottom: '15px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading && pin.join("").length === 4 && phoneNumber.length === 10) {
                  e.target.style.background = '#6d3410';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#8B4513';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Processing...' : 'Login'}
            </button>

            <div style={{
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowLoginForm(false);
                  setMessage("");
                  setMessageType("");
                  setPin(["", "", "", ""]);
                  setPhoneNumber("");
                }}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '400',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#D2A679';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'white';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ← Back
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
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '400',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#D2A679';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'white';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Reset PIN
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
