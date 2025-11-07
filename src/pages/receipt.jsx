
import React, { useState } from 'react';
import { Printer } from 'lucide-react';

export default function SalesReceipt() {
  const [receipt, setReceipt] = useState({
    businessName: 'Rugyeyo Farm',
    customer: 'John Doe',
    paymentDate: '16/10/2025',
    status: 'Paid',
    paymentMethod: 'Cash',
    batchId: 'BATCH-001',
    items: [
      {
        product: 'Maize',
        item: 'Grain',
        qty: 100,
        rate: 5000,
        total: 500000
      }
    ],
    balance: 0
  });

  const totalAmount = receipt.items.reduce((sum, item) => sum + item.total, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Print Button */}
        <div className="mb-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <Printer size={20} />
            Print Receipt
          </button>
        </div>

        {/* Receipt */}
        <div id="receipt" className="bg-white p-12 rounded-lg shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Sales Receipt</h1>
            <p className="text-xl text-gray-600">{receipt.businessName}</p>
          </div>

          {/* Customer Details */}
          <div className="mb-8 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Customer:</span>
              <span className="text-lg text-gray-800">{receipt.customer}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Payment Date:</span>
              <span className="text-lg text-gray-800">{receipt.paymentDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Status:</span>
              <span className="text-lg text-gray-800">{receipt.status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Payment Method:</span>
              <span className="text-lg text-gray-800">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Batch ID:</span>
              <span className="text-lg text-gray-800">{receipt.batchId}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-4 text-lg font-semibold text-gray-700">Product</th>
                  <th className="text-left p-4 text-lg font-semibold text-gray-700">Item</th>
                  <th className="text-left p-4 text-lg font-semibold text-gray-700">Qty (kg)</th>
                  <th className="text-left p-4 text-lg font-semibold text-gray-700">Rate (UGX)</th>
                  <th className="text-left p-4 text-lg font-semibold text-gray-700">Total (UGX)</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-4 text-lg text-gray-800">{item.product}</td>
                    <td className="p-4 text-lg text-gray-800">{item.item}</td>
                    <td className="p-4 text-lg text-gray-800">{item.qty}</td>
                    <td className="p-4 text-lg text-gray-800">{item.rate.toLocaleString()}</td>
                    <td className="p-4 text-lg text-gray-800">{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-gray-300 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-700">Total Amount:</span>
              <span className="text-xl font-bold text-gray-800">UGX {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-700">Balance:</span>
              <span className="text-xl font-bold text-gray-800">UGX {receipt.balance}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-lg italic text-gray-600">Thank you for your business!</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
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












