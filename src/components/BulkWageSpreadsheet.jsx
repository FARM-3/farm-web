import { useState, useEffect, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { X, Plus, Trash2, Save, Users } from 'lucide-react';

// Register Handsontable modules
registerAllModules();

const STAFF_API_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/staff/`;
const WAGES_API_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/wages/`;

const CUSTOM_COLORS = {
    headerBg: '#702A0B',
    cardBg: '#F5EEDC',
    actionBg: '#702A0B',
    inputBg: '#FFFFFF',
    inputBorder: '#B8A072',
};

const BulkWageSpreadsheet = ({ isOpen, onClose, onSaveSuccess }) => {
    const hotTableRef = useRef(null);
    const [staff, setStaff] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(true);
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [data, setData] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [showStaffSelector, setShowStaffSelector] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                setLoadingStaff(true);
                const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                const headers = {};
                if (token) headers['Authorization'] = `Token ${token}`;

                const response = await fetch(STAFF_API_ENDPOINT, { headers });
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
            setMessage('');
            setTotalAmount(0);
            setSubmitting(false);
            setSelectedStaff([]);
            setData([]);
            setSearchTerm('');
            setPaymentDate(new Date().toISOString().split('T')[0]);
            fetchStaff();
        }
    }, [isOpen]);

    // Update spreadsheet data when staff selection changes
    useEffect(() => {
        if (selectedStaff.length > 0) {
            const rows = selectedStaff.map(staffId => {
                const staffMember = staff.find(s => (s.staff_id || s.id) === staffId);
                return {
                    staffId: staffId,
                    employeeName: staffMember ? `${staffMember.first_name} ${staffMember.last_name}` : '',
                    daysMissed: 0,
                    monthlySalary: staffMember ? (staffMember.monthly_salary || 0) : 0,
                    amountPaid: staffMember ? (staffMember.monthly_salary || 0) : 0
                };
            });
            setData(rows);
            calculateTotal(rows);
        } else {
            setData([]);
            setTotalAmount(0);
        }
    }, [selectedStaff, staff]);

    const calculateAmountPaid = (monthlySalary, daysMissed) => {
        // Match single wage entry logic: (monthly_pay / 30) * days_worked
        const salary = parseFloat(monthlySalary) || 0;
        const missed = parseFloat(daysMissed) || 0;

        if (salary <= 0) return 0;

        // If no days missed, return full salary (avoids floating point errors)
        if (missed === 0) return salary;

        const dailyRate = salary / 30;
        const daysWorked = 30 - missed;
        const amountPaid = dailyRate * daysWorked;

        // Round to nearest whole number for clean display
        return Math.round(Math.max(0, amountPaid));
    };

    const calculateTotal = (rows) => {
        const total = rows.reduce((sum, row) => {
            return sum + (parseFloat(row.amountPaid) || 0);
        }, 0);
        setTotalAmount(total);
    };

    const handleStaffToggle = (staffId) => {
        setSelectedStaff(prev => {
            if (prev.includes(staffId)) {
                return prev.filter(id => id !== staffId);
            } else {
                return [...prev, staffId];
            }
        });
    };

    const handleSelectAll = () => {
        const filteredStaffIds = getFilteredStaff().map(s => s.staff_id || s.id);
        if (selectedStaff.length === filteredStaffIds.length) {
            setSelectedStaff([]);
        } else {
            setSelectedStaff(filteredStaffIds);
        }
    };

    const getFilteredStaff = () => {
        if (!searchTerm) return staff;
        const term = searchTerm.toLowerCase();
        return staff.filter(s => {
            const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
            return fullName.includes(term) ||
                   s.first_name?.toLowerCase().includes(term) ||
                   s.last_name?.toLowerCase().includes(term);
        });
    };

    // Define columns for Handsontable
    const columns = [
        {
            data: 'employeeName',
            title: 'Employee Name',
            type: 'text',
            readOnly: true,
            className: 'htLeft htMiddle'
        },
        {
            data: 'daysMissed',
            title: 'Days Missed',
            type: 'numeric',
            numericFormat: {
                pattern: '0'
            },
            className: 'htCenter htMiddle'
        },
        {
            data: 'monthlySalary',
            title: 'Monthly Salary (UGX)',
            type: 'numeric',
            numericFormat: {
                pattern: '0,0'
            },
            readOnly: true,
            className: 'htRight htMiddle'
        },
        {
            data: 'amountPaid',
            title: 'Amount Paid (UGX)',
            type: 'numeric',
            numericFormat: {
                pattern: '0,0'
            },
            readOnly: true,
            className: 'htRight htMiddle'
        }
    ];

    const handleAfterChange = (changes, source) => {
        console.log('=== handleAfterChange TRIGGERED ===');
        console.log('Source:', source);
        console.log('Changes:', changes);

        // Skip loadData, internal, and updateData sources
        if (source === 'loadData' || source === 'internal' || source === 'updateData') {
            console.log('Skipping because source is:', source);
            return;
        }

        const hot = hotTableRef.current?.hotInstance;
        if (!hot) {
            console.log('No hot instance available');
            return;
        }

        if (!changes) {
            console.log('No changes detected');
            return;
        }

        console.log('Processing changes - total rows:', hot.countRows());

        // Recalculate amount paid for all rows whenever any change happens
        for (let row = 0; row < hot.countRows(); row++) {
            const daysMissed = parseFloat(hot.getDataAtRowProp(row, 'daysMissed')) || 0;
            const monthlySalary = parseFloat(hot.getDataAtRowProp(row, 'monthlySalary')) || 0;
            const employeeName = hot.getDataAtRowProp(row, 'employeeName');

            // Validate days missed
            let validatedDaysMissed = daysMissed;
            if (validatedDaysMissed < 0) {
                validatedDaysMissed = 0;
            }
            if (validatedDaysMissed > 30) {
                validatedDaysMissed = 30;
            }

            const amountPaid = calculateAmountPaid(monthlySalary, validatedDaysMissed);

            console.log(`Row ${row + 1}: ${employeeName}`);
            console.log(`  - Days Missed: ${validatedDaysMissed}`);
            console.log(`  - Monthly Salary: ${monthlySalary}`);
            console.log(`  - Days Worked: ${30 - validatedDaysMissed}`);
            console.log(`  - Amount Paid: ${amountPaid}`);

            // Update the amount paid cell directly in the table with 'internal' source
            const currentAmount = hot.getDataAtRowProp(row, 'amountPaid');
            if (currentAmount !== amountPaid) {
                hot.setDataAtCell(row, 3, amountPaid, 'internal'); // Column 3 is amountPaid, source='internal'
            }
        }

        // Calculate total from the table data
        let total = 0;
        for (let row = 0; row < hot.countRows(); row++) {
            const amount = parseFloat(hot.getDataAtRowProp(row, 'amountPaid')) || 0;
            total += amount;
        }
        setTotalAmount(total);

        console.log('=== handleAfterChange COMPLETE ===');
    };

    const handleSubmit = async () => {
        const hot = hotTableRef.current?.hotInstance;
        if (!hot || hot.countRows() === 0) {
            setMessage('Please select staff members to record wages');
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
                    const userResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/`, {
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

            // Get data from Handsontable and submit all rows
            const results = [];
            for (let rowIndex = 0; rowIndex < hot.countRows(); rowIndex++) {
                const employeeName = hot.getDataAtRowProp(rowIndex, 'employeeName');
                const daysMissed = parseFloat(hot.getDataAtRowProp(rowIndex, 'daysMissed')) || 0;
                const monthlySalary = parseFloat(hot.getDataAtRowProp(rowIndex, 'monthlySalary')) || 0;
                const amountPaid = parseFloat(hot.getDataAtRowProp(rowIndex, 'amountPaid')) || 0;
                const staffId = data[rowIndex]?.staffId; // Get staffId from original data

                const daysWorked = 30 - daysMissed;

                const payload = {
                    employee_name: employeeName,
                    staff: staffId,
                    date_of_payment: paymentDate,
                    days_worked: daysWorked,
                    days_missed: daysMissed,
                    monthly_pay: monthlySalary || null,
                    amount_paid: amountPaid,
                    deduction: 0,
                    noted_reason: daysMissed > 0 ? `Bulk entry - Days missed: ${daysMissed}` : 'Bulk entry - Full month',
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

    const filteredStaff = getFilteredStaff();

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-center transition-all duration-300 backdrop-blur-sm"
            style={{
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(75, 52, 35, 0.5) 100%)',
            }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-4 my-8 overflow-hidden"
                style={{ maxHeight: '90vh' }}
            >
                {/* Header */}
                <div
                    className="px-6 py-4 flex items-center justify-between border-b-2"
                    style={{ backgroundColor: CUSTOM_COLORS.headerBg, borderColor: CUSTOM_COLORS.inputBorder }}
                >
                    <h2 className="text-2xl font-bold text-white">Bulk Wage Entry</h2>
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
                            {/* Instructions */}
                            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: CUSTOM_COLORS.cardBg }}>
                                <p className="text-sm mb-2" style={{ color: CUSTOM_COLORS.headerBg }}>
                                    <strong>Instructions:</strong>
                                </p>
                                <ol className="text-sm list-decimal list-inside space-y-1" style={{ color: CUSTOM_COLORS.headerBg }}>
                                    <li>Select staff members to pay using the "Select Staff" button</li>
                                    <li>Set the payment date for all wages</li>
                                    <li>Enter days missed for each employee (optional, defaults to 0)</li>
                                    <li>Review the auto-calculated amounts and submit</li>
                                </ol>
                            </div>

                            {/* Payment Date and Staff Selection */}
                            <div className="mb-4 flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold mb-2" style={{ color: CUSTOM_COLORS.headerBg }}>
                                        Payment Date (applies to all wages)
                                    </label>
                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: CUSTOM_COLORS.inputBorder,
                                            backgroundColor: CUSTOM_COLORS.inputBg
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowStaffSelector(!showStaffSelector)}
                                    className="px-4 py-2 rounded-lg font-semibold text-white flex items-center gap-2 hover:opacity-90 transition"
                                    style={{ backgroundColor: CUSTOM_COLORS.actionBg }}
                                >
                                    <Users size={18} />
                                    Select Staff ({selectedStaff.length})
                                </button>
                            </div>

                            {/* Staff Selector Panel */}
                            {showStaffSelector && (
                                <div className="mb-4 border-2 rounded-lg p-4" style={{ borderColor: CUSTOM_COLORS.inputBorder }}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold" style={{ color: CUSTOM_COLORS.headerBg }}>
                                            Select Staff Members ({selectedStaff.length} selected)
                                        </h3>
                                        <button
                                            onClick={handleSelectAll}
                                            className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
                                            style={{ borderColor: CUSTOM_COLORS.inputBorder, color: CUSTOM_COLORS.headerBg }}
                                        >
                                            {selectedStaff.length === filteredStaff.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>

                                    {/* Search */}
                                    <input
                                        type="text"
                                        placeholder="Search staff by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 mb-3 rounded border"
                                        style={{ borderColor: CUSTOM_COLORS.inputBorder }}
                                    />

                                    {/* Staff List */}
                                    <div className="max-h-60 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {filteredStaff.map((s) => {
                                            const staffId = s.staff_id || s.id;
                                            const isSelected = selectedStaff.includes(staffId);
                                            return (
                                                <label
                                                    key={staffId}
                                                    className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50"
                                                    style={{
                                                        backgroundColor: isSelected ? CUSTOM_COLORS.cardBg : 'transparent'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleStaffToggle(staffId)}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-sm" style={{ color: CUSTOM_COLORS.headerBg }}>
                                                        {s.first_name} {s.last_name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Spreadsheet */}
                            {data.length > 0 ? (
                                <div className="mb-4">
                                    <HotTable
                                        ref={hotTableRef}
                                        data={data}
                                        columns={columns}
                                        colHeaders={true}
                                        rowHeaders={true}
                                        width="100%"
                                        height="300"
                                        licenseKey="non-commercial-and-evaluation"
                                        afterChange={handleAfterChange}
                                        afterInit={() => {
                                            console.log('✅ HotTable initialized successfully');
                                            console.log('Rows:', hotTableRef.current?.hotInstance?.countRows());
                                            console.log('Columns:', hotTableRef.current?.hotInstance?.countCols());
                                        }}
                                        beforeChange={(changes, source) => {
                                            console.log('🔄 beforeChange triggered');
                                            console.log('Changes about to be made:', changes);
                                            console.log('Source:', source);

                                            if (!changes) return;

                                            // Validate days missed to max 2 digits
                                            changes.forEach((change, index) => {
                                                const [row, prop, oldValue, newValue] = change;

                                                // Check if this change is to the daysMissed column
                                                if (prop === 'daysMissed' || prop === 1) {
                                                    if (newValue !== null && newValue !== undefined && newValue !== '') {
                                                        // Convert to string to check length
                                                        const valueStr = String(newValue);

                                                        // If more than 2 digits, truncate to first 2 digits
                                                        if (valueStr.length > 2) {
                                                            changes[index][3] = parseInt(valueStr.substring(0, 2));
                                                            console.log(`Days missed truncated from ${valueStr} to ${changes[index][3]}`);
                                                        }
                                                    }
                                                }
                                            });
                                        }}
                                        afterSelection={(row, col, row2, col2) => {
                                            const hot = hotTableRef.current?.hotInstance;
                                            if (hot) {
                                                const prop = hot.colToProp(col);
                                                console.log(`📍 Cell selected: Row ${row}, Column: ${prop}`);
                                            }
                                        }}
                                        afterBeginEditing={(row, col) => {
                                            const hot = hotTableRef.current?.hotInstance;
                                            if (hot) {
                                                const prop = hot.colToProp(col);
                                                const value = hot.getDataAtRowProp(row, prop);
                                                console.log(`✏️ Started editing: Row ${row}, Column: ${prop}, Value: ${value}`);
                                            }
                                        }}
                                        stretchH="all"
                                        autoWrapRow={true}
                                        autoWrapCol={true}
                                    />
                                </div>
                            ) : (
                                <div className="mb-4 p-8 rounded-lg text-center" style={{ backgroundColor: CUSTOM_COLORS.cardBg }}>
                                    <p style={{ color: CUSTOM_COLORS.headerBg }}>
                                        No staff selected. Click "Select Staff" to choose employees to pay.
                                    </p>
                                </div>
                            )}

                            {/* Summary */}
                            {data.length > 0 && (
                                <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: CUSTOM_COLORS.cardBg }}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm" style={{ color: CUSTOM_COLORS.headerBg }}>
                                                Total Staff: {data.length}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold" style={{ color: CUSTOM_COLORS.headerBg }}>
                                                Total Amount: UGX {totalAmount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Message */}
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
                        disabled={submitting || loadingStaff || data.length === 0}
                        className="px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: CUSTOM_COLORS.actionBg }}
                    >
                        <Save size={18} />
                        {submitting ? 'Submitting...' : `Submit ${data.length} Wage(s)`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkWageSpreadsheet;
