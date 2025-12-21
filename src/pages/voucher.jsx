import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, Download } from 'lucide-react';
import { generateAndDownloadVoucher, generateQRCode, numberToWords, formatCurrency } from '../utils/voucherGeneration';

const WAGES_API_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/wages/`;

function getVoucherIdFromUrl(location) {
  const params = new URLSearchParams(location.search);
  return params.get('id');
}

function generateVoucherNumber(wage) {
  if (!wage) return '';
  const date = wage.date_of_payment || wage.date || '';
  const year = date ? new Date(date).getFullYear() : 'XXXX';
  return `WV-${year}-${String(wage.id).padStart(4, '0')}`;
}

export default function WageVoucher() {
  const location = useLocation();
  const navigate = useNavigate();
  const [wage, setWage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const fetchWage = async () => {
      setLoading(true);
      setError(null);
      const id = getVoucherIdFromUrl(location);
      if (!id) {
        setError('No wage ID provided in URL.');
        setLoading(false);
        return;
      }
      try {
        const authToken = localStorage.getItem('authToken');
        const headers = authToken ? { 'Authorization': `Token ${authToken}` } : {};

        const response = await fetch(`${WAGES_API_ENDPOINT}${id}/`, { headers });
        if (!response.ok) throw new Error(`Wage not found (HTTP ${response.status})`);
        const data = await response.json();

        // Debug: Log the wage data to see what fields are available
        console.log('📊 Wage Record Data:', data);
        console.log('🆔 Staff ID field:', data.staff_id);
        console.log('👤 Staff field:', data.staff);
        console.log('📝 Employee ID field:', data.employee_id);

        setWage(data);

        // Generate QR code
        const qrCode = await generateQRCode(data.id);
        setQrCodeUrl(qrCode);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWage();
  }, [location]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!wage) return;

    setDownloading(true);
    try {
      await generateAndDownloadVoucher(wage);
    } catch (error) {
      console.error('Error generating voucher PDF:', error);
      alert('Failed to download voucher. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading voucher...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!wage) return null;

  const voucherNumber = generateVoucherNumber(wage);
  const daysWorked = 30 - (wage.days_missed || 0);
  const amountInWords = numberToWords(wage.amount_paid);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              ← Back
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition"
            >
              <Printer size={20} />
              Print Voucher
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>

        <div id="voucher" className="bg-white p-12 rounded-lg shadow-lg" style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <img
                src="/logo.jpg"
                alt="Rugyeyo Farm Logo"
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold mb-1" style={{ color: '#702A0B', letterSpacing: '0.5px' }}>
                  RUGYEYO FARM
                </h1>
                <p className="text-sm text-gray-600">Coffee Production & Processing</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold mb-1" style={{ color: '#702A0B' }}>VOUCHER</p>
              <p className="text-xs text-gray-600">No: {voucherNumber}</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8 py-4" style={{ backgroundColor: '#F5EEDC', borderRadius: '8px' }}>
            <h2 className="text-2xl font-bold" style={{ color: '#702A0B' }}>
              WAGE PAYMENT VOUCHER
            </h2>
          </div>

          {/* Employee Information */}
          <div className="mb-6" style={{ backgroundColor: '#FEFBF8', padding: '20px', borderRadius: '8px', border: '1px solid #E8DCC8' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: '#702A0B' }}>
              Employee Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Employee Name:</p>
                <p className="text-base font-semibold" style={{ color: '#333' }}>{wage.employee_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Employee ID:</p>
                <p className="text-base font-semibold" style={{ color: '#333' }}>
                  {wage.staff_id || wage.staff || wage.employee_id || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Position:</p>
                <p className="text-base font-semibold" style={{ color: '#333' }}>{wage.position || 'Staff'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Pay Period:</p>
                <p className="text-base font-semibold" style={{ color: '#333' }}>Monthly</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6" style={{ backgroundColor: '#FEFBF8', padding: '20px', borderRadius: '8px', border: '1px solid #E8DCC8' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: '#702A0B' }}>
              Payment Details
            </h3>
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600">Date of Payment:</td>
                  <td className="py-3 text-right font-semibold" style={{ color: '#333' }}>
                    {wage.date_of_payment ? new Date(wage.date_of_payment).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600">Days Worked:</td>
                  <td className="py-3 text-right font-semibold" style={{ color: '#333' }}>{daysWorked} days</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600">Monthly Salary:</td>
                  <td className="py-3 text-right font-semibold" style={{ color: '#333' }}>{formatCurrency(wage.monthly_salary)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Amount */}
          <div className="mb-6 p-6" style={{ backgroundColor: '#702A0B', borderRadius: '8px' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-white">Total Amount Paid:</span>
              <span className="text-2xl font-bold text-white">{formatCurrency(wage.amount_paid)}</span>
            </div>
            <p className="text-sm italic text-white mt-2">
              {amountInWords} Shillings Only
            </p>
          </div>

          {/* QR Code Section */}
          {qrCodeUrl && (
            <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
              <img
                src={qrCodeUrl}
                alt="Verification QR Code"
                className="mx-auto mb-3"
                style={{ width: '120px', height: '120px', border: '3px solid #702A0B', borderRadius: '8px', padding: '8px', background: 'white' }}
              />
              <p className="text-xs font-semibold mb-1" style={{ color: '#702A0B' }}>Scan to Verify</p>
              <p className="text-xs text-gray-600">
                Scan this QR code to verify voucher authenticity
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs italic text-gray-500">
              This is an official wage payment voucher from Rugyeyo Farm
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Namayumba, Wakiso District, Uganda | Tel: +256772701051
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          #voucher {
            box-shadow: none;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
}
