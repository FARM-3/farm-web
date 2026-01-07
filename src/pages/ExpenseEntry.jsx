import React, { useState, useEffect } from 'react';
import { Truck, Tag, DollarSign, Calendar, MapPin, AlignLeft, Send, Loader2, X, Package } from 'lucide-react';
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

// IMPORTANT: These API endpoints use .env configuration
const EXPENSE_API_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/expenses/`;
const FARMER_HARVEST_API = `${import.meta.env.VITE_API_URL}/api/aggregation/farmer-harvest/`;

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

    // Farmer harvests state
    const [farmerHarvests, setFarmerHarvests] = useState([]);
    const [harvestsLoading, setHarvestsLoading] = useState(false);
    const [selectedHarvest, setSelectedHarvest] = useState(null);

    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Fetch farmer harvests on component mount
    useEffect(() => {
        const fetchFarmerHarvests = async () => {
            setHarvestsLoading(true);
            try {
                console.log('🌾 Fetching farmer harvests from:', FARMER_HARVEST_API);
                const response = await fetch(FARMER_HARVEST_API);
                console.log('🌾 Harvest API Response Status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('🌾 Harvest API Raw Data:', data);

                    // Handle both array and paginated responses
                    let harvestsToSort = [];

                    if (Array.isArray(data)) {
                        harvestsToSort = data;
                    } else if (data.results && Array.isArray(data.results)) {
                        // Paginated response (from Django REST Framework)
                        harvestsToSort = data.results;
                    } else {
                        console.warn('⚠️ Unexpected API response format:', data);
                        harvestsToSort = [];
                    }

                    console.log('🌾 Harvests to sort count:', harvestsToSort.length);

                    // Sort harvests by latest date first
                    harvestsToSort.sort((a, b) => {
                        const dateA = new Date(a.date_of_delivery || '');
                        const dateB = new Date(b.date_of_delivery || '');
                        return dateB - dateA;
                    });

                    setFarmerHarvests(harvestsToSort);
                    console.log('🌾 Harvests set to state. Count:', harvestsToSort.length, 'First harvest:', harvestsToSort[0]);
                } else {
                    console.error('❌ Failed to fetch farmer harvests. Status:', response.status);
                    const errorText = await response.text();
                    console.error('❌ Error response:', errorText);
                    setFarmerHarvests([]);
                }
            } catch (error) {
                console.error('❌ Error fetching farmer harvests:', error);
                setFarmerHarvests([]);
            } finally {
                setHarvestsLoading(false);
            }
        };
        fetchFarmerHarvests();
    }, []);

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

    const handleHarvestSelect = (e) => {
        const harvestId = e.target.value;
        if (!harvestId) {
            setSelectedHarvest(null);
            return;
        }

        const harvest = farmerHarvests.find(h => h.id?.toString() === harvestId);
        if (harvest) {
            setSelectedHarvest(harvest);
            // Auto-populate expense fields from harvest data using best practices
            setFormData(prev => ({
                ...prev,
                // Use harvest date as the expense date
                date: harvest.date_of_delivery || new Date().toISOString().substring(0, 10),
                // Set location to farmer name (or leave as is)
                location: prev.location || `${harvest.name || 'Farmer'} Harvest`,
                // Set expense name to include harvest details
                expense_name: prev.expense_name || `Harvest - ${harvest.name || 'Coffee Delivery'}`,
                // Category might be auto-set based on harvest (e.g., "Feed/Seed" for harvest-related)
                category: prev.category || 'General Supplies',
                // Set description to include harvest details if empty
                description: prev.description || `Coffee Type: ${harvest.coffee_type || 'N/A'}, Weight: ${harvest.weight_on_delivery || 'N/A'} kg`,
            }));
        }
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
                }, 300); // Reduced from 1500ms for faster UX
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
                <div className="w-full max-w-3xl mx-4 shadow-2xl rounded-2xl" style={{ backgroundColor: CUSTOM_COLORS.cardBg }}>

                    {/* Styled Header */}
                    <div
                        className="flex justify-between items-center p-5 rounded-t-2xl"
                        style={{
                            backgroundColor: '#8B5A3C'
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {isEditing ? 'Edit Expense' : 'Expense Entry Form'}
                                </h1>
                                <p className="text-white/80 text-sm">Financial Management - Expenses</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/expenses')}
                            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 sm:p-8 md:p-10" style={{ border: `1px solid ${CUSTOM_COLORS.inputBorder}`, borderTop: 'none', borderRadius: '0 0 1rem 1rem' }}>

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

                        {/* Row 1.5: Pick from Farmer Harvest */}
                        <div>
                            <label htmlFor="farmer_harvest" className="block text-sm font-medium mb-2 flex items-center" style={{ color: CUSTOM_COLORS.primaryText }}>
                                <Package className="w-4 h-4 mr-1" />
                                Quick Pick from Farmer Harvest
                                <span className="ml-1 text-gray-500 text-xs">(optional)</span>
                            </label>
                            <select
                                id="farmer_harvest"
                                value={selectedHarvest?.id || ''}
                                onChange={handleHarvestSelect}
                                disabled={harvestsLoading}
                                className="w-full px-4 py-3 rounded-lg border-2 appearance-none focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                style={{
                                    backgroundColor: CUSTOM_COLORS.inputBg,
                                    borderColor: CUSTOM_COLORS.inputBorder,
                                    color: CUSTOM_COLORS.primaryText,
                                    '--tw-ring-color': CUSTOM_COLORS.submitBg
                                }}
                            >
                                <option value="">
                                    {harvestsLoading ? 'Loading harvests...' : 'Select a harvest to auto-fill form'}
                                </option>
                                {farmerHarvests.map(harvest => (
                                    <option key={harvest.id} value={harvest.id}>
                                        {`${harvest.name || 'Farmer'} - ${harvest.date_of_delivery || 'N/A'} (${harvest.weight_on_delivery || 0}kg)`}
                                    </option>
                                ))}
                            </select>
                            {selectedHarvest && (
                                <div className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200">
                                    <p className="text-sm text-green-700">
                                        Selected: <strong>{selectedHarvest.name}</strong> - {selectedHarvest.weight_on_delivery}kg on {selectedHarvest.date_of_delivery}
                                    </p>
                                </div>
                            )}
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
