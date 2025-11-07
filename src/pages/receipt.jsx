import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Printer } from 'lucide-react';

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
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition"
          >
            <Printer size={20} />
            Print Receipt
          </button>
        </div>
        <div id="receipt" className="bg-white p-12 rounded-lg shadow-lg">
          <div className="company-info text-center mb-6">
            <h1 className="text-3xl font-bold text-amber-800 mb-1">RUGYEYO FARM</h1>
            <p className="text-lg text-amber-700 font-semibold">Coffee Production & Processing</p>
            <p className="text-gray-700">Namayumba, Wakiso District, Uganda</p>
            <p className="text-gray-700">Tel: +256772701051 | Email: rkabushenga@gmail.com</p>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">Receipt No:</span>
            <span className="text-lg font-bold text-gray-800">{generateReceiptNumber(sale)}</span>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-amber-800 mb-2">Sales Receipt</h2>
            <p className="text-xl text-amber-700">{sale.businessName || 'Rugyeyo Farm'}</p>
          </div>
          <div className="mb-8 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Customer:</span>
              <span className="text-lg text-gray-800">{sale.customer_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Payment Date:</span>
              <span className="text-lg text-gray-800">{sale.date_of_payment ? new Date(sale.date_of_payment).toLocaleDateString() : sale.date}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Status:</span>
              <span className="text-lg text-gray-800">{sale.status || 'Paid'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Payment Method:</span>
              <span className="text-lg text-gray-800">{sale.method_of_payment || sale.payment_method}</span>
            </div>
            {/* <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Batch ID:</span>
              <span className="text-lg text-gray-800">{sale.batch_id || 'N/A'}</span>
            </div> */}
          </div>
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-amber-200">
                  <th className="text-left p-4 text-lg font-semibold text-gray-700">Product</th>
                  <th className="text-left p-4 text-lg font-semibold text-gray-700">Item</th>
                  <th className="text-left p-4 text-lg font-semibold text-gray-700">Qty (kg)</th>
                  <th className="text-left p-4 text-lg font-semibold text-gray-700">Rate (UGX)</th>
                  <th className="text-left p-4 text-lg font-semibold text-gray-700">Total (UGX)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-4 text-lg text-gray-800">{item.product}</td>
                    <td className="p-4 text-lg text-gray-800">{item.item}</td>
                    <td className="p-4 text-lg text-gray-800">{item.qty}</td>
                    <td className="p-4 text-lg text-gray-800">{Number(item.rate).toLocaleString()}</td>
                    <td className="p-4 text-lg text-gray-800">{Number(item.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t-2 border-gray-300 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-700">Total Amount:</span>
              <span className="text-xl font-bold text-gray-800">UGX {Number(totalAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-700">Balance:</span>
              <span className="text-xl font-bold text-gray-800">UGX {sale.balance || 0}</span>
            </div>
          </div>
          <div className="mt-12 text-center">
            <p className="text-lg italic text-gray-600">Thank you for your business!</p>
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
