import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import NavBar from '../components/NavBar.jsx';

const CUSTOM_COLORS = {
    headerBg: '#702A0B',
    cardBg: '#F5EEDC',
    actionBg: '#702A0B',
    inputBg: '#FFFFFF',
    inputBorder: '#B8A072',
};

function WageEntry() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        employee_name: '',
        date_of_payment: '',
        days_worked: '',
        monthly_pay: '',
        amount_paid: '',
        deduction: '',
        noted_reason: '',
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.employee_name.trim()) newErrors.employee_name = 'Employee name is required';
        if (!form.date_of_payment) newErrors.date_of_payment = 'Date of payment is required';
        if (form.days_worked === '' || isNaN(Number(form.days_worked))) newErrors.days_worked = 'Days worked is required';
        if (form.amount_paid === '' || isNaN(Number(form.amount_paid))) newErrors.amount_paid = 'Amount paid is required';
        if (form.deduction === '' || isNaN(Number(form.deduction))) newErrors.deduction = 'Deduction is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validation = validate();
        setErrors(validation);
        if (Object.keys(validation).length > 0) return;

        try {
            setSubmitting(true);
            const payload = {
                employee_name: form.employee_name,
                date_of_payment: form.date_of_payment,
                days_worked: Number(form.days_worked) || 0,
                monthly_pay: form.monthly_pay === '' ? null : Number(form.monthly_pay),
                amount_paid: Number(form.amount_paid) || 0,
                deduction: Number(form.deduction) || 0,
                noted_reason: form.noted_reason || '',
            };

            const res = await fetch('http://127.0.0.1:8000/api/wages/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Request failed with ${res.status}`);
            }
            navigate('/wages');
        } catch (err) {
            console.error('Failed to save wage:', err);
            setErrors(prev => ({ ...prev, submit: 'Failed to save. Please try again.' }));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
        <NavBar />
        <div className="min-h-screen pt-24 md:pt-32 pb-12 flex justify-center" style={{ backgroundColor: '#FAF7F1' }}>
            <div className="w-full max-w-3xl mt-12 p-6 sm:p-8 rounded-2xl shadow-2xl" style={{ backgroundColor: CUSTOM_COLORS.cardBg, border: `1px solid ${CUSTOM_COLORS.inputBorder}` }}>
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-6" style={{ color: CUSTOM_COLORS.headerBg }}>
                    Wage Entry Form
                </h1>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label htmlFor="employee_name" className="block mb-1 text-sm font-semibold" style={{ color: CUSTOM_COLORS.headerBg }}>Employee Name</label>
                        <Input name="employee_name" value={form.employee_name} onChange={handleChange} placeholder="e.g. John Doe" style={{ backgroundColor: CUSTOM_COLORS.inputBg, borderColor: CUSTOM_COLORS.inputBorder }} />
                        {errors.employee_name && <p className="mt-1 text-xs text-red-600">{errors.employee_name}</p>}
                    </div>
                    <div>
                        <label htmlFor="date_of_payment" className="block mb-1 text-sm font-semibold" style={{ color: CUSTOM_COLORS.headerBg }}>Date of Payment</label>
                        <Input type="date" name="date_of_payment" value={form.date_of_payment} onChange={handleChange} style={{ backgroundColor: CUSTOM_COLORS.inputBg, borderColor: CUSTOM_COLORS.inputBorder }} />
                        {errors.date_of_payment && <p className="mt-1 text-xs text-red-600">{errors.date_of_payment}</p>}
                    </div>
                    <div>
                        <label htmlFor="days_worked" className="block mb-1 text-sm font-semibold" style={{ color: CUSTOM_COLORS.headerBg }}>Days Worked</label>
                        <Input type="number" name="days_worked" value={form.days_worked} onChange={handleChange} placeholder="e.g. 22" style={{ backgroundColor: CUSTOM_COLORS.inputBg, borderColor: CUSTOM_COLORS.inputBorder }} />
                        {errors.days_worked && <p className="mt-1 text-xs text-red-600">{errors.days_worked}</p>}
                    </div>
                    <div>
                        <label htmlFor="monthly_pay" className="block mb-1 text-sm font-semibold" style={{ color: CUSTOM_COLORS.headerBg }}>Monthly Pay</label>
                        <Input type="number" name="monthly_pay" value={form.monthly_pay} onChange={handleChange} placeholder="e.g. 500" style={{ backgroundColor: CUSTOM_COLORS.inputBg, borderColor: CUSTOM_COLORS.inputBorder }} />
                    </div>
                    <div>
                        <label htmlFor="amount_paid" className="block mb-1 text-sm font-semibold" style={{ color: CUSTOM_COLORS.headerBg }}>Amount Paid</label>
                        <Input type="number" name="amount_paid" value={form.amount_paid} onChange={handleChange} placeholder="e.g. 450" style={{ backgroundColor: CUSTOM_COLORS.inputBg, borderColor: CUSTOM_COLORS.inputBorder }} />
                        {errors.amount_paid && <p className="mt-1 text-xs text-red-600">{errors.amount_paid}</p>}
                    </div>
                    <div>
                        <label htmlFor="deduction" className="block mb-1 text-sm font-semibold" style={{ color: CUSTOM_COLORS.headerBg }}>Deduction</label>
                        <Input type="number" name="deduction" value={form.deduction} onChange={handleChange} placeholder="e.g. 50" style={{ backgroundColor: CUSTOM_COLORS.inputBg, borderColor: CUSTOM_COLORS.inputBorder }} />
                        {errors.deduction && <p className="mt-1 text-xs text-red-600">{errors.deduction}</p>}
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="noted_reason" className="block mb-1 text-sm font-semibold" style={{ color: CUSTOM_COLORS.headerBg }}>Note</label>
                        <Input name="noted_reason" value={form.noted_reason} onChange={handleChange} placeholder="Optional reason or note" style={{ backgroundColor: CUSTOM_COLORS.inputBg, borderColor: CUSTOM_COLORS.inputBorder }} />
                    </div>

                    <div className="sm:col-span-2 mt-2">
                        {errors.submit && <p className="mb-2 text-sm text-red-600">{errors.submit}</p>}
                        <Button type="submit" disabled={submitting} className="py-3 font-semibold" style={{ backgroundColor: CUSTOM_COLORS.actionBg, opacity: submitting ? 0.7 : 1 }}>
                            {submitting ? 'Saving...' : 'Submit Wage'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
}

export default WageEntry;
