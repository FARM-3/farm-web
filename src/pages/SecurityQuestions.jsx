import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import rugyeyoLogo from '../assets/rugyeyo_logo.png';

// --- API Client ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ApiClient = {
  post: async (url, data, token = null) => {
    console.log('API Called:', url);
    console.log('Request Data:', data);
    console.log('Full URL:', `${API_BASE_URL}/api/users/${url}`);

    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      console.log('Response Status:', response.status);

      const responseData = await response.json();
      console.log('Response Data:', responseData);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("QUESTIONS_NOT_FOUND");
        } else if (response.status === 401) {
          throw new Error("UNAUTHORIZED");
        } else if (response.status === 400) {
          const errorMsg = responseData.detail
            || responseData.error
            || responseData.non_field_errors?.[0]
            || responseData.answers?.[0]
            || "Invalid input";
          throw new Error(errorMsg);
        } else {
          throw new Error(responseData.detail || responseData.error || "Request failed");
        }
      }

      return responseData;

    } catch (error) {
      console.error('API Error:', error);

      if (error.message === "Failed to fetch") {
        throw new Error("Cannot connect to server. Please check your internet connection.");
      }

      throw error;
    }
  },
};

function SecurityQuestions() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get phone and user from login state
  const { phone, user } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [token] = useState(() =>
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  );

  // Load security questions on component mount
  useEffect(() => {
    loadSecurityQuestions();
  }, []);

  const loadSecurityQuestions = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      if (!phone) {
        throw new Error("Phone number not provided");
      }

      const response = await ApiClient.post(
        "random-security-questions/",
        { phone },
        token
      );

      if (!response.questions || response.questions.length < 3) {
        throw new Error("Failed to load questions - no questions in response");
      }

      // Store only first 3 questions
      setQuestions(response.questions.slice(0, 3));
      setAnswers(["", "", ""]);

    } catch (error) {
      console.error('Load Questions Error:', error.message);
      setMessage(error.message || "Failed to load security questions. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    // Only allow alphanumeric characters and spaces
    const cleaned = value.replace(/[^a-zA-Z0-9\s]/g, '');

    const newAnswers = [...answers];
    newAnswers[index] = cleaned;
    setAnswers(newAnswers);

    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    // Validation
    const allFilled = answers.every(a => a.trim().length > 0);
    if (!allFilled) {
      setMessage("Please answer all 3 questions before proceeding.");
      setMessageType("error");
      return;
    }

    const allLongEnough = answers.every(a => a.trim().length >= 2);
    if (!allLongEnough) {
      setMessage("Each answer must be at least 2 characters long.");
      setMessageType("error");
      return;
    }

    // Format answers for submission
    const formattedAnswers = questions.map((q, idx) => ({
      question_id: q.id,
      answer: answers[idx].trim().toLowerCase(),
    }));

    setSubmitting(true);
    try {
      const response = await ApiClient.post(
        "setup-security-answers/",
        {
          phone,
          answers: formattedAnswers,
        },
        token
      );

      setMessage("Security questions set up successfully!");
      setMessageType("success");

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Setup Answers Error:', error.message);
      setMessage(error.message || "Failed to save security answers. Please try again.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
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
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '18px',
            color: 'white',
            marginBottom: '20px',
            fontWeight: '600',
          }}>
            Loading security questions...
          </div>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Error loading questions - show retry
  if (!questions || questions.length === 0) {
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
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '40px 35px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
            }}>
              ⚠️
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '15px',
            }}>
              Unable to Load Questions
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '30px',
            }}>
              {message || "We couldn't load security questions. Please try again."}
            </p>

            <button
              onClick={loadSecurityQuestions}
              disabled={loading}
              style={{
                background: '#8B4513',
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                marginBottom: '15px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#6d3410';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#8B4513';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Try Again
            </button>

            <button
              onClick={() => navigate('/')}
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
        </div>
      </div>
    );
  }

  // Main security questions form
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
        maxWidth: '550px',
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

          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '10px',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
          }}>
            Security Questions
          </h2>

          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            marginBottom: '30px',
          }}>
            Answer these 3 questions to secure your account. You'll use these to reset your PIN if needed.
          </p>

          <form onSubmit={handleSubmit}>
            {questions.map((question, index) => (
              <div key={question.id || index} style={{ marginBottom: '25px' }}>
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
                  value={answers[index]}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={`Your answer (min. 2 characters)`}
                  maxLength={100}
                  disabled={submitting}
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

                {answers[index].length > 0 && answers[index].length < 2 && (
                  <p style={{
                    fontSize: '12px',
                    color: '#FFB74D',
                    marginTop: '6px',
                    fontWeight: '500',
                  }}>
                    ⚠ Minimum 2 characters required
                  </p>
                )}

                {answers[index].length >= 2 && (
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
              disabled={submitting || answers.some(a => a.trim().length < 2)}
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
                cursor: submitting || answers.some(a => a.trim().length < 2) ? 'not-allowed' : 'pointer',
                opacity: submitting || answers.some(a => a.trim().length < 2) ? 0.6 : 1,
                marginBottom: '15px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!submitting && answers.every(a => a.trim().length >= 2)) {
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
              {submitting ? 'Setting up...' : 'Complete Setup'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                disabled={submitting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
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
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SecurityQuestions;
