import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { XCircle, Calendar, User, DollarSign, Hash, Briefcase, Download } from 'lucide-react';
import { generateAndDownloadVoucher } from '../utils/voucherGeneration';

const WAGES_API_ENDPOINT = `${import.meta.env.VITE_API_URL || 'http://142.93.94.236:8000'}/api/wages/`;

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

function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'UGX 0';
  return `UGX ${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function VoucherVerification() {
  const location = useLocation();
  const [wage, setWage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchWage = async () => {
      setLoading(true);
      setError(null);
      const id = getVoucherIdFromUrl(location);

      if (!id) {
        setError('No voucher ID provided in URL.');
        setLoading(false);
        return;
      }

      try {
        // No authentication required for verification
        const response = await fetch(`${WAGES_API_ENDPOINT}${id}/`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Voucher not found. This voucher may not exist or has been deleted.');
          } else {
            setError(`Unable to verify voucher (Error ${response.status})`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setWage(data);
      } catch (err) {
        setError('Unable to connect to verification service. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchWage();
  }, [location]);

  const handleDownload = async () => {
    if (!wage) return;

    setDownloading(true);
    try {
      await generateAndDownloadVoucher(wage);
    } catch (error) {
      console.error('Error downloading voucher:', error);
      alert('Failed to download voucher. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-700 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verifying voucher...</p>
        </div>
      </div>
    );
  }

  if (error || !wage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h1>
            <p className="text-gray-600">{error || 'Unable to verify this voucher.'}</p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm text-red-800">
              <strong>Important:</strong> This voucher could not be verified. Please contact Rugyeyo Farm directly to confirm its authenticity.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <img src="/logo.png" alt="Rugyeyo Farm" className="w-16 h-16 mx-auto mb-2 object-contain" />
            <p className="text-sm text-gray-600">Rugyeyo Farm</p>
            <p className="text-xs text-gray-500">Coffee Production & Processing</p>
          </div>
        </div>
      </div>
    );
  }

  const voucherNumber = generateVoucherNumber(wage);
  const issuedDate = wage.date_of_payment ? new Date(wage.date_of_payment).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo.png" alt="Rugyeyo Farm" className="w-12 h-12 object-contain bg-white rounded-full p-1" />
            <h1 className="text-2xl font-bold">Voucher Verification</h1>
          </div>
          <p className="text-amber-100 text-sm">Rugyeyo Farm – Coffee Production & Processing</p>
        </div>

        {/* Verification Badge */}
        <div className="bg-gray-50 p-6 m-6 rounded-lg">
          <div>
            <h2 className="text-lg font-bold mb-1" style={{ color: '#702A0B' }}>Verified</h2>
            <p className="text-gray-700">
              This voucher was issued by Rugyeyo Farm on <strong>{issuedDate}</strong>.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This is an authentic wage payment voucher registered in our system.
            </p>
          </div>
        </div>

        {/* Voucher Details */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-amber-700">
              Voucher Details
            </h3>

            {/* Voucher Number */}
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Hash className="w-5 h-5 text-amber-700 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Voucher Number</p>
                <p className="text-base font-bold text-gray-800">{voucherNumber}</p>
              </div>
            </div>

            {/* Employee Name */}
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <User className="w-5 h-5 text-amber-700 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Employee Name</p>
                <p className="text-base font-semibold text-gray-800">{wage.employee_name}</p>
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Hash className="w-5 h-5 text-amber-700 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Employee ID</p>
                <p className="text-base font-semibold text-gray-800">{wage.employee_id || 'N/A'}</p>
              </div>
            </div>

            {/* Position */}
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Briefcase className="w-5 h-5 text-amber-700 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Position</p>
                <p className="text-base font-semibold text-gray-800">{wage.position || 'Staff Member'}</p>
              </div>
            </div>

            {/* Payment Date */}
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Calendar className="w-5 h-5 text-amber-700 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Payment Date</p>
                <p className="text-base font-semibold text-gray-800">{issuedDate}</p>
              </div>
            </div>

            {/* Amount Paid */}
            <div className="flex items-start gap-3 p-3 rounded-lg shadow-sm" style={{ backgroundColor: '#F5EEDC' }}>
              <DollarSign className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#702A0B' }} />
              <div className="flex-1">
                <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Amount Paid</p>
                <p className="text-2xl font-bold" style={{ color: '#702A0B' }}>{formatCurrency(wage.amount_paid)}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This verification page confirms that this voucher exists in our records.
              For any discrepancies or questions, please contact our accounts department.
            </p>
          </div>

          {/* Download Button */}
          <div className="mt-6">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} />
              {downloading ? 'Downloading...' : 'Download Voucher PDF'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p className="font-semibold mb-1">Rugyeyo Farm</p>
            <p className="text-xs">Namayumba, Wakiso District, Uganda</p>
            <p className="text-xs mt-1">Tel: +256772701051 | Email: rkabushenga@gmail.com</p>
            <p className="text-xs text-gray-500 mt-3">
              Verified on {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
