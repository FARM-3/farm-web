import React, { useState, useEffect } from 'react';
import { Truck, Tag, DollarSign, Calendar, MapPin, AlignLeft, Send, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button.jsx';
import SideNav from '../components/SideNav.jsx';

// --- Custom Styles (Reused from Wage and Login components) ---
const CUSTOM_COLORS = {
    headerBg: '#702A0B', // Dark Brown
    cardBg: '#F5EEDC', // Pale Cream
    inputBg: '#FFFFFF',
    inputBorder: '#B8A072', // Olive/Gold
    submitBg: '#702A0B',
    primaryText: '#702A0B',
    successText: '#10B981',
    errorText: '#EF4444',
};

// IMPORTANT: This API endpoint is mock and should match your backend setup
const EXPENSE_API_ENDPOINT = 'https://api-3181.onrender.com/api/expenses/';

// Mock list of common expense categories
const CATEGORIES = [
    'General Supplies', 'Fuel/Energy', 'Equipment Maintenance',
    'Feed/Seed', 'Labor', 'Utilities', 'Transportation', 'Other'
];

function ExpenseEntry() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        expense_name: '',
        category: CATEGORIES[0],
        item: '',
        supplier: '',
        description: '',
        amount: '',
        date: new Date().toISOString().substring(0, 10), // Default to today
        location: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '...' }
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Check if we're editing an existing expense
    useEffect(() => {
        const editExpense = location.state?.editExpense;
        if (editExpense) {
            setIsEditing(true);
            setEditId(editExpense.id);
            setFormData({
                expense_name: editExpense.expense_name || '',
                category: editExpense.category || CATEGORIES[0],
                item: editExpense.item || '',
                supplier: editExpense.supplier || '',
                description: editExpense.description || '',
                amount: editExpense.amount?.toString() || '',
                date: editExpense.date || new Date().toISOString().substring(0, 10),
                location: editExpense.location || '',
            });
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear message on new input
        setMessage(null);
    };

    const handleAmountChange = (e) => {
        // Allows only numbers and a single decimal point
        const { value } = e.target;
        if (/^\d*\.?\d*$/.test(value) || value === '') {
            setFormData(prev => ({ ...prev, amount: value }));
        }
        setMessage(null);
    };

    const formatCurrency = (amount) => {
        const value = parseFloat(amount);
        if (isNaN(value)) return '0.00';
        return value.toFixed(2);
    };

    // const navigate = useNavigate(); // Already declared above

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Basic validation
        if (!formData.expense_name || !formData.amount || !formData.date || !formData.category) {
            setMessage({ type: 'error', text: 'Please fill in all required fields (Name, Amount, Date, Category).' });
            setLoading(false);
            return;
        }

        const dataToSend = {
            ...formData,
            // Convert amount to a fixed decimal string as expected by Django DecimalField
            amount: formatCurrency(formData.amount),
        };

        try {
            const url = isEditing
                ? `${EXPENSE_API_ENDPOINT}${editId}/`
                : EXPENSE_API_ENDPOINT;

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header if needed (e.g., 'Bearer token')
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                // Assuming 201 Created or 200 OK for successful submission
                setMessage({ type: 'success', text: isEditing ? 'Expense updated successfully!' : 'Expense recorded successfully!' });
                // Reset form
                setFormData({
                    expense_name: '',
                    category: CATEGORIES[0],
                    item: '',
                    supplier: '',
                    description: '',
                    amount: '',
                    date: new Date().toISOString().substring(0, 10),
                    location: '',
                });
                setIsEditing(false);
                setEditId(null);
                // Navigate to expenses page to show the updated record
                setTimeout(() => {
                    navigate('/expenses');
                }, 1500);
            } else {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                setMessage({ type: 'error', text: `Failed to ${isEditing ? 'update' : 'save'} expense. Status: ${response.status}. Details: ${JSON.stringify(errorData)}` });
            }
        } catch (error) {
            console.error("Network or Submission Error:", error);
            setMessage({ type: 'error', text: `Network error. Please check if your backend is running at ${EXPENSE_API_ENDPOINT}.` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <div className="min-h-screen flex items-start justify-center pt-24 pb-10 font-sans" style={{ backgroundColor: '#FAF7F1' }}>
                <div className="w-full max-w-3xl mx-4 p-6 sm:p-8 md:p-10 shadow-2xl rounded-2xl" 
                     style={{ backgroundColor: CUSTOM_COLORS.cardBg, border: `1px solid ${CUSTOM_COLORS.inputBorder}` }}>
                    
                    <h1 className="text-3xl font-extrabold text-center mb-2" style={{ color: CUSTOM_COLORS.primaryText }}>
                        {isEditing ? 'Edit Expense' : 'Expense Entry Form'}
                    </h1>
                    <p className="text-center mb-8 text-sm" style={{ color: CUSTOM_COLORS.primaryText }}>
                        Financial Management - Expenses
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Row 1: Expense Name and Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Expense Name"
                                name="expense_name"
                                value={formData.expense_name}
                                onChange={handleChange}
                                placeholder="e.g., Tractor Fuel, Seed Purchase"
                                required
                                Icon={Truck}
                                type="text"
                            />
                            <SelectField
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                options={CATEGORIES}
                                required
                                Icon={Tag}
                            />
                        </div>

                        {/* Row 2: Item and Supplier */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Item Purchased"
                                name="item"
                                value={formData.item}
                                onChange={handleChange}
                                placeholder="e.g., Diesel, Tomato Seeds"
                                Icon={AlignLeft}
                                type="text"
                            />
                            <InputField
                                label="Supplier"
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleChange}
                                placeholder="e.g., Shell Petrol, Agro Distributor Ltd"
                                Icon={Truck}
                                type="text"
                            />
                        </div>

                        {/* Row 3: Amount and Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Amount ($)"
                                name="amount"
                                value={formData.amount}
                                onChange={handleAmountChange}
                                placeholder="0.00"
                                required
                                Icon={DollarSign}
                                type="text" // Use text for custom number validation
                            />
                            <InputField
                                label="Date of Expense"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                Icon={Calendar}
                                type="date"
                            />
                        </div>

                        {/* Row 4: Location */}
                        <InputField
                            label="Location/Farm Section"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., Main Farm, Processing Unit"
                            Icon={MapPin}
                            type="text"
                        />

                        {/* Row 5: Description (Full Width) */}
                        <InputField
                            label="Detailed Description (Optional)"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Provide details about the expense, reason for purchase, or quantity."
                            Icon={AlignLeft}
                            isTextArea={true}
                        />

                        {/* Submission Message */}
                        {message && (
                            <div className={`p-3 rounded-lg text-center font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 text-white rounded-xl shadow-lg flex items-center justify-center font-bold text-lg transition duration-300 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: CUSTOM_COLORS.submitBg }}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5 mr-2" />
                            )}
                            {loading ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Expense' : 'Submit Expense Record')}
                        </button>
                    </form>
                </div>
            </div>
        </SideNav>
    );
}

// Reusable Input Field Component
const InputField = ({ label, name, value, onChange, placeholder, required, Icon, type = 'text', isTextArea = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium mb-2 flex items-center" style={{ color: CUSTOM_COLORS.primaryText }}>
            {Icon && <Icon className="w-4 h-4 mr-1" />}
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {isTextArea ? (
              <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
                style={{ 
                    backgroundColor: CUSTOM_COLORS.inputBg, 
                    borderColor: CUSTOM_COLORS.inputBorder,
                    color: CUSTOM_COLORS.primaryText,
                    '--tw-ring-color': CUSTOM_COLORS.submitBg
                }}
            />
        ) : (
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                    backgroundColor: CUSTOM_COLORS.inputBg, 
                    borderColor: CUSTOM_COLORS.inputBorder,
                    color: CUSTOM_COLORS.primaryText,
                    '--tw-ring-color': CUSTOM_COLORS.submitBg
                }}
            />
        )}
    </div>
);

// Reusable Select Field Component
const SelectField = ({ label, name, value, onChange, options, required, Icon }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium mb-2 flex items-center" style={{ color: CUSTOM_COLORS.primaryText }}>
            {Icon && <Icon className="w-4 h-4 mr-1" />}
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-4 py-3 rounded-lg border-2 appearance-none focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ 
                backgroundColor: CUSTOM_COLORS.inputBg, 
                borderColor: CUSTOM_COLORS.inputBorder,
                color: CUSTOM_COLORS.primaryText,
                '--tw-ring-color': CUSTOM_COLORS.submitBg
            }}
        >
            {options.map(option => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
);

export default ExpenseEntry;
