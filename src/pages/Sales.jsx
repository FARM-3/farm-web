import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, DollarSign, Calendar, Tag, User, TrendingUpIcon, Loader2, ArrowUp, ArrowDown, Edit, Trash2, Search, Filter, ShoppingBag, X, Plus, Send } from 'lucide-react';

// 💡 IMPORTANT: ADJUST THE PATH BELOW TO YOUR ACTUAL SideNav COMPONENT
import SideNav from '../components/SideNav'; 

// --- MOCK DATA ---
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

const formatUGX = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0';
    return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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

    const validateField = (name, value) => {
        switch (name) {
            case 'customer_name':
                return value.trim().length < 2 ? 'Must be at least 2 characters' : '';
            case 'item': case 'method_of_payment':
                return !value ? 'This field is required' : '';
            case 'quantity': case 'rate': case 'amount':
                const numVal = parseFloat(value);
                return !value || isNaN(numVal) || numVal <= 0 ? 'Must be a positive number' : '';
            case 'date_of_payment':
                return !value ? 'Date is required' : '';
            default: return '';
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

        const newTouched = {};
        Object.keys(initialFormData).forEach(key => newTouched[key] = true);
        setTouched(newTouched);

        setErrors(newErrors);

        if (isFormValid) {
            onSuccess(formData);
            resetForm();
        } 
    };

    return { formData, errors, touched, items, paymentMethods, getBorderColor, handleChange, handleBlur, handleSubmit, resetForm };
};

// --- MODAL SECTION HEADER COMPONENT ---
const FormSectionHeader = ({ icon: Icon, title }) => (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '10px', 
        paddingBottom: '5px',
    }}>
        <Icon className="w-4 h-4 mr-2" style={{ color: CoffeeColors.DARK_BROWN }} />
        <h3 style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            color: CoffeeColors.DARK_BROWN 
        }}>
            {title}
        </h3>
    </div>
);

// =========================================================
// --- SalesEntryModal Component (MEDIUM SIZE ADJUSTMENT) ---
// =========================================================

const SalesEntryModal = ({ isOpen, onClose, onSubmit, editData }) => {
    const { formData, errors, items, paymentMethods, getBorderColor, handleChange, handleBlur, handleSubmit } = useSalesForm(onSubmit, editData);

    if (!isOpen) return null;

    const renderInputField = (label, name, type, placeholder, options) => {
        const value = formData[name] || '';
        const error = errors[name];
        const isReadOnly = type === 'readonly';

        const InputComponent = options ? 'select' : 'input';

        const inputStyle = {
            width: '100%',
            padding: '8px 10px', 
            fontSize: '13px', 
            border: `1px solid ${getBorderColor(name)}`,
            borderRadius: '4px',
            backgroundColor: isReadOnly ? CoffeeColors.INPUT_BG : CoffeeColors.FORM_CARD_BG,
            outline: 'none',
            color: CoffeeColors.DARK_BROWN,
            fontWeight: isReadOnly ? '600' : 'normal',
            boxSizing: 'border-box',
            transition: 'border-color 0.3s',
        };

        return (
            <div>
                <label style={{ 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: CoffeeColors.DARK_BROWN, 
                    display: 'block', 
                    marginBottom: '3px', 
                    whiteSpace: 'nowrap'
                }}>
                    {label}
                </label>
                <div style={{ position: 'relative' }}>
                    {InputComponent === 'input' && (
                        <input
                            type={type === 'number' ? 'text' : type}
                            inputMode={type === 'number' ? 'numeric' : undefined}
                            name={name}
                            value={value}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={placeholder}
                            readOnly={isReadOnly}
                            style={inputStyle}
                        />
                    )}
                    {InputComponent === 'select' && (
                        <select
                            name={name}
                            value={value}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={inputStyle}
                        >
                            <option value="" disabled>{placeholder}</option>
                            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    )}
                </div>
                {error && <span style={{ color: CoffeeColors.ERROR_RED, fontSize: '10px', display: 'block', marginTop: '3px' }}>{error}</span>}
            </div>
        );
    };

    return (
        <div
            className="fixed inset-0 flex justify-center items-center transition-all duration-300 backdrop-blur-sm"
            style={{
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(75, 52, 35, 0.5) 100%)',
                zIndex: 1000,
                overflowY: 'auto',
                padding: '30px 10px',
            }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col m-4"
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(139, 69, 19, 0.1)',
                    animation: 'slideUp 0.3s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* MODAL HEADER */}
                <div
                    className="flex justify-between items-center p-5 rounded-t-2xl flex-shrink-0 border-b-2"
                    style={{
                        background: 'linear-gradient(135deg, #8B4513 0%, #6d3410 100%)',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Sales Entry Form</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6" style={{ display: 'grid', gap: '15px' }}>

                        {/* 1. Customer & Item Information */}
                    <div style={{
                        backgroundColor: CoffeeColors.FORM_CARD_BG,
                        borderRadius: '6px',
                        padding: '15px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                        border: `1px solid ${CoffeeColors.INPUT_BORDER}`
                    }}>
                        <FormSectionHeader icon={User} title="Customer & Item Information" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {renderInputField('Customer Name', 'customer_name', 'text', 'e.g., John Doe')}
                            {renderInputField('Item *', 'item', 'select', '-- Select Item', items)}
                        </div>
                    </div>

                    {/* 2. Transaction Details */}
                    <div style={{
                        backgroundColor: CoffeeColors.FORM_CARD_BG,
                        borderRadius: '6px',
                        padding: '15px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                        border: `1px solid ${CoffeeColors.INPUT_BORDER}`
                    }}>
                        <FormSectionHeader icon={ShoppingBag} title="Transaction Details" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {renderInputField('Quantity (Kgs/Units) *', 'quantity', 'number', 'e.g., 50')}
                            {renderInputField('Rate (UGX/Unit) *', 'rate', 'number', 'e.g., 5000')}
                            {renderInputField('Amount (UGX) *', 'amount', 'number', 'e.g., 250000')}
                            {renderInputField('Payment Method *', 'method_of_payment', 'select', '-- Select Method', paymentMethods)}
                        </div>
                    </div>

                    {/* 3. Payment Date */}
                    <div style={{
                        backgroundColor: CoffeeColors.FORM_CARD_BG,
                        borderRadius: '6px',
                        padding: '15px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                        border: `1px solid ${CoffeeColors.INPUT_BORDER}`
                    }}>
                        <FormSectionHeader icon={Calendar} title="Payment Date" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                            {renderInputField('Date of Payment *', 'date_of_payment', 'date', '')}
                        </div>
                    </div>

                    {/* MODAL FOOTER */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                        marginTop: '15px',
                        paddingTop: '15px',
                        borderTop: `1px solid ${CoffeeColors.INPUT_BORDER}`
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                            style={{
                                background: 'linear-gradient(135deg, #8B4513 0%, #6d3410 100%)',
                            }}
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Submit Sales Record
                        </button>
                    </div>
                </form>
                </div>

                <style>{`
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px) scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                `}</style>
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
    { key: 'date', label: 'Date', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' },
];

function SalesPage() {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
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
        const startIndex = (page - 1) * itemsPerPage;
        const paginatedData = MOCK_SALES.slice(startIndex, startIndex + itemsPerPage);
        setSales(paginatedData);
        setTotalPages(Math.ceil(MOCK_SALES.length / itemsPerPage));
        setLoading(false);
    }, [itemsPerPage]);

    useEffect(() => {
        fetchSales(currentPage);
    }, [fetchSales, currentPage]);

    const sortedSales = useMemo(() => {
        const base = Array.isArray(sales) ? sales : [];
        let sortableItems = [...base];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
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
    
    const handleSalesSubmit = (data) => {
        console.log('New Sales Record Submitted:', data);

        if (editingSale) {
            // Update existing sale
            setSales(prevSales => prevSales.map(s => s.id === editingSale.id ? { ...editingSale, ...data } : s));

            // Also update MOCK_SALES for persistence
            const index = MOCK_SALES.findIndex(s => s.id === editingSale.id);
            if (index > -1) {
                MOCK_SALES[index] = { ...MOCK_SALES[index], ...data };
            }
        } else {
            // Add new sale
            const newSale = {
                id: MOCK_SALES.length > 0 ? Math.max(...MOCK_SALES.map(s => s.id)) + 1 : 1,
                ...data,
                payment_method: data.method_of_payment
            };

            setSales(prevSales => [newSale, ...prevSales]);
            MOCK_SALES.unshift(newSale);
        }

        setIsModalOpen(false);
        setEditingSale(null);

        // Refresh the current page
        fetchSales(currentPage);
    }

    const handleEditSale = (sale) => {
        setEditingSale(sale);
        setIsModalOpen(true);
    };

    const handleDeleteSale = (sale) => {
        setSaleToDelete(sale);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (saleToDelete) {
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
                uniqueCustomers: 0
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

        return {
            totalSales,
            averageOrderValue,
            totalOrders: sales.length,
            uniqueCustomers
        };
    };

    const kpis = KPIs();
    const  KPICards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" stroke={CoffeeColors.SUCCESS_GREEN} />
                        Total Sales
                    </p>
                    <Calendar className="w-4 h-4" stroke={CoffeeColors.GRAY_TEXT} strokeWidth={2.2} />
                </div>
                {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="w-6 h-6 animate-spin text-accent-btn" />
                        <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                ) : (
                    <>
                         <p className="text-4xl font-extrabold text-gray-900 leading-none">UGX {formatUGX(kpis.totalSales)}</p> 
                         <p className="text-xs text-success mt-2 font-medium text-gray-500">Total orders: {kpis.totalOrders}</p> 
                    </>
                )}
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                        <Tag className="w-4 h-4 mr-1" stroke={CoffeeColors.MEDIUM_BROWN} />
                        Average Order Value
                    </p>
                    <Calendar className="w-4 h-4" stroke={CoffeeColors.GRAY_TEXT} strokeWidth={2.2} />
                </div>
                {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="w-6 h-6 animate-spin text-accent-btn" />
                        <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                ) : (
                    <>
                        {/* <p className="text-4xl font-extrabold text-gray-900 leading-none">UGX {formatUGX(kpis.averageOrderValue)}</p> */}
                        <p className="text-xs mt-2 font-medium text-gray-500">Per transaction</p>
                    </>
                )}
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                        <User className="w-4 h-4 mr-1" stroke={CoffeeColors.GRAY_TEXT} />
                        Unique Customers
                    </p>
                    <User className="w-4 h-4 text-gray-500" strokeWidth={2.2} />
                </div>
                {loading ? (
                    <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="w-6 h-6 animate-spin text-accent-btn" />
                        <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                ) : (
                    <>
                        {/* <p className="text-4xl font-extrabold text-gray-900 leading-none">{kpis.uniqueCustomers}</p> */}
                        <p className="text-xs mt-2 font-medium text-gray-500">Registered customers</p>
                    </>
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
            const dateStr = sale.date ? new Date(sale.date).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }) : 'N/A';
            const isCash = sale.payment_method?.toLowerCase() === 'cash';
            
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
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isCash ? 'bg-green-100 text-success' : 'bg-red-100 text-error'}`}>
                            {sale.payment_method || 'N/A'}
                        </span>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600 text-xs">{dateStr}</td>
                    <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center space-x-2">
                            <button
                                onClick={() => handleEditSale(sale)}
                                className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteSale(sale)}
                                className="text-error hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
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