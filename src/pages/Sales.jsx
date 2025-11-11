import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, DollarSign, Calendar, Tag, User, TrendingUpIcon, Loader2, ArrowUp, ArrowDown, Edit, Trash2, Search, Filter, ShoppingBag, X, Plus, Send } from 'lucide-react';

// 💡 IMPORTANT: ADJUST THE PATH BELOW TO YOUR ACTUAL SideNav COMPONENT
import SideNav from '../components/SideNav'; 

// --- API CONFIGURATION ---
const SALES_API_ENDPOINT = 'http://142.93.94.236:8000/api/sales/';

// --- MOCK DATA (Fallback) ---
const MOCK_SALES = [
    { id: 1, customer_name: 'Richard Mac', item: 'Coffee', quantity: 70, rate: 5000, payment_method: 'Cash', date: '2025-10-22' },
    { id: 2, customer_name: 'Winnie Daisy', item: 'Coffee', quantity: 100, rate: 5000, payment_method: 'Cash', date: '2025-10-16' },
    { id: 3, customer_name: 'Emma Mas', item: 'Coffee', quantity: 200, rate: 5000, payment_method: 'Cash', date: '2025-10-15' },
    { id: 4, customer_name: 'Jayden Max', item: 'Coffee', quantity: 100, rate: 5000, payment_method: 'Cash', date: '2025-10-14' },
    { id: 5, customer_name: 'Latim Mark', item: 'Coffee', quantity: 200, rate: 5000, payment_method: 'Mobile Money', date: '2025-10-12' },
    { id: 6, customer_name: 'Sophia Lee', item: 'Coffee', quantity: 85, rate: 5000, payment_method: 'Credit Card', date: '2025-10-10' },
    { id: 7, customer_name: 'Liam Chen', item: 'Coffee', quantity: 120, rate: 5000, payment_method: 'Cash', date: '2025-10-09' },
    { id: 8, customer_name: 'Aisha Nabaasa', item: 'Vanilla', quantity: 50, rate: 4500, payment_method: 'Cash', date: '2025-10-08' },
    { id: 9, customer_name: 'Musa Sempa', item: 'Coffee', quantity: 150, rate: 5000, payment_method: 'Mobile Money', date: '2025-10-07' },
];

// --- CONFIGURATION & UTILITIES ---

const CoffeeColors = {
    SCREEN_BG: '#FFF8F6',
    ACTIVE_LINK_BG: '#efebe9',
    ACTIVE_LINK_TEXT: '#783A1E',
    DARK_BROWN: '#4A3423',
    MEDIUM_BROWN: '#795548',
    // MODAL BUTTON COLORS
    BUTTON_PRIMARY: '#6B2E0F', // Coffee Brown
    BUTTON_HOVER: '#5A260D',
    BUTTON_SECONDARY: '#EBEAE6',
    BUTTON_SECONDARY_TEXT: '#4A3423',
    GRAY_TEXT: '#8D8D8D',
    SUCCESS_GREEN: '#34A853',
    ERROR_RED: '#EA4335',
    INPUT_BORDER: '#E0E0E0',
    FORM_BG: '#F5F5F5', // Background for the modal itself
    FORM_CARD_BG: '#FFFFFF', // Background for each section card
    MODAL_TITLE_TEXT: '#2C3E50',
    INPUT_BG: '#FFFFFF',
    WHITE: '#FFFFFF',
};

// Modal-specific colors matching Expense design
const MODAL_COLORS = {
    HEADER_BG: '#FFFFFF',
    HEADER_TEXT: '#333333',
    HEADER_CLOSE_BTN: '#6B7280',
    MODAL_BG: '#F8F8F8',
    SECTION_BG: '#FFFFFF',
    SECTION_HEADER_TEXT: '#333333',
    SECTION_ICON: '#F59E0B',
    INPUT_BG: '#F9FAFB',
    INPUT_BORDER: '#D1D5DB',
    TEXT_PRIMARY: '#333333',
    TEXT_SECONDARY: '#6B7280',
    FOOTER_BG: '#F8F8F8',
    BUTTON_PRIMARY_BG: '#9F4A2F',
    BUTTON_PRIMARY_TEXT: '#FFFFFF',
    BUTTON_SECONDARY_BG: '#E5E7EB',
    BUTTON_SECONDARY_TEXT: '#4B5563',
    REQUIRED_ASTERISK: '#EF4444',
    VALID_BORDER: '#10B981',
    INVALID_BORDER: '#EF4444',
};

const formatUGX = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        amount = Number(amount);
        if (isNaN(amount)) return '0';
    }
    return amount.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0,
        useGrouping: true 
    });
};

// --- SHARED COMPONENTS (Customized Button) ---

/* Commented out - not currently used
const Button = ({ children, onClick, className, disabled, type = 'primary' }) => {
    const baseClasses = `px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm`;
    
    let colorStyles;
    let computedClasses = className || '';

    if (type === 'modal-primary') {
        colorStyles = { 
            backgroundColor: CoffeeColors.BUTTON_PRIMARY,
            color: CoffeeColors.WHITE,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            fontWeight: '600',
            borderRadius: '8px',
        };
        computedClasses += ` hover:bg-[${CoffeeColors.BUTTON_HOVER}]`; 
    } else if (type === 'modal-secondary') {
        colorStyles = { 
            backgroundColor: CoffeeColors.BUTTON_SECONDARY,
            color: CoffeeColors.BUTTON_SECONDARY_TEXT,
            boxShadow: 'none',
            fontWeight: '600',
            borderRadius: '8px',
        };
        computedClasses += ` hover:bg-gray-300`;
    } else {
        // Fallback for page buttons
        colorStyles = {};
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={colorStyles}
            className={`${baseClasses} ${computedClasses}`}
        >
            {children}
        </button>
    );
};
*/

// --- SALES ENTRY LOGIC ---

const initialFormData = {
    customer_name: '',
    item: '',
    quantity: '',
    rate: '',
    amount: '',
    date_of_payment: '',
    method_of_payment: ''
};

const items = ['Coffee', 'Vanilla', 'Robusta', 'Arabica'];
const paymentMethods = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'];

const useSalesForm = (onSuccess, editData = null) => {
    const [formData, setFormData] = useState(editData || initialFormData);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Update form when editData changes
    useEffect(() => {
        if (editData) {
            setFormData(editData);
        } else {
            setFormData(initialFormData);
        }
    }, [editData]);

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'customer_name':
                if (!value || value.trim().length === 0) {
                    return 'Customer name is required';
                }
                if (value.trim().length < 2) {
                    return 'Customer name must be at least 2 characters';
                }
                if (value.trim().length > 100) {
                    return 'Customer name must not exceed 100 characters';
                }
                return '';

            case 'item':
                return !value ? 'Please select an item' : '';

            case 'quantity':
                if (!value || value === '') {
                    return 'Quantity is required';
                }
                const qty = parseFloat(value);
                if (isNaN(qty)) {
                    return 'Quantity must be a valid number';
                }
                if (qty <= 0) {
                    return 'Quantity must be greater than 0';
                }
                if (qty > 1000000) {
                    return 'Quantity seems unreasonably high';
                }
                return '';

            case 'rate':
                if (!value || value === '') {
                    return 'Rate is required';
                }
                const rate = parseFloat(value);
                if (isNaN(rate)) {
                    return 'Rate must be a valid number';
                }
                if (rate <= 0) {
                    return 'Rate must be greater than 0';
                }
                if (rate < 100) {
                    return 'Rate seems too low (minimum 100 UGX)';
                }
                return '';

            case 'date_of_payment':
                if (!value) {
                    return 'Payment date is required';
                }
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);

                if (selectedDate > today) {
                    return 'Cannot select a future date';
                }
                return '';

            case 'method_of_payment':
                return !value ? 'Please select a payment method' : '';

            case 'amount':
                if (!value || value === '') {
                    return 'Amount is required';
                }
                const amt = parseFloat(value);
                if (isNaN(amt)) {
                    return 'Amount must be a valid number';
                }
                if (amt <= 0) {
                    return 'Amount must be greater than 0';
                }
                return '';

            default:
                return '';
        }
    };

    const getBorderColor = (fieldName) => {
        if (errors[fieldName]) return CoffeeColors.ERROR_RED;
        if (formData[fieldName] && formData[fieldName].toString().trim() !== '' && touched[fieldName]) return CoffeeColors.SUCCESS_GREEN;
        return CoffeeColors.INPUT_BORDER;
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setErrors({});
        setTouched({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedData = { ...formData, [name]: value };

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'quantity' || name === 'rate') {
            const qty = parseFloat(name === 'quantity' ? value : formData.quantity);
            const rte = parseFloat(name === 'rate' ? value : formData.rate);
            if (!isNaN(qty) && !isNaN(rte) && qty > 0 && rte > 0) {
                updatedData.amount = (qty * rte).toFixed(2);
            } else {
                updatedData.amount = '0.00'; 
            }
        }

        const amt = parseFloat(updatedData.amount || formData.amount || '0.00');
        const sts = name === 'status' ? value : formData.status;

        if (!isNaN(amt)) {
            if (sts === 'Paid') updatedData.balance = '0.00';
            else if (sts === 'Pending' || sts === 'Partial') updatedData.balance = amt.toFixed(2);
            else updatedData.balance = '0.00';
        }

        setFormData(updatedData);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        let isFormValid = true;
        Object.keys(initialFormData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
                isFormValid = false;
            }
        });

        // Additional validation: Check if amount is less than rate
        const amount = parseFloat(formData.amount);
        const rate = parseFloat(formData.rate);
        if (!isNaN(amount) && !isNaN(rate) && amount < rate) {
            newErrors.amount = `Total amount (${amount.toLocaleString()} UGX) cannot be less than rate per kg (${rate.toLocaleString()} UGX)`;
            isFormValid = false;
        }

        const newTouched = {};
        Object.keys(initialFormData).forEach(key => newTouched[key] = true);
        setTouched(newTouched);

        setErrors(newErrors);

        if (isFormValid) {
            onSuccess(formData);
            resetForm();
        }
    };

    return { formData, errors, touched, items, paymentMethods, getBorderColor, handleChange, handleBlur, handleSubmit, resetForm, getTodayDate };
};

// --- MODAL HELPER COMPONENTS ---
const ModalSectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center space-x-2 mb-4">
        <Icon className="w-5 h-5" style={{ color: MODAL_COLORS.SECTION_ICON }} />
        <h3 className="text-base font-semibold" style={{ color: MODAL_COLORS.SECTION_HEADER_TEXT }}>
            {title}
        </h3>
    </div>
);

const InputField = ({ label, name, value, onChange, onBlur, placeholder, showRequired, type = "text", status = 'initial', error, max }) => {
    const borderColor = status === 'valid'
        ? MODAL_COLORS.VALID_BORDER
        : status === 'invalid'
        ? MODAL_COLORS.INVALID_BORDER
        : MODAL_COLORS.INPUT_BORDER;

    return (
        <div className="flex flex-col space-y-1">
            <label htmlFor={name} className="text-sm font-medium" style={{ color: MODAL_COLORS.TEXT_SECONDARY }}>
                {label}
                {showRequired && <span className="ml-1" style={{ color: MODAL_COLORS.REQUIRED_ASTERISK }}>*</span>}
            </label>
            <input
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                type={type}
                max={max}
                className="flex-1 w-full px-3 py-2 text-sm rounded-md border focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
                style={{
                    backgroundColor: MODAL_COLORS.INPUT_BG,
                    borderColor: borderColor,
                    color: MODAL_COLORS.TEXT_PRIMARY,
                }}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};

const SelectField = ({ label, name, value, onChange, onBlur, options, showRequired, status = 'initial', error }) => {
    const borderColor = status === 'valid'
        ? MODAL_COLORS.VALID_BORDER
        : status === 'invalid'
        ? MODAL_COLORS.INVALID_BORDER
        : MODAL_COLORS.INPUT_BORDER;

    return (
        <div className="flex flex-col space-y-1">
            <label htmlFor={name} className="text-sm font-medium" style={{ color: MODAL_COLORS.TEXT_SECONDARY }}>
                {label}
                {showRequired && <span className="ml-1" style={{ color: MODAL_COLORS.REQUIRED_ASTERISK }}>*</span>}
            </label>
            <div className="relative flex items-center">
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className="appearance-none flex-1 w-full px-3 py-2 text-sm rounded-md border focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 cursor-pointer"
                    style={{
                        backgroundColor: MODAL_COLORS.INPUT_BG,
                        borderColor: borderColor,
                        color: MODAL_COLORS.TEXT_PRIMARY,
                    }}
                >
                    <option value="" disabled>-- Select Option --</option>
                    {options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};

const ActionButton = ({ children, onClick, className, style, disabled, type = "button" }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-white rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm ${className}`}
        style={style}
    >
        {children}
    </button>
);

// =========================================================
// --- SalesEntryModal Component (MEDIUM SIZE ADJUSTMENT) ---
// =========================================================

const SalesEntryModal = ({ isOpen, onClose, onSubmit, editData }) => {
    const { formData, errors, touched, items, paymentMethods, handleChange, handleBlur, handleSubmit, getTodayDate } = useSalesForm(onSubmit, editData);
    const [loading, setLoading] = useState(false);

    const getFieldStatus = (fieldName) => {
        if (errors[fieldName]) return 'invalid';
        if (touched[fieldName] && formData[fieldName]) return 'valid';
        return 'initial';
    };

    const handleFormSubmit = async (e) => {
        setLoading(true);
        await handleSubmit(e);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl mx-auto rounded-lg shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden"
                 style={{ backgroundColor: MODAL_COLORS.MODAL_BG }}>

                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200" style={{ backgroundColor: MODAL_COLORS.HEADER_BG }}>
                    <h2 className="text-xl font-semibold" style={{ color: MODAL_COLORS.HEADER_TEXT }}>
                        Sales Entry
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" style={{ color: MODAL_COLORS.HEADER_CLOSE_BTN }} />
                    </button>
                </div>

                {/* Modal Body (Scrollable Form Content) */}
                <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto min-h-0">

                        {/* Customer & Item Information Section */}
                        <div className="p-5 rounded-lg border border-gray-200" style={{ backgroundColor: MODAL_COLORS.SECTION_BG }}>
                            <ModalSectionHeader icon={User} title="Customer & Item Information" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Customer Name"
                                    name="customer_name"
                                    value={formData.customer_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="e.g., John Doe"
                                    showRequired={true}
                                    status={getFieldStatus('customer_name')}
                                    error={errors.customer_name}
                                />
                                <InputField
                                    label="Item"
                                    name="item"
                                    value={formData.item}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="e.g., Coffee, Vanilla"
                                    showRequired={true}
                                    status={getFieldStatus('item')}
                                    error={errors.item}
                                />
                            </div>
                        </div>

                        {/* Transaction Details Section */}
                        <div className="p-5 rounded-lg border border-gray-200" style={{ backgroundColor: MODAL_COLORS.SECTION_BG }}>
                            <ModalSectionHeader icon={ShoppingBag} title="Transaction Details" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Quantity (Kgs/Units)"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="e.g., 50"
                                    type="number"
                                    showRequired={true}
                                    status={getFieldStatus('quantity')}
                                    error={errors.quantity}
                                />
                                <InputField
                                    label="Rate (UGX/Unit)"
                                    name="rate"
                                    value={formData.rate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="e.g., 5000"
                                    type="number"
                                    showRequired={true}
                                    status={getFieldStatus('rate')}
                                    error={errors.rate}
                                />
                                <InputField
                                    label="Amount (UGX)"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="e.g., 250000"
                                    type="number"
                                    showRequired={true}
                                    status={getFieldStatus('amount')}
                                    error={errors.amount}
                                />
                                <SelectField
                                    label="Payment Method"
                                    name="method_of_payment"
                                    value={formData.method_of_payment}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    options={paymentMethods}
                                    showRequired={true}
                                    status={getFieldStatus('method_of_payment')}
                                    error={errors.method_of_payment}
                                />
                            </div>
                        </div>

                        {/* Payment Date Section */}
                        <div className="p-5 rounded-lg border border-gray-200" style={{ backgroundColor: MODAL_COLORS.SECTION_BG }}>
                            <ModalSectionHeader icon={Calendar} title="Payment Information" />
                            <div className="grid grid-cols-1 gap-4">
                                <InputField
                                    label="Date of Payment"
                                    name="date_of_payment"
                                    value={formData.date_of_payment}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    type="date"
                                    max={getTodayDate()}
                                    showRequired={true}
                                    status={getFieldStatus('date_of_payment')}
                                    error={errors.date_of_payment}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer (Buttons) */}
                    <div className="flex justify-end p-4 border-t border-gray-200 space-x-3" style={{ backgroundColor: MODAL_COLORS.FOOTER_BG }}>
                        <ActionButton
                            onClick={onClose}
                            className="rounded-md"
                            style={{ backgroundColor: MODAL_COLORS.BUTTON_SECONDARY_BG, color: MODAL_COLORS.BUTTON_SECONDARY_TEXT }}
                        >
                            Cancel
                        </ActionButton>
                        <ActionButton
                            type="submit"
                            disabled={loading}
                            className="rounded-md"
                            style={{ backgroundColor: MODAL_COLORS.BUTTON_PRIMARY_BG, color: MODAL_COLORS.BUTTON_PRIMARY_TEXT }}
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                            ) : (
                                <><Send className="w-4 h-4 mr-2" />Submit Sales Record</>
                            )}
                        </ActionButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =========================================================
// --- SalesPage Component (Main App Screen - Table View) ---
// =========================================================

const TABLE_HEADERS = [
    { key: 'customer_name', label: 'Customer Name', type: 'string', align: 'left' },
    { key: 'item', label: 'Item', type: 'string', align: 'left' },
    { key: 'quantity', label: 'Quantity', type: 'number', align: 'center' },
    { key: 'rate', label: 'Rate (UGX)', type: 'number', align: 'right' },
    { key: 'amount', label: 'Amount (UGX)', type: 'number', align: 'right' },
    { key: 'payment_method', label: 'Payment Method', type: 'string', align: 'left' },
    { key: 'date_of_payment', label: 'Date', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' },
];

function SalesPage() {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'date_of_payment', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSale, setEditingSale] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState(null);
    const itemsPerPage = 7;
    
    const fetchSales = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${SALES_API_ENDPOINT}?page=${page}&page_size=${itemsPerPage}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            console.log('Fetched sales from API:', data);

            // Handle paginated response
            if (data.results) {
                setSales(data.results);
                setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
            } else if (Array.isArray(data)) {
                setSales(data);
                setTotalPages(Math.ceil(data.length / itemsPerPage));
            } else {
                setSales([]);
                setTotalPages(1);
            }
            setError(null);
        } catch (err) {
            console.warn(`API fetch failed, using mock data: ${err.message}`);
            // Fallback to mock data
            const startIndex = (page - 1) * itemsPerPage;
            const paginatedData = MOCK_SALES.slice(startIndex, startIndex + itemsPerPage);
            setSales(paginatedData);
            setTotalPages(Math.ceil(MOCK_SALES.length / itemsPerPage));
            setError('Using offline data - API unavailable');
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        fetchSales(currentPage);
    }, [fetchSales, currentPage]);

    const sortedSales = useMemo(() => {
        const base = Array.isArray(sales) ? sales : [];
        let sortableItems = [...base];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle date field mapping (date -> date_of_payment)
                if (sortConfig.key === 'date') {
                    aValue = a.date_of_payment || a.date;
                    bValue = b.date_of_payment || b.date;
                }

                // Handle date sorting
                const header = TABLE_HEADERS.find(h => h.key === sortConfig.key);
                if (header?.type === 'date') {
                    const dateA = new Date(aValue || 0);
                    const dateB = new Date(bValue || 0);
                    return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
                }

                // Handle number sorting
                if (header?.type === 'number') {
                    const numA = parseFloat(aValue || 0);
                    const numB = parseFloat(bValue || 0);
                    return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
                }

                // Handle string sorting
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [sales, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
    };
    
    const handleSalesSubmit = async (data) => {
        console.log('New Sales Record Submitted:', data);

        // Prepare data for API - convert numbers to strings for decimal fields
        const apiData = {
            customer_name: data.customer_name?.trim() || null,
            item: data.item?.trim() || '',
            quantity: parseInt(data.quantity) || 0,
            rate: String(data.rate || '0'), // API expects string for decimal
            amount: String(data.amount || '0'), // API expects string for decimal
            date_of_payment: data.date_of_payment || '',
            method_of_payment: data.method_of_payment?.trim() || ''
        };

        // Validate required fields
        const requiredFields = ['item', 'quantity', 'rate', 'amount', 'date_of_payment', 'method_of_payment'];
        const missingFields = requiredFields.filter(field => !apiData[field] || apiData[field] === '0');

        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            alert(`Missing required fields: ${missingFields.join(', ')}`);
            return;
        }

        console.log('Sending to API:', JSON.stringify(apiData, null, 2));

        try {
            if (editingSale) {
                // Update existing sale via PUT request
                console.log('Updating existing sale via API');
                const response = await fetch(`${SALES_API_ENDPOINT}${editingSale.id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(apiData)
                });

                console.log('API Response Status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error Response:', errorText);
                    try {
                        const errorJson = JSON.parse(errorText);
                        console.error('API Error Details:', errorJson);
                        alert(`Failed to update sale: ${JSON.stringify(errorJson, null, 2)}`);
                    } catch (e) {
                        alert(`Failed to update sale: ${response.status} - ${errorText}`);
                    }
                    throw new Error(`API Error: ${response.status}`);
                }

                const updatedSale = await response.json();
                console.log('Sale updated successfully:', updatedSale);

                // Update local state
                setSales(prevSales => prevSales.map(s => s.id === editingSale.id ? updatedSale : s));

                // Also update MOCK_SALES for persistence
                const index = MOCK_SALES.findIndex(s => s.id === editingSale.id);
                if (index > -1) {
                    MOCK_SALES[index] = updatedSale;
                }
            } else {
                // Add new sale via POST request
                console.log('Creating new sale via API');
                const response = await fetch(SALES_API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(apiData)
                });

                console.log('API Response Status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error Response:', errorText);
                    try {
                        const errorJson = JSON.parse(errorText);
                        console.error('API Error Details:', errorJson);
                        alert(`Failed to create sale: ${JSON.stringify(errorJson, null, 2)}`);
                    } catch (e) {
                        alert(`Failed to create sale: ${response.status} - ${errorText}`);
                    }
                    throw new Error(`API Error: ${response.status}`);
                }

                const newSale = await response.json();
                console.log('Sale created successfully:', newSale);

                // Update local state with API-generated data
                setSales(prevSales => [newSale, ...prevSales]);
                MOCK_SALES.unshift(newSale);
            }

            setIsModalOpen(false);
            setEditingSale(null);

            // Refresh the current page
            fetchSales(currentPage);
        } catch (error) {
            console.error('Failed to save sale to API:', error);
            alert('Failed to save to database. Please check your connection and try again.');

            // Optional: Fallback to local storage only
            // You can uncomment this if you want to save locally when API fails
            /*
            const newSale = {
                id: MOCK_SALES.length > 0 ? Math.max(...MOCK_SALES.map(s => s.id)) + 1 : 1,
                ...data,
                payment_method: data.method_of_payment
            };
            setSales(prevSales => [newSale, ...prevSales]);
            MOCK_SALES.unshift(newSale);
            setIsModalOpen(false);
            setEditingSale(null);
            fetchSales(currentPage);
            */
        }
    }

    const handleEditSale = (sale) => {
        setEditingSale(sale);
        setIsModalOpen(true);
    };

    const handleDeleteSale = (sale) => {
        setSaleToDelete(sale);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!saleToDelete) return;

        try {
            console.log('Deleting sale via API:', saleToDelete.id);
            const response = await fetch(`${SALES_API_ENDPOINT}${saleToDelete.id}/`, {
                method: 'DELETE'
            });

            if (response.ok || response.status === 404) {
                console.log('Sale deleted successfully from API');

                // Update the sales list by removing the deleted sale
                setSales(prevSales => prevSales.filter(s => s.id !== saleToDelete.id));

                // Also remove from MOCK_SALES if needed for persistence in this session
                const index = MOCK_SALES.findIndex(s => s.id === saleToDelete.id);
                if (index > -1) {
                    MOCK_SALES.splice(index, 1);
                }

                setShowDeleteModal(false);
                setSaleToDelete(null);

                // Refresh the current page
                fetchSales(currentPage);
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
        } catch (err) {
            console.error('Failed to delete from API:', err);
            alert('Failed to delete from database. Please try again.');

            // Optional: Still delete locally even if API fails
            // Uncomment if you want to proceed with local deletion on API failure
            /*
            setSales(prevSales => prevSales.filter(s => s.id !== saleToDelete.id));
            const index = MOCK_SALES.findIndex(s => s.id === saleToDelete.id);
            if (index > -1) {
                MOCK_SALES.splice(index, 1);
            }
            setShowDeleteModal(false);
            setSaleToDelete(null);
            fetchSales(currentPage);
            */
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSaleToDelete(null);
    };

    // Calculate KPI metrics from real-time data
    const KPIs = () => {
        if (!sales || sales.length === 0) {
            return {
                totalSales: 0,
                averageOrderValue: 0,
                totalOrders: 0,
                uniqueCustomers: 0,
                mostSoldItem: null,
                mostSoldItemValue: 0,
                weeklySales: 0,
                weeklyOrderCount: 0
            };
        }

        // Calculate total sales amount
        const totalSales = sales.reduce((sum, sale) => {
            const amount = parseFloat(sale.total_amount || sale.amount || 0);
            return sum + amount;
        }, 0);

        // Calculate average order value
        const averageOrderValue = sales.length > 0 ? totalSales / sales.length : 0;

        // Count unique customers
        const uniqueCustomers = new Set(sales.map(sale => sale.customer_name).filter(Boolean)).size;

        // Calculate weekly sales (last 7 days)
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const weeklySales = sales.reduce((sum, sale) => {
            const saleDate = new Date(sale.date_of_payment || sale.date);
            if (saleDate >= sevenDaysAgo && saleDate <= today) {
                const amount = parseFloat(sale.total_amount || sale.amount || 0);
                return sum + amount;
            }
            return sum;
        }, 0);

        const weeklyOrderCount = sales.filter(sale => {
            const saleDate = new Date(sale.date_of_payment || sale.date);
            return saleDate >= sevenDaysAgo && saleDate <= today;
        }).length;

        // Calculate most sold item by total value
        const itemStats = {};
        sales.forEach(sale => {
            const item = sale.item;
            if (!item) return;

            const quantity = parseFloat(sale.quantity || 0);
            const rate = parseFloat(sale.rate || 0);
            const totalValue = quantity * rate;

            if (!itemStats[item]) {
                itemStats[item] = {
                    totalQuantity: 0,
                    totalValue: 0
                };
            }

            itemStats[item].totalQuantity += quantity;
            itemStats[item].totalValue += totalValue;
        });

        // Find the item with the highest total value
        let mostSoldItem = null;
        let mostSoldItemValue = 0;

        Object.entries(itemStats).forEach(([item, stats]) => {
            if (stats.totalValue > mostSoldItemValue) {
                mostSoldItem = item;
                mostSoldItemValue = stats.totalValue;
            }
        });

        return {
            totalSales,
            averageOrderValue,
            totalOrders: sales.length,
            uniqueCustomers,
            mostSoldItem,
            mostSoldItemValue,
            weeklySales,
            weeklyOrderCount
        };
    };

    const kpis = KPIs();
    const  KPICards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
                        Total Sales
                    </h3>
                    <DollarSign size={20} style={{ color: '#8B5A3C' }} />
                </div>
                {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5A3C' }} />
                        <span className="text-sm" style={{ color: '#888' }}>Loading...</span>
                    </div>
                ) : (
                    <div className="mt-2">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium" style={{ color: '#888' }}>UGX</p>
                            <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{formatUGX(kpis.totalSales)}</p>
                        </div>
                        <div className="mt-3 text-xs">
                            <p style={{ color: '#666' }}>Total orders: {kpis.totalOrders}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
                        Most Sold Item
                    </h3>
                    <Tag size={20} style={{ color: '#8B5A3C' }} />
                </div>
                {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5A3C' }} />
                        <span className="text-sm" style={{ color: '#888' }}>Loading...</span>
                    </div>
                ) : (
                    <div className="mt-2">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium" style={{ color: '#888' }}>
                                {kpis.mostSoldItem || 'N/A'}
                            </p>
                            <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>
                                {kpis.mostSoldItem ? formatUGX(kpis.mostSoldItemValue) : '0'}
                            </p>
                        </div>
                        <div className="mt-3 text-xs">
                            <p style={{ color: '#666' }}>
                                {kpis.mostSoldItem ? 'Total value (UGX)' : 'No sales data'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-medium tracking-wide uppercase" style={{ color: '#666' }}>
                        Total Weekly Sales
                    </h3>
                    <TrendingUpIcon size={20} style={{ color: '#8B5A3C' }} />
                </div>
                {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B5A3C' }} />
                        <span className="text-sm" style={{ color: '#888' }}>Loading...</span>
                    </div>
                ) : (
                    <div className="mt-2">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium" style={{ color: '#888' }}>UGX</p>
                            <p className="text-3xl font-bold" style={{ color: '#3D2817' }}>{formatUGX(kpis.weeklySales)}</p>
                        </div>
                        <div className="mt-3 text-xs">
                            <p style={{ color: '#666' }}>Orders this week: {kpis.weeklyOrderCount}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderTableContent = () => {
        if (loading) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-600">
                        <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-accent-btn" />
                        Loading sales records...
                    </td>
                </tr>
            );
        }

        if (error || sortedSales.length === 0) {
            return (
                <tr className='h-24'>
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-6 text-gray-500 italic">
                        {error || 'No sales records found.'}
                    </td>
                </tr>
            );
        }

        return sortedSales.map((sale, index) => {
            // Support both field names: date_of_payment (from API) and date (from mock data)
            const saleDate = sale.date_of_payment || sale.date;
            const dateStr = saleDate ? new Date(saleDate).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : 'N/A';
            // Support both field names: method_of_payment (from API) and payment_method (from mock data)
            const paymentMethod = sale.method_of_payment || sale.payment_method || 'N/A';

            return (
                <tr key={sale.id || index} className="border-b border-gray-100 transition-colors duration-150 hover:bg-light-coffee-brown/40">
                    <td className="px-3 py-2 text-left font-medium text-text-default text-xs">{sale.customer_name || 'N/A'}</td>
                    <td className="px-3 py-2 text-left text-gray-600 text-xs">{sale.item || 'N/A'}</td>
                    <td className="px-3 py-2 text-center text-gray-600 text-xs">{sale.quantity || 0}</td>
                    <td className="px-3 py-2 text-right text-gray-700 font-semibold text-xs">
                        {parseFloat(sale.rate || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-3 py-2 text-right text-[#8B4513] font-bold text-xs">
                        {(parseFloat(sale.quantity || 0) * parseFloat(sale.rate || 0)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-3 py-2 text-left font-medium">
                        <span className="text-xs text-gray-600">
                            {paymentMethod}
                        </span>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600 text-xs">{dateStr}</td>
                    <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center space-x-2">
                            <button
                                onClick={() => handleEditSale(sale)}
                                className="p-1 rounded-md transition-colors"
                                style={{ color: '#000000' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#3B82F6'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#000000'}
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteSale(sale)}
                                className="p-1 rounded-md transition-colors"
                                style={{ color: '#000000' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#000000'}
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => navigate(`/receipt?id=${sale.id}`)}
                                className="p-1 rounded-md transition-colors"
                                style={{ color: '#000000' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#10B981'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#000000'}
                                title="View Receipt"
                            >
                                <ShoppingBag className="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                </tr>
            );
        });
    };
    
    // ----------------------------------------------------
    // *** The SideNav component is now correctly wrapping the main content ***
    // ----------------------------------------------------
    return (
        <SideNav style={{ minHeight: '100vh', backgroundColor: CoffeeColors.SCREEN_BG }}>

            {/* The main content area */}
            <main className="p-3 sm:p-4 md:p-6 pt-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#4A3423] mb-6">
                    Sales Records Overview
                </h2>
                
                <KPICards />

                {/* Action Bar & Filter */}
                <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex gap-3 items-center w-full sm:w-auto order-2 sm:order-1">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="search" 
                                placeholder="Search by customer name" 
                                className="p-2 pl-10 text-sm w-full sm:w-56 border border-gray-300 rounded-xl focus:ring-accent-btn focus:border-accent-btn transition-colors shadow-lg"
                            />
                        </div>
                        <div className="relative inline-block text-left">
                            <select 
                                className="appearance-none bg-white border border-gray-300 rounded-xl py-2 pl-4 pr-8 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-accent-btn focus:border-accent-btn shadow-lg transition duration-300 ease-in-out"
                                defaultValue=""
                            >
                                <option value="" disabled>Filter by</option>
                                <option value="date">Date</option>
                                <option value="method">Payment Method</option>
                                <option value="item">Item</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                        <button
                            onClick={() => fetchSales(currentPage)}
                            disabled={loading}
                            className="py-2 px-4 shadow-xl rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            style={{ backgroundColor: '#efebe9', color: '#783A1E', border: 'none' }}
                        >
                            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </button>
                    </div>
                      
                    <div className="flex gap-3 order-1 sm:order-2">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="py-2 px-4 shadow-xl rounded-xl flex items-center font-semibold text-white hover:shadow-2xl transition-all duration-200"
                            style={{ backgroundColor: '#8B4513' }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Record New Sale
                        </button>
                        <button
                            onClick={() => console.log('Export to Excel')}
                            className="py-2 px-4 shadow-xl rounded-xl font-semibold hover:shadow-2xl transition-all duration-200"
                            style={{ backgroundColor: '#efebe9', color: '#783A1E', border: 'none' }}
                        >
                            Export to Excel
                        </button>
                    </div>
                </div>

                {/* Sales Records Table Container */}
                <div className="w-full shadow-xl rounded-2xl bg-white transition-all duration-300 overflow-hidden">
                    {/* Scrollable Table Wrapper */}
                    <div className="overflow-x-auto overflow-y-visible" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <div className="min-w-full inline-block align-middle">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="sticky top-0 z-10" style={{ backgroundColor: '#efebe9', color: '#4A3423' }}>
                                    <tr>
                                        {TABLE_HEADERS.map((header) => (
                                            <th
                                                key={header.key}
                                                className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-150 cursor-pointer ${
                                                    header.align === 'right' ? 'text-right' : header.align === 'center' ? 'text-center' : 'text-left'
                                                } hover:bg-accent-btn/90 whitespace-nowrap`}
                                                onClick={() => header.key !== 'actions' && requestSort(header.key)}
                                                scope="col"
                                            >
                                                <div className={`flex items-center ${header.align === 'right' ? 'justify-end' : header.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                                                    {header.label}
                                                    {header.key !== 'actions' && getSortIcon(header.key)}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white/80 divide-y divide-gray-100 text-xs text-text-default">
                                    {renderTableContent()}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages >= 1 && (
                        <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-gray-100 flex-wrap gap-2">
                            <div className="flex items-center text-xs text-gray-700">
                                <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="px-3 py-1 text-xs rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#efebe9', color: '#783A1E' }}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                    className="px-3 py-1 text-xs rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#efebe9', color: '#783A1E' }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <SalesEntryModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingSale(null);
                }}
                onSubmit={handleSalesSubmit}
                editData={editingSale}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 flex justify-center items-center transition-all duration-300 backdrop-blur-sm"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(75, 52, 35, 0.5) 100%)',
                        zIndex: 1000,
                    }}
                    onClick={cancelDelete}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-[#4A3423]">Confirm Delete</h3>
                            <button
                                onClick={cancelDelete}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete the sale record for <strong>{saleToDelete?.customer_name}</strong>?
                            <br />
                            <span className="text-sm text-gray-500">This action cannot be undone.</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200"
                                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SideNav>
    );
}

export default SalesPage;