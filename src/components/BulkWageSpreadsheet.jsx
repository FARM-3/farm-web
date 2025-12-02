import { useState, useEffect } from 'react';
import Spreadsheet from 'react-spreadsheet';
import { X, Plus, Trash2, Save } from 'lucide-react';

const STAFF_API_ENDPOINT = 'http://142.93.94.236:8000/api/staff/';
const WAGES_API_ENDPOINT = 'http://142.93.94.236:8000/api/wages/';

const CUSTOM_COLORS = {
    headerBg: '#702A0B',
    cardBg: '#F5EEDC',
    actionBg: '#702A0B',
    inputBg: '#FFFFFF',
    inputBorder: '#B8A072',
};

// Add custom styles for the spreadsheet
const spreadsheetStyles = `
    .Spreadsheet {
        width: 100%;
        border-collapse: collapse;
    }
    .Spreadsheet__table {
        border: 2px solid ${CUSTOM_COLORS.inputBorder};
        width: 100%;
    }
    .Spreadsheet__header {
        background-color: ${CUSTOM_COLORS.headerBg};
        color: white;
        font-weight: bold;
        padding: 10px;
        text-align: left;
    }
    .Spreadsheet__cell {
        border: 1px solid ${CUSTOM_COLORS.inputBorder};
        padding: 8px;
        min-width: 120px;
    }
    .Spreadsheet__cell input {
        width: 100%;
        border: none;
        outline: none;
        background: transparent;
        padding: 4px;
    }
    .Spreadsheet__cell--readonly {
        background-color: #f5f5f5;
        color: #666;
    }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = spreadsheetStyles;
    document.head.appendChild(styleSheet);
}

const BulkWageSpreadsheet = ({ isOpen, onClose, onSaveSuccess }) => {
    const [staff, setStaff] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(true);
    const [data, setData] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [showAllStaff, setShowAllStaff] = useState(false);

    // Column headers
    const columnLabels = ['Employee', 'Date of Payment', 'Days Missed', 'Monthly Salary', 'Amount Paid'];

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                setLoadingStaff(true);
                const response = await fetch(STAFF_API_ENDPOINT);
                if (!response.ok) throw new Error('Failed to fetch staff');
                const staffData = await response.json();
                const staffList = Array.isArray(staffData) ? staffData : staffData.results || [];
                setStaff(staffList);
            } catch (err) {
                console.error('Error fetching staff:', err);
                setStaff([]);
            } finally {
                setLoadingStaff(false);
            }
        };

        if (isOpen) {
            // Reset all state when modal opens
            setMessage('');
            setTotalAmount(0);
            setSubmitting(false);
            setShowAllStaff(false);
            fetchStaff();
            // Initialize with 5 empty rows
            initializeRows(5);
        }
    }, [isOpen]);

    const initializeRows = (count) => {
        const today = new Date().toISOString().split('T')[0];
        const rows = [];
        for (let i = 0; i < count; i++) {
            rows.push([
                { value: '' }, // Employee
                { value: today }, // Date of Payment
                { value: 0 }, // Days Missed
                { value: 0, readOnly: true }, // Monthly Salary (auto-filled)
                { value: 0, readOnly: true } // Amount Paid (calculated)
            ]);
        }
        setData(rows);
    };

    const calculateAmountPaid = (monthlySalary, daysMissed) => {
        const salary = parseFloat(monthlySalary) || 0;
        const missed = parseFloat(daysMissed) || 0;
        if (salary <= 0) return 0;
        const dailyRate = salary / 30;
        const daysWorked = 30 - missed;
        const amountPaid = dailyRate * daysWorked;
        return Math.max(0, Math.round(amountPaid / 100) * 100);
    };

    const handleDataChange = (newData) => {
        // Update data with auto-calculations
        const updatedData = newData.map((row) => {
            const employeeName = row[0]?.value || '';
            const daysMissed = parseFloat(row[2]?.value) || 0;

            // Find staff member by name
            const selectedStaff = staff.find(s => {
                const fullName = `${s.first_name} ${s.last_name}`;
                return fullName.toLowerCase() === employeeName.toLowerCase() ||
                       employeeName.toLowerCase().includes(s.first_name.toLowerCase()) ||
                       employeeName.toLowerCase().includes(s.last_name.toLowerCase());
            });

            const monthlySalary = selectedStaff ? (selectedStaff.monthly_salary || selectedStaff.base_pay || 0) : 0;
            const amountPaid = calculateAmountPaid(monthlySalary, daysMissed);

            return [
                row[0], // Employee
                row[1], // Date of Payment
                { ...row[2], value: daysMissed }, // Days Missed
                { value: monthlySalary, readOnly: true }, // Monthly Salary
                { value: amountPaid, readOnly: true } // Amount Paid
            ];
        });

        setData(updatedData);

        // Calculate total amount
        const total = updatedData.reduce((sum, row) => {
            return sum + (parseFloat(row[4]?.value) || 0);
        }, 0);
        setTotalAmount(total);
    };

    const addRow = () => {
        const today = new Date().toISOString().split('T')[0];
        const newRow = [
            { value: '' },
            { value: today },
            { value: 0 },
            { value: 0, readOnly: true },
            { value: 0, readOnly: true }
        ];
        setData([...data, newRow]);
    };

    const removeLastRow = () => {
        if (data.length > 1) {
            setData(data.slice(0, -1));
        }
    };

    const handleSubmit = async () => {
        // Validate data
        const validRows = data.filter(row => {
            const employeeName = row[0]?.value;
            const dateOfPayment = row[1]?.value;
            const daysMissed = row[2]?.value;
            return employeeName && dateOfPayment && daysMissed !== '';
        });

        if (validRows.length === 0) {
            setMessage('Please fill in at least one complete row');
            return;
        }

        setSubmitting(true);
        setMessage('');

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Token ${token}`;

            // Fetch logged-in user's name
            let recordedBy = 'Unknown User';
            try {
                const userPhone = localStorage.getItem('userPhone') || sessionStorage.getItem('userPhone');
                if (userPhone) {
                    const userResponse = await fetch('http://142.93.94.236:8000/api/users/', {
                        headers: token ? { 'Authorization': `Token ${token}` } : {}
                    });
                    if (userResponse.ok) {
                        const users = await userResponse.json();
                        const usersList = Array.isArray(users) ? users : users.results || [];
                        const currentUser = usersList.find(user => user.phone === userPhone);
                        if (currentUser) {
                            recordedBy = currentUser.full_name ||
                                       `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() ||
                                       currentUser.name ||
                                       currentUser.username ||
                                       localStorage.getItem('userName') ||
                                       'Unknown User';
                        }
                    }
                }
            } catch (userErr) {
                console.error('Error fetching user:', userErr);
                recordedBy = localStorage.getItem('userName') || 'Unknown User';
            }

            // Submit all valid rows
            const results = [];
            for (const row of validRows) {
                const employeeName = row[0]?.value;
                const dateOfPayment = row[1]?.value;
                const daysMissed = parseFloat(row[2]?.value) || 0;
                const monthlySalary = parseFloat(row[3]?.value) || 0;
                const amountPaid = parseFloat(row[4]?.value) || 0;

                // Find staff member by name
                const selectedStaff = staff.find(s => {
                    const fullName = `${s.first_name} ${s.last_name}`;
                    return fullName.toLowerCase() === employeeName.toLowerCase() ||
                           employeeName.toLowerCase().includes(s.first_name.toLowerCase()) ||
                           employeeName.toLowerCase().includes(s.last_name.toLowerCase());
                });

                const daysWorked = 30 - daysMissed;

                const payload = {
                    employee_name: employeeName,
                    staff: selectedStaff?.staff_id || selectedStaff?.id || null,
                    date_of_payment: dateOfPayment,
                    days_worked: daysWorked,
                    days_missed: daysMissed,
                    monthly_pay: monthlySalary || null,
                    amount_paid: amountPaid,
                    deduction: 0,
                    noted_reason: `Bulk entry - Days missed: ${daysMissed}`,
                    recorded_by: recordedBy,
                };

                try {
                    const response = await fetch(WAGES_API_ENDPOINT, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(payload),
                    });

                    if (response.ok) {
                        const savedData = await response.json();
                        results.push({ success: true, data: savedData, employee: employeeName });
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        results.push({
                            success: false,
                            error: errorData.detail || 'Failed to save',
                            employee: employeeName
                        });
                    }
                } catch (err) {
                    results.push({
                        success: false,
                        error: err.message,
                        employee: employeeName
                    });
                }
            }

            // Show results
            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;

            if (successCount > 0 && failCount === 0) {
                setMessage(`Successfully recorded ${successCount} wage(s)!`);
                setTimeout(() => {
                    onSaveSuccess();
                    onClose();
                }, 1500);
            } else if (successCount > 0 && failCount > 0) {
                setMessage(`Recorded ${successCount} wage(s), but ${failCount} failed.`);
            } else {
                setMessage('Failed to record wages. Please check the data and try again.');
            }

        } catch (err) {
            console.error('Bulk recording error:', err);
            setMessage('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-center transition-all duration-300 backdrop-blur-sm"
            style={{
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(75, 52, 35, 0.5) 100%)',
            }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 my-8 overflow-hidden"
                style={{ maxHeight: '90vh' }}
            >
                {/* Header */}
                <div
                    className="px-6 py-4 flex items-center justify-between border-b-2"
                    style={{ backgroundColor: CUSTOM_COLORS.headerBg, borderColor: CUSTOM_COLORS.inputBorder }}
                >
                    <h2 className="text-2xl font-bold text-white">Bulk Wage Entry - Spreadsheet</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    {loadingStaff ? (
                        <div className="text-center py-8">
                            <p style={{ color: CUSTOM_COLORS.headerBg }}>Loading staff data...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <p className="text-sm mb-2" style={{ color: CUSTOM_COLORS.headerBg }}>
                                    <strong>Instructions:</strong> Enter employee names in the first column. Enter days missed (the system will auto-calculate amount paid based on monthly salary).
                                </p>
                                <div className="mb-2">
                                    <p className="text-sm font-semibold mb-2" style={{ color: CUSTOM_COLORS.headerBg }}>
                                        Available Staff ({staff.length} total):
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-xs" style={{ color: CUSTOM_COLORS.headerBg }}>
                                        {(showAllStaff ? staff : staff.slice(0, 10)).map((s, idx) => (
                                            <span key={idx} className="px-2 py-1 rounded" style={{ backgroundColor: CUSTOM_COLORS.cardBg }}>
                                                {s.first_name} {s.last_name}
                                            </span>
                                        ))}
                                    </div>
                                    {staff.length > 10 && (
                                        <button
                                            onClick={() => setShowAllStaff(!showAllStaff)}
                                            className="mt-2 text-xs underline hover:no-underline"
                                            style={{ color: CUSTOM_COLORS.actionBg }}
                                        >
                                            {showAllStaff ? 'Show Less' : `View All ${staff.length} Staff Members`}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4 overflow-x-auto">
                                <Spreadsheet
                                    data={data}
                                    onChange={handleDataChange}
                                    columnLabels={columnLabels}
                                    className="border rounded"
                                />
                            </div>

                            <div className="flex gap-3 mb-4">
                                <button
                                    onClick={addRow}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition"
                                    style={{ backgroundColor: CUSTOM_COLORS.actionBg }}
                                >
                                    <Plus size={18} />
                                    Add Row
                                </button>
                                <button
                                    onClick={removeLastRow}
                                    disabled={data.length <= 1}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        borderColor: CUSTOM_COLORS.inputBorder,
                                        color: CUSTOM_COLORS.headerBg
                                    }}
                                >
                                    <Trash2 size={18} />
                                    Remove Row
                                </button>
                            </div>

                            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: CUSTOM_COLORS.cardBg }}>
                                <p className="text-lg font-bold" style={{ color: CUSTOM_COLORS.headerBg }}>
                                    Total Amount to be Paid: UGX {totalAmount.toLocaleString()}
                                </p>
                            </div>

                            {message && (
                                <div
                                    className="mb-4 p-3 rounded-lg text-sm font-semibold text-center"
                                    style={{
                                        backgroundColor: message.includes('Successfully') ? '#E8F5E8' : '#FFEBEE',
                                        color: message.includes('Successfully') ? '#2E7D32' : '#C62828',
                                        border: `1px solid ${message.includes('Successfully') ? '#4CAF50' : '#F44336'}`
                                    }}
                                >
                                    {message}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="px-6 py-4 border-t-2 flex justify-end gap-3"
                    style={{ borderColor: CUSTOM_COLORS.inputBorder }}
                >
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-semibold border-2 hover:bg-gray-50 transition"
                        style={{
                            borderColor: CUSTOM_COLORS.inputBorder,
                            color: CUSTOM_COLORS.headerBg
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || loadingStaff}
                        className="px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: CUSTOM_COLORS.actionBg }}
                    >
                        <Save size={18} />
                        {submitting ? 'Submitting...' : 'Submit All Wages'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkWageSpreadsheet;
