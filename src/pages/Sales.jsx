 import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, DollarSign, Calendar, Tag, User, TrendingUpIcon, Loader2, ArrowUp, ArrowDown, Edit, Trash2, Search, Filter, ShoppingBag, Truck, X, Plus, Send } from 'lucide-react';

// 💡 IMPORTANT: ADJUST THE PATH BELOW TO YOUR ACTUAL SideNav COMPONENT
import SideNav from '../components/SideNav'; 

// --- MOCK DATA ---
const MOCK_SALES = [
    { id: 1, customer_name: 'Richard Mac', item: 'Coffee', quantity: 70, payment_method: 'Cash', date: '2025-10-22' },
    { id: 2, customer_name: 'Winnie Daisy', item: 'Coffee', quantity: 100, payment_method: 'Cash', date: '2025-10-16' },
    { id: 3, customer_name: 'Emma Mas', item: 'Coffee', quantity: 200, payment_method: 'Cash', date: '2025-10-15' },
    { id: 4, customer_name: 'Jayden Max', item: 'Coffee', quantity: 100, payment_method: 'Cash', date: '2025-10-14' },
    { id: 5, customer_name: 'Latim Mark', item: 'Coffee', quantity: 200, payment_method: 'Mobile Money', date: '2025-10-12' },
    { id: 6, customer_name: 'Sophia Lee', item: 'Coffee', quantity: 85, payment_method: 'Credit Card', date: '2025-10-10' },
    { id: 7, customer_name: 'Liam Chen', item: 'Coffee', quantity: 120, payment_method: 'Cash', date: '2025-10-09' },
    { id: 8, customer_name: 'Aisha Nabaasa', item: 'Vanilla', quantity: 50, payment_method: 'Cash', date: '2025-10-08' },
    { id: 9, customer_name: 'Musa Sempa', item: 'Coffee', quantity: 150, payment_method: 'Mobile Money', date: '2025-10-07' },
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

// --- SALES ENTRY LOGIC ---

const initialFormData = {
    firstName: '', lastName: '', product: '', item: '', quantity: '', rate: '',
    dateOfPayment: '', status: '', balance: '', batchId: '', methodOfPayment: '', amount: ''
};
const products = ['Coffee', 'Banana', 'Rice', 'Wheat', 'Cassava'];
const items = ['Dried', 'Hulled'];
const statuses = ['Paid', 'Pending', 'Partial'];
const paymentMethods = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'];

const useSalesForm = (onSuccess) => {
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateField = (name, value) => {
        switch (name) {
            case 'firstName': case 'lastName':
                return value.trim().length < 2 ? 'Must be at least 2 characters' : '';
            case 'product': case 'item': case 'status': case 'methodOfPayment':
                return !value ? 'This field is required' : '';
            case 'quantity': case 'rate':
                const numVal = parseFloat(value);
                return !value || isNaN(numVal) || numVal <= 0 ? 'Must be a positive number' : '';
            case 'dateOfPayment':
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
            if (key !== 'balance' && key !== 'amount' && key !== 'batchId') {
                const error = validateField(key, formData[key]);
                if (error) {
                    newErrors[key] = error;
                    isFormValid = false;
                }
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

    return { formData, errors, touched, products, items, statuses, paymentMethods, getBorderColor, handleChange, handleBlur, handleSubmit, resetForm };
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

const SalesEntryModal = ({ isOpen, onClose, onSubmit }) => {
    const { formData, errors, products, items, statuses, paymentMethods, getBorderColor, handleChange, handleBlur, handleSubmit } = useSalesForm(onSubmit);

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
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)', 
            zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
            overflowY: 'auto',
            padding: '30px 10px',
        }}>
            <div style={{
                backgroundColor: CoffeeColors.FORM_BG, 
                borderRadius: '8px',
                width: '100%',
                maxWidth: '600px', // *** MEDIUM SIZE ***
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)', 
                position: 'relative',
            }}>
                {/* MODAL HEADER */}
                <div style={{
                    padding: '15px 20px 10px 20px', 
                    borderBottom: `1px solid ${CoffeeColors.INPUT_BORDER}`, 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: CoffeeColors.MODAL_TITLE_TEXT }}>
                        Record New Sale
                    </h2>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', color: CoffeeColors.GRAY_TEXT, cursor: 'pointer', padding: '0' }}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'grid', gap: '15px' }}>
                    
                    {/* 1. Customer Information Section Card */}
                    <div style={{ 
                        backgroundColor: CoffeeColors.FORM_CARD_BG, 
                        borderRadius: '6px', 
                        padding: '15px', 
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)', 
                        border: `1px solid ${CoffeeColors.INPUT_BORDER}`
                    }}>
                        <FormSectionHeader icon={User} title="Customer Information" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {renderInputField('First Name *', 'firstName', 'text', 'John')}
                            {renderInputField('Last Name *', 'lastName', 'text', 'Doe')}
                            {renderInputField('Product *', 'product', 'select', '-- Select Product', products)}
                            {renderInputField('Item Type *', 'item', 'select', '-- Select Item', items)}
                        </div>
                    </div>

                    {/* 2. Transaction Details Section Card */}
                    <div style={{ 
                        backgroundColor: CoffeeColors.FORM_CARD_BG, 
                        borderRadius: '6px', 
                        padding: '15px', 
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)', 
                        border: `1px solid ${CoffeeColors.INPUT_BORDER}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <FormSectionHeader icon={ShoppingBag} title="Transaction Details" />
                            <Button type="modal-primary" className="py-1 px-3 text-xs rounded-md shadow-md">
                                <Plus className="w-3 h-3 mr-1" /> Add Item
                            </Button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {renderInputField('Quantity (Kgs/Units) *', 'quantity', 'number', 'e.g., 50')}
                            {renderInputField('Rate (UGX/Unit) *', 'rate', 'number', 'e.g., 5000')}
                            {renderInputField('Total Amount (UGX)', 'amount', 'readonly', 'Calculated')}
                            {renderInputField('Payment Method *', 'methodOfPayment', 'select', '-- Select Method', paymentMethods)}
                        </div>
                    </div>

                    {/* 3. Payment & Dispatch Status Section Card */}
                    <div style={{ 
                        backgroundColor: CoffeeColors.FORM_CARD_BG, 
                        borderRadius: '6px', 
                        padding: '15px', 
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)', 
                        border: `1px solid ${CoffeeColors.INPUT_BORDER}`
                    }}>
                        <FormSectionHeader icon={Truck} title="Payment & Dispatch Status" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            {renderInputField('Date of Payment *', 'dateOfPayment', 'date', '')}
                            {renderInputField('Status *', 'status', 'select', '-- Select Status', statuses)}
                            {renderInputField('Balance Due (UGX)', 'balance', 'readonly', '0.00')}
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
                        <Button type="modal-secondary" onClick={onClose} className="px-4 py-1.5 text-sm">
                            Cancel
                        </Button>
                        <Button type="modal-primary" className="px-4 py-1.5 text-sm">
                            <Send className="w-3.5 h-3.5 mr-2" />
                            Submit Sales Record
                        </Button>
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
        setIsModalOpen(false);
    }

    const KPICards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
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
            
            <div className="bg-white p-6 rounded-2xl shadow-lg">
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
                        <p className="text-4xl font-extrabold text-gray-900 leading-none">UGX {formatUGX(kpis.averageOrderValue)}</p>
                        <p className="text-xs mt-2 font-medium text-gray-500">Per transaction</p>
                    </>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
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
                        <p className="text-4xl font-extrabold text-gray-900 leading-none">{kpis.uniqueCustomers}</p>
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
                    <td className="px-6 py-3 text-left font-medium text-text-default text-sm">{sale.customer_name || 'N/A'}</td>
                    <td className="px-6 py-3 text-left text-gray-600">{sale.item || 'N/A'}</td>
                    <td className="px-6 py-3 text-center text-gray-600">{sale.quantity || 0}</td>
                    <td className="px-6 py-3 text-left font-medium">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isCash ? 'bg-green-100 text-success' : 'bg-red-100 text-error'}`}>
                            {sale.payment_method || 'N/A'}
                        </span>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-600">{dateStr}</td>
                    <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                            <button 
                                onClick={() => console.log(`Editing sale ${sale.id}`)} 
                                className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => console.log(`Deleting sale ${sale.id}`)} 
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
    
    const mobilePadding = 'p-4 sm:p-6 md:p-8';

    // ----------------------------------------------------
    // *** The SideNav component is now correctly wrapping the main content ***
    // ----------------------------------------------------
    return (
        <SideNav style={{ minHeight: '100vh', backgroundColor: CoffeeColors.SCREEN_BG }}>
            
            {/* The main content area */}
            <main className={`${mobilePadding} pt-0`}>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-default mb-8">
                    Sales Records Overview
                </h2>
                
                <KPICards />

                {/* Action Bar & Filter */}
                <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
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
                        <Button onClick={() => setIsModalOpen(true)} className="py-2 px-4 shadow-xl bg-accent-btn">
                        <button
                            onClick={() => window.location.href = '/sales-entry'}
                            className="py-2 px-4 shadow-xl rounded-xl"
                            style={{ backgroundColor: '#8B4513', color: '#FFFFFF', border: 'none' }}
                        >
                            Record New Sale
                        </Button>
                        <button
                            onClick={() => console.log('Export to Excel')}
                            className="py-2 px-4 shadow-xl rounded-xl"
                            style={{ backgroundColor: '#efebe9', color: '#783A1E', border: 'none' }}
                        >
                            Export to Excel
                        </button>
                    </div>
                </div>

                {/* Sales Records Table Container */}
                <div
                    className="max-w-full w-full mx-auto p-0 shadow-xl rounded-2xl overflow-hidden bg-white transition-all duration-300"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#efebe9', color: '#4A3423' }}>
                                <tr>
                                    {TABLE_HEADERS.map((header) => (
                                        <th
                                            key={header.key}
                                            className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 cursor-pointer ${
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
                            <tbody className="bg-white/80 divide-y divide-gray-100 text-sm text-text-default">
                                {renderTableContent()}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages >= 1 && (
                        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-700">
                                <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="px-4 py-1.5 text-xs rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#efebe9', color: '#783A1E' }}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                    className="px-4 py-1.5 text-xs rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleSalesSubmit}
            />
        </SideNav>
    );
}

export default SalesPage;