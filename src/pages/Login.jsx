import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx'; 
import Input from '../components/Input.jsx'; 
import { CloudUpload } from 'lucide-react'; // Example icon import

// Define custom colors (or ensure they are imported if defined elsewhere)
const CUSTOM_COLORS = {
    cardBg: '#FFFFFF',
    actionBg: '#702A0B', 
    inputBg: '#F5F5F5',
};


function Login() {
    const navigate = useNavigate(); 
    
    // *** ENSURE THESE STATE VARIABLES ARE DEFINED ***
    const [pin, setPin] = useState(['', '', '', '']);
    const isPinComplete = pin.every(digit => digit.length === 1); 

    // Define the rest of your handler functions (like handleChange for pins)
    // ...

    const handleSubmit = (e) => {
        e.preventDefault();

        const isLoginSuccessful = true;
        if (isLoginSuccessful) {
            navigate('/wages');
        }else {
            alert('Login failed. Please try again.');
        } 
        
        if (isPinComplete) {
            const fullPin = pin.join('');
            
            // Redirect logic (This looks correct)
            if (fullPin === "1234") { 
                navigate('/wages'); 
            } else {
                // DO NOT USE alert(), it breaks the iFrame experience. Use a custom message state.
                console.error('Incorrect PIN.');
                setPin(['', '', '', '']); 
                document.getElementById('pin-0').focus(); 
            }
            
        } else {
             // DO NOT USE alert()
             console.warn('Please enter the complete 4-digit PIN.');
        }
    };
    
    // *** ENSURE THIS RETURN BLOCK IS COMPLETE ***
    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAF7F1' }}>
            <div 
                className="w-full max-w-sm p-8 shadow-xl rounded-2xl text-center"
                style={{ backgroundColor: CUSTOM_COLORS.cardBg }}
            >
                <CloudUpload className="mx-auto h-12 w-12" style={{ color: CUSTOM_COLORS.actionBg }} />
                <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                    Welcome Back
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                    Enter your PIN to securely access your farm data.
                </p>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <label className="block text-lg font-medium text-gray-700 uppercase">
                        Enter Pin
                    </label>
                    <div className="flex justify-center space-x-3">
                        {/* PIN Inputs (Ensure these are rendered correctly) */}
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                id={`pin-${index}`}
                                type="password" // Use password type to hide PIN
                                maxLength="1"
                                value={digit}
                                onChange={(e) => {
                                    const newPin = [...pin];
                                    newPin[index] = e.target.value;
                                    setPin(newPin);
                                    
                                    // Auto-focus next input
                                    if (e.target.value && index < 3) {
                                        document.getElementById(`pin-${index + 1}`)?.focus();
                                    }
                                }}
                                className="w-12 h-12 text-center text-xl font-bold rounded-lg border-2"
                                style={{ borderColor: CUSTOM_COLORS.actionBg, backgroundColor: CUSTOM_COLORS.inputBg }}
                            />
                        ))}
                    </div>
                    
                    <Button
                        type="submit"
                        disabled={!isPinComplete}
                        className="py-3 font-semibold"
                        style={{ backgroundColor: CUSTOM_COLORS.actionBg, opacity: isPinComplete ? 1 : 0.6 }}
                    >
                        Unlock
                    </Button>
                </form>

                {/* Reset Pin Link */}
                <div className="mt-4">
                    <button 
                        className="text-sm font-medium hover:text-gray-700" 
                        style={{ color: CUSTOM_COLORS.actionBg }}
                        onClick={() => {
                            setPin(['', '', '', '']);
                            document.getElementById('pin-0').focus();
                        }}
                    >
                        ↻ Reset Pin
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;
