import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer } from 'lucide-react';
import QRCode from 'qrcode';

// Number to words utility
const numberToWords = (num) => {
  if (!num || num === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const convert = (n) => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ' ' + convert(n % 1000000) : '');
    return convert(Math.floor(n / 1000000000)) + ' Billion' + (n % 1000000000 !== 0 ? ' ' + convert(n % 1000000000) : '');
  };

  return convert(Math.floor(num));
};

const SALES_API_ENDPOINT = 'http://142.93.94.236:8000/api/sales/';

function getReceiptIdFromUrl(location) {
  const params = new URLSearchParams(location.search);
  return params.get('id');
  
}

function generateReceiptNumber(sale) {
  if (!sale) return '';
  const date = sale.date_of_payment || sale.date || '';
  const year = date ? new Date(date).getFullYear() : 'XXXX';
  return `RUG-${year}-${String(sale.id).padStart(4, '0')}`;
}

export default function SalesReceipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const fetchSale = async () => {
      setLoading(true);
      setError(null);
      const id = getReceiptIdFromUrl(location);
      if (!id) {
        setError('No sale ID provided in URL.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${SALES_API_ENDPOINT}${id}/`);
        if (!response.ok) throw new Error(`Sale not found (HTTP ${response.status})`);
        const data = await response.json();
        setSale(data);

        // Generate QR code for the receipt verification URL
        const receiptUrl = `${window.location.origin}/verify-receipt?id=${id}`;
        const qrCode = await QRCode.toDataURL(receiptUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#702A0B',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrCode);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [location]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center">Loading receipt...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!sale) return null;

  const items = sale.items || [
    {
      product: sale.item || '',
      item: sale.item || '',
      qty: sale.quantity || 0,
      rate: sale.rate || 0,
      total: (sale.quantity || 0) * (sale.rate || 0)
    }
  ];
  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);

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
              className="flex items-center gap-2 text-white px-6 py-3 rounded-lg transition"
              style={{ backgroundColor: '#702A0B' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5A2209'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#702A0B'}
            >
              <Printer size={20} />
              Print Receipt
            </button>
          </div>
        </div>
        <div id="receipt" className="bg-white p-12 rounded-lg shadow-lg" style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
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
              <p className="text-sm font-semibold mb-1" style={{ color: '#702A0B' }}>RECEIPT</p>
              <p className="text-xs text-gray-600">No: {generateReceiptNumber(sale)}</p>
            </div>
          </div>
          {/* Title */}
          <div className="text-center mb-8 py-4" style={{ backgroundColor: '#F5EEDC', borderRadius: '8px' }}>
            <h2 className="text-2xl font-bold" style={{ color: '#702A0B' }}>
              SALES RECEIPT
            </h2>
          </div>
          {/* Customer Information */}
          <div className="mb-6" style={{ backgroundColor: '#FEFBF8', padding: '20px', borderRadius: '8px', border: '1px solid #E8DCC8' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: '#702A0B' }}>
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer:</p>
                <p className="text-base font-semibold" style={{ color: '#333' }}>{sale.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Date:</p>
                <p className="text-base font-semibold" style={{ color: '#333' }}>
                  {sale.date_of_payment ? new Date(sale.date_of_payment).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : sale.date}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status:</p>
                <p className="text-base font-semibold" style={{ color: '#333' }}>{sale.status || 'Paid'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Method:</p>
                <p className="text-base font-semibold" style={{ color: '#333' }}>{sale.method_of_payment || sale.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Batch ID:</p>
                <p className="text-base font-semibold" style={{ color: '#333' }}>{sale.batch_id || 'N/A'}</p>
              </div>
            </div>
          </div>
          {/* Items Table */}
          <div className="mb-6" style={{ backgroundColor: '#FEFBF8', padding: '20px', borderRadius: '8px', border: '1px solid #E8DCC8' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: '#702A0B' }}>
              Item Details
            </h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr style={{ backgroundColor: '#F5EEDC' }}>
                  <th className="text-left p-3 font-semibold" style={{ color: '#702A0B' }}>Product</th>
                  <th className="text-left p-3 font-semibold" style={{ color: '#702A0B' }}>Item</th>
                  <th className="text-left p-3 font-semibold" style={{ color: '#702A0B' }}>Qty (kg)</th>
                  <th className="text-left p-3 font-semibold" style={{ color: '#702A0B' }}>Rate (UGX)</th>
                  <th className="text-left p-3 font-semibold" style={{ color: '#702A0B' }}>Total (UGX)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-3 text-gray-800">{item.product}</td>
                    <td className="p-3 text-gray-800">{item.item}</td>
                    <td className="p-3 text-gray-800">{item.qty}</td>
                    <td className="p-3 text-gray-800">{Number(item.rate).toLocaleString()}</td>
                    <td className="p-3 text-gray-800">{Number(item.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Total Amount */}
          <div className="mb-6 p-6" style={{ backgroundColor: '#702A0B', borderRadius: '8px' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-white">Total Amount:</span>
              <span className="text-2xl font-bold text-white">UGX {Number(totalAmount).toLocaleString()}</span>
            </div>
            <p className="text-sm italic text-white mt-2">
              {numberToWords(totalAmount)} Shillings Only
            </p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-base font-semibold text-white">Balance:</span>
              <span className="text-lg font-bold text-white">UGX {Number(sale.balance || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* QR Code Section */}
          {qrCodeUrl && (
            <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
              <img
                src={qrCodeUrl}
                alt="Receipt QR Code"
                className="mx-auto mb-3"
                style={{ width: '120px', height: '120px', border: '3px solid #702A0B', borderRadius: '8px', padding: '8px', background: 'white' }}
              />
              <p className="text-xs font-semibold mb-1" style={{ color: '#702A0B' }}>Scan to View Receipt</p>
              <p className="text-xs text-gray-600">
                Scan this QR code to view this receipt online
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs italic text-gray-500">
              This is an official sales receipt from Rugyeyo Farm
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
          #receipt {
            box-shadow: none;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
}
