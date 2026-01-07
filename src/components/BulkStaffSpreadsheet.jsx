import { useState, useEffect, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { LOCATION_DATA as COMPREHENSIVE_LOCATION_DATA, PARISHES_BY_SUB_COUNTY as COMPREHENSIVE_PARISHES } from '../data/uganda-location-data';

// Register Handsontable modules
registerAllModules();

const STAFF_API_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/staff/`;

const CUSTOM_COLORS = {
    headerBg: '#702A0B',
    cardBg: '#F5EEDC',
    actionBg: '#702A0B',
    inputBg: '#FFFFFF',
    inputBorder: '#B8A072',
};

// Use comprehensive Uganda location data (all districts, sub-counties, and parishes)
const LOCATION_DATA = COMPREHENSIVE_LOCATION_DATA;
const PARISHES_BY_SUB_COUNTY = COMPREHENSIVE_PARISHES;

// All Uganda Districts - extracted from comprehensive data
const ALL_DISTRICTS = Object.keys(LOCATION_DATA).sort();

const BulkStaffSpreadsheet = ({ isOpen, onClose, onSaveSuccess }) => {
    const hotTableRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);
    const today = new Date().toISOString().split('T')[0];

    // Initial data with 5 rows
    const [data, setData] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setMessage('');
            setTotalRecords(0);
            setSubmitting(false);
            initializeRows(5);
        }
    }, [isOpen]);

    const initializeRows = (count) => {
        const rows = [];
        for (let i = 0; i < count; i++) {
            rows.push({
                firstName: '',
                lastName: '',
                gender: '',
                nin: '',
                district: '',
                subCounty: '',
                parish: '',
                village: '',
                employmentStatus: '',
                monthlySalary: '',
                hireDate: today
            });
        }
        setData(rows);
    };

    const getSubCountiesForDistrict = (district) => {
        return LOCATION_DATA[district] || [];
    };

    const getParishesForSubCounty = (subCounty) => {
        return PARISHES_BY_SUB_COUNTY[subCounty] || [];
    };

    const getNINPrefix = (gender) => {
        if (gender === 'Male') return 'CM';
        if (gender === 'Female') return 'CF';
        return '';
    };

    const columns = [
        { data: 'firstName', title: 'First Name', type: 'text' },
        { data: 'lastName', title: 'Last Name', type: 'text' },
        {
            data: 'gender',
            title: 'Gender',
            type: 'dropdown',
            source: ['Male', 'Female']
        },
        {
            data: 'nin',
            title: 'NIN (max 14 chars)',
            type: 'text',
            placeholder: 'Just type the numbers',
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
                const gender = instance.getDataAtRowProp(row, 'gender');
                if (!gender) {
                    td.style.backgroundColor = '#fff3cd';
                    td.innerHTML = '<span style="color: #856404; font-style: italic;">Select gender first</span>';
                } else if (value) {
                    // Always show with prefix in display mode
                    const prefix = value.substring(0, 2);
                    const numbers = value.substring(2);
                    if (prefix === 'CM' || prefix === 'CF') {
                        td.innerHTML = `<span style="color: #666; font-weight: bold;">${prefix}</span>${numbers}`;
                    } else {
                        // If no prefix yet, show what they typed
                        td.innerHTML = value;
                    }
                } else {
                    td.innerHTML = '';
                }
                return td;
            }
        },
        {
            data: 'district',
            title: 'District',
            type: 'dropdown',
            source: ALL_DISTRICTS
        },
        {
            data: 'subCounty',
            title: 'Sub-County',
            type: 'dropdown',
            allowInvalid: true,
            source: function(query, process) {
                const row = this.row;
                const district = this.instance.getDataAtRowProp(row, 'district');
                const subCounties = getSubCountiesForDistrict(district);
                process(subCounties);
            }
        },
        {
            data: 'parish',
            title: 'Parish',
            type: 'dropdown',
            allowInvalid: true,
            source: function(query, process) {
                const row = this.row;
                const subCounty = this.instance.getDataAtRowProp(row, 'subCounty');
                const parishes = getParishesForSubCounty(subCounty);
                process(parishes);
            }
        },
        { data: 'village', title: 'Village', type: 'text' },
        {
            data: 'employmentStatus',
            title: 'Employment Status',
            type: 'dropdown',
            source: ['Full-time', 'Part-time', 'Contract', 'Seasonal']
        },
        {
            data: 'monthlySalary',
            title: 'Monthly Salary (UGX)',
            type: 'numeric',
            numericFormat: {
                pattern: '0,0',
                culture: 'en-US'
            },
            placeholder: 'e.g., 500,000',
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
                // Format the number with commas
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
                    if (!isNaN(numValue)) {
                        td.innerHTML = numValue.toLocaleString('en-US');
                    } else {
                        td.innerHTML = '';
                    }
                } else {
                    td.innerHTML = '';
                }
                td.style.textAlign = 'right';
                return td;
            }
        },
        { data: 'hireDate', title: 'Hire Date', type: 'date', dateFormat: 'YYYY-MM-DD' }
    ];

    const handleBeforeChange = (changes, source) => {
        if (!changes) return;

        const hot = hotTableRef.current?.hotInstance;
        if (!hot) return;

        changes.forEach((change) => {
            const [row, prop, oldValue, newValue] = change;

            // Handle NIN field - automatically add prefix based on gender
            if (prop === 'nin') {
                // Skip if no value
                if (!newValue && newValue !== '') {
                    return;
                }

                const gender = hot.getDataAtRowProp(row, 'gender');
                const prefix = getNINPrefix(gender);

                let processedValue = String(newValue).trim();

                // If empty, allow it
                if (processedValue === '') {
                    return;
                }

                // If we have a gender/prefix, add it to the numbers
                if (prefix) {
                    // Remove any existing CM/CF prefix
                    let numbersOnly = processedValue.replace(/^(CM|CF)/i, '').trim();

                    // Build the full NIN with prefix
                    processedValue = prefix + numbersOnly;
                }

                // ALWAYS enforce 14 character maximum
                if (processedValue.length > 14) {
                    processedValue = processedValue.substring(0, 14);
                }

                // Update the change value
                change[3] = processedValue;
            }

            // Handle gender change - update NIN prefix
            if (prop === 'gender' && newValue) {
                const currentNIN = hot.getDataAtRowProp(row, 'nin');
                const newPrefix = getNINPrefix(newValue);

                if (currentNIN) {
                    // Remove old prefix and add new one
                    const cleanNIN = String(currentNIN).replace(/^(CM|CF)/i, '').trim();
                    if (newPrefix) {
                        if (cleanNIN) {
                            hot.setDataAtRowProp(row, 'nin', newPrefix + cleanNIN);
                        } else {
                            hot.setDataAtRowProp(row, 'nin', newPrefix);
                        }
                    }
                } else if (newPrefix) {
                    // If no NIN exists, just set the prefix
                    hot.setDataAtRowProp(row, 'nin', newPrefix);
                }
            }
        });
    };

    const handleBeforeKeyDown = (event) => {
        const hot = hotTableRef.current?.hotInstance;
        if (!hot) return;

        const selected = hot.getSelected();
        if (!selected || selected.length === 0) return;

        const [row, col] = selected[0];
        const prop = hot.colToProp(col);

        // Only apply to NIN column
        if (prop === 'nin') {
            // Get the active editor to check the current editing value
            const editor = hot.getActiveEditor();
            let currentValue = '';

            // If editor is active, get the value from the editor's input
            if (editor && editor.isOpened()) {
                const editorElement = editor.TEXTAREA || editor.textareaElement;
                if (editorElement) {
                    currentValue = editorElement.value || '';
                }
            } else {
                // If not editing yet, get the cell value
                currentValue = hot.getDataAtRowProp(row, 'nin') || '';
            }

            // Allow backspace, delete, arrow keys, tab, enter, etc.
            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Escape'];

            // If the current value is already 14 characters or more, prevent new character input
            if (currentValue.length >= 14 && !allowedKeys.includes(event.key) && !event.ctrlKey && !event.metaKey) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        }
    };

    const handleAfterChange = (changes, source) => {
        if (source === 'loadData') return;

        const hot = hotTableRef.current?.hotInstance;
        if (!hot) return;

        // Handle cascading dropdowns and gender selection
        if (changes) {
            changes.forEach(([row, prop, oldValue, newValue]) => {
                // If gender is selected, automatically set NIN prefix
                if (prop === 'gender' && newValue) {
                    const prefix = getNINPrefix(newValue);
                    const currentNIN = hot.getDataAtRowProp(row, 'nin');

                    // If NIN is empty or doesn't have the correct prefix, set it
                    if (!currentNIN || currentNIN.length === 0) {
                        hot.setDataAtRowProp(row, 'nin', prefix);
                    } else if (currentNIN) {
                        // Replace the prefix if it already exists
                        const cleanNIN = String(currentNIN).replace(/^(CM|CF)/i, '').trim();
                        hot.setDataAtRowProp(row, 'nin', prefix + cleanNIN);
                    }
                }
                // If district changed, clear sub-county and parish
                else if (prop === 'district' && oldValue !== newValue) {
                    hot.setDataAtRowProp(row, 'subCounty', '');
                    hot.setDataAtRowProp(row, 'parish', '');
                }
                // If sub-county changed, clear parish
                else if (prop === 'subCounty' && oldValue !== newValue) {
                    hot.setDataAtRowProp(row, 'parish', '');
                }
            });
        }

        // Update total valid records count
        const allData = hot.getData();
        const validCount = allData.filter(row => {
            return row[0] && row[1] && row[2] && row[3]; // firstName, lastName, gender, nin
        }).length;
        setTotalRecords(validCount);
    };

    const addRows = () => {
        const hot = hotTableRef.current?.hotInstance;
        if (hot) {
            const newRows = [];
            for (let i = 0; i < 5; i++) {
                newRows.push({
                    firstName: '',
                    lastName: '',
                    gender: '',
                    nin: '',
                    district: '',
                    subCounty: '',
                    parish: '',
                    village: '',
                    employmentStatus: '',
                    monthlySalary: '',
                    hireDate: today
                });
            }
            const currentData = hot.getData();
            setData([...data, ...newRows]);
        }
    };

    const removeLastRow = () => {
        const hot = hotTableRef.current?.hotInstance;
        if (hot && data.length > 1) {
            const newData = data.slice(0, -1);
            setData(newData);
        }
    };

    const validateNIN = (fullNIN) => {
        return /^(CM|CF)[A-Z0-9]{9,14}$/i.test(fullNIN);
    };

    const handleSubmit = async () => {
        const hot = hotTableRef.current?.hotInstance;
        if (!hot) return;

        const allData = hot.getSourceData();

        // Filter valid rows
        const validRows = allData.filter(row => {
            return row.firstName && row.lastName && row.gender && row.nin;
        });

        if (validRows.length === 0) {
            setMessage('Please fill in at least one complete row with First Name, Last Name, Gender, and NIN');
            return;
        }

        // Validate all rows
        const validationErrors = [];
        validRows.forEach((row, index) => {
            const errors = [];
            // NIN should already have the prefix from beforeChange
            const fullNIN = row.nin;

            if (!row.firstName || row.firstName.length < 2) errors.push('First name required (min 2 chars)');
            if (!row.lastName || row.lastName.length < 2) errors.push('Last name required (min 2 chars)');
            if (!row.gender || !['Male', 'Female'].includes(row.gender)) errors.push('Gender must be Male or Female');
            if (!row.nin || !validateNIN(fullNIN)) errors.push('Invalid NIN format (should start with CM/CF)');
            if (!row.district || !ALL_DISTRICTS.includes(row.district)) errors.push('Invalid district');
            if (!row.subCounty) errors.push('Sub-county required');

            // Only validate sub-county against list if district has detailed data
            if (row.district && row.subCounty && LOCATION_DATA[row.district]) {
                const validSubCounties = getSubCountiesForDistrict(row.district);
                if (validSubCounties.length > 0 && !validSubCounties.includes(row.subCounty)) {
                    errors.push(`Sub-county "${row.subCounty}" is not valid for district "${row.district}"`);
                }
            }

            if (!row.parish) errors.push('Parish required');

            // Only validate parish against list if sub-county has detailed data
            if (row.subCounty && row.parish && PARISHES_BY_SUB_COUNTY[row.subCounty]) {
                const validParishes = getParishesForSubCounty(row.subCounty);
                if (validParishes.length > 0 && !validParishes.includes(row.parish)) {
                    errors.push(`Parish "${row.parish}" is not valid for sub-county "${row.subCounty}"`);
                }
            }

            if (!row.village || row.village.length < 2) errors.push('Village required (min 2 chars)');
            if (!row.employmentStatus || !['Full-time', 'Part-time', 'Contract', 'Seasonal'].includes(row.employmentStatus)) {
                errors.push('Invalid employment status');
            }
            if (!row.hireDate) errors.push('Hire date required');

            if (errors.length > 0) {
                validationErrors.push(`Row ${index + 1}: ${errors.join(', ')}`);
            }
        });

        if (validationErrors.length > 0) {
            setMessage(`Validation errors:\n${validationErrors.join('\n')}`);
            return;
        }

        setSubmitting(true);
        setMessage('');

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Token ${token}`;

            const results = [];
            for (const row of validRows) {
                // NIN already has the prefix from beforeChange hook
                const fullNIN = row.nin.toUpperCase();

                const payload = {
                    first_name: row.firstName,
                    last_name: row.lastName,
                    gender: row.gender,
                    nin: fullNIN,
                    district: row.district,
                    sub_county: row.subCounty,
                    parish: row.parish,
                    village: row.village,
                    employment_type: row.employmentStatus,  // API expects 'employment_type' not 'employment_status'
                    monthly_salary: row.monthlySalary ? parseFloat(row.monthlySalary) : null,
                    date_hired: row.hireDate,
                };

                try {
                    const response = await fetch(STAFF_API_ENDPOINT, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(payload),
                    });

                    if (response.ok) {
                        const savedData = await response.json();
                        results.push({ success: true, data: savedData, name: `${row.firstName} ${row.lastName}` });
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        console.error('API Error Response:', response.status, errorData);

                        // Extract detailed error message
                        let errorMessage = 'Failed to save';
                        if (errorData.detail) {
                            errorMessage = errorData.detail;
                        } else if (errorData.nin && Array.isArray(errorData.nin)) {
                            errorMessage = `NIN: ${errorData.nin.join(', ')}`;
                        } else if (typeof errorData === 'object') {
                            // Try to extract any error messages from the response
                            const errorFields = Object.keys(errorData);
                            if (errorFields.length > 0) {
                                errorMessage = errorFields.map(field => {
                                    const msg = Array.isArray(errorData[field]) ? errorData[field].join(', ') : errorData[field];
                                    return `${field}: ${msg}`;
                                }).join('; ');
                            }
                        }

                        results.push({
                            success: false,
                            error: errorMessage,
                            name: `${row.firstName} ${row.lastName}`
                        });
                    }
                } catch (err) {
                    results.push({
                        success: false,
                        error: err.message,
                        name: `${row.firstName} ${row.lastName}`
                    });
                }
            }

            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;

            if (successCount > 0 && failCount === 0) {
                setMessage(`Successfully registered ${successCount} staff member(s)!`);
                setTimeout(() => {
                    onSaveSuccess();
                    onClose();
                }, 1500);
            } else if (successCount > 0 && failCount > 0) {
                const failedStaff = results.filter(r => !r.success).map(r => `${r.name}: ${r.error}`).join('\n');
                setMessage(`Registered ${successCount} staff member(s), but ${failCount} failed:\n${failedStaff}`);
            } else {
                const failedStaff = results.filter(r => !r.success).map(r => `${r.name}: ${r.error}`).join('\n');
                setMessage(`Failed to register staff:\n${failedStaff}`);
            }

        } catch (err) {
            console.error('Bulk registration error:', err);
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-4 my-8 overflow-hidden"
                style={{ maxHeight: '90vh' }}
            >
                {/* Header */}
                <div
                    className="px-6 py-4 flex items-center justify-between border-b-2"
                    style={{ backgroundColor: CUSTOM_COLORS.headerBg, borderColor: CUSTOM_COLORS.inputBorder }}
                >
                    <h2 className="text-2xl font-bold text-white">Bulk Staff Registration - Spreadsheet</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    <div className="mb-4">
                        <p className="text-sm mb-2 font-semibold" style={{ color: CUSTOM_COLORS.headerBg }}>
                            Instructions: Select gender first, then just type the NIN numbers (CM/CF prefix added automatically)
                        </p>
                        <div className="mb-2 p-3 rounded-lg" style={{ backgroundColor: CUSTOM_COLORS.cardBg }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: CUSTOM_COLORS.headerBg }}>
                                Important Steps:
                            </p>
                            <ul className="text-xs space-y-1" style={{ color: CUSTOM_COLORS.headerBg }}>
                                <li>• <strong>Step 1:</strong> Select Gender from dropdown (Male or Female)</li>
                                <li>• <strong>Step 2:</strong> In NIN field, just type the NUMBERS ONLY (e.g., 1234567890123)</li>
                                <li>• <strong>Step 3:</strong> The system automatically adds CM (Male) or CF (Female) prefix</li>
                                <li>• <strong>Step 4:</strong> Select District, then Sub-County, then Parish (cascading dropdowns)</li>
                                <li>• <strong>Example:</strong> Gender: Female → Type: 1234567890123 → Displays as: CF1234567890123</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mb-4 overflow-x-auto" style={{ border: `2px solid ${CUSTOM_COLORS.inputBorder}`, borderRadius: '8px' }}>
                        <HotTable
                            ref={hotTableRef}
                            data={data}
                            columns={columns}
                            colHeaders={true}
                            rowHeaders={true}
                            width="100%"
                            height="400"
                            licenseKey="non-commercial-and-evaluation"
                            beforeChange={handleBeforeChange}
                            afterChange={handleAfterChange}
                            beforeKeyDown={handleBeforeKeyDown}
                            stretchH="all"
                            autoWrapRow={true}
                            autoWrapCol={true}
                        />
                    </div>

                    <div className="flex gap-3 mb-4">
                        <button
                            onClick={addRows}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition"
                            style={{ backgroundColor: CUSTOM_COLORS.actionBg }}
                        >
                            <Plus size={18} />
                            Add 5 Rows
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
                            Total Valid Records: {totalRecords}
                        </p>
                    </div>

                    {message && (
                        <div
                            className="mb-4 p-3 rounded-lg text-sm font-semibold whitespace-pre-line"
                            style={{
                                backgroundColor: message.includes('Successfully') ? '#E8F5E8' : '#FFEBEE',
                                color: message.includes('Successfully') ? '#2E7D32' : '#C62828',
                                border: `1px solid ${message.includes('Successfully') ? '#4CAF50' : '#F44336'}`
                            }}
                        >
                            {message}
                        </div>
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
                        disabled={submitting}
                        className="px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: CUSTOM_COLORS.actionBg }}
                    >
                        <Save size={18} />
                        {submitting ? 'Submitting...' : 'Submit All Staff'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkStaffSpreadsheet;
