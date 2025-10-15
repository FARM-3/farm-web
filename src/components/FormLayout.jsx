// src/components/FormCardLayout.jsx
import React from 'react';

const FormLayout = ({ title, children }) => {
    
    // Consistent Tailwind size and centering classes
    const cardClasses = "w-full max-w-3xl mt-12 p-6 sm:p-8 rounded-2xl shadow-2xl";

    return (
        // 1. Page background: Replaced style with 'bg-screen-bg'
        <div className="min-h-screen pt-24 md:pt-32 pb-12 flex justify-center bg-screen-bg">
            
            <div 
                // 2. Card background and border: Replaced inline styles with 'bg-card-bg' and 'border-border-light'
                className={`${cardClasses} bg-card-bg border border-border-light`}
            >
                <h1 
                    // 3. Header text/border: Replaced inline styles with 'text-text-dark' and 'border-border-light'
                    className="text-2xl sm:text-3xl font-extrabold mb-6 border-b pb-2 text-text-dark border-border-light" 
                >
                    {title}
                </h1>
                
                {children}
            </div>
        </div>
    );
};

export default FormLayout;