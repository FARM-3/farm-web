import React, { useEffect, useRef, useState } from 'react';

// Use lucide-react icons for aesthetics
import { Printer, CheckCircle } from 'lucide-react';

// Mock data structure matching the user's provided receipt image
const mockReceiptData = {
  storeName: "Rugyeyo Farm",
  title: "Sales Receipt",
  customer: "John Katerega",
  paymentDate: "16/10/2025",
  status: "Paid",
  paymentMethod: "Cash",
  batchId: "BATCH-001",
  items: [
    { name: "Coffee", item: "Arabica", qty: 100, rate: 5000, total: 500000 },
  ],
  totalAmount: 500000,
  balance: 0,
};

/**
 * Utility function to format numbers as Ugandan Shillings (UGX)
 * @param {number} amount
 */
const formatUGX = (amount) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(amount).replace('UGX', '').trim(); // Remove the currency symbol but keep the space
};

// Component to be printed. This design is optimized for both screen and print.
const ReceiptContent = React.forwardRef(({ data }, ref) => (
  <div ref={ref} className="p-6 bg-white rounded-lg shadow-xl max-w-sm mx-auto my-8 border border-gray-200">
    <header className="text-center mb-6 border-b pb-4">
      <h1 className="text-2xl font-bold text-gray-900">
        {data.title}
      </h1>
      <p className="text-sm text-gray-600 mt-1">{data.storeName}</p>
    </header>

    {/* Customer and Transaction Details */}
    <div className="space-y-1 mb-6 text-sm">
      <div className="flex justify-between">
        <span className="font-semibold text-gray-700">Customer:</span>
        <span className="text-gray-900">{data.customer}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold text-gray-700">Payment Date:</span>
        <span className="text-gray-900">{data.paymentDate}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold text-gray-700">Status:</span>
        <span className="text-green-600 font-bold flex items-center gap-1">
          {data.status} <CheckCircle size={14} className="inline"/>
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold text-gray-700">Payment Method:</span>
        <span className="text-gray-900">{data.paymentMethod}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold text-gray-700">Batch ID:</span>
        <span className="text-gray-900">{data.batchId}</span>
      </div>
    </div>

    {/* Items Table */}
    <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr className="text-xs uppercase font-medium text-gray-600 tracking-wider">
            <th className="px-2 py-3 text-left">Product</th>
            <th className="px-2 py-3 text-left">Item</th>
            <th className="px-2 py-3 text-center">Qty (kg)</th>
            <th className="px-2 py-3 text-right">Rate (UGX)</th>
            <th className="px-2 py-3 text-right">Total (UGX)</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 text-sm">
          {data.items.map((item, index) => (
            <tr key={index}>
              <td className="px-2 py-3 whitespace-nowrap font-medium">{item.name}</td>
              <td className="px-2 py-3 whitespace-nowrap">{item.item}</td>
              <td className="px-2 py-3 whitespace-nowrap text-center">{item.qty}</td>
              <td className="px-2 py-3 whitespace-nowrap text-right">{formatUGX(item.rate)}</td>
              <td className="px-2 py-3 whitespace-nowrap text-right font-semibold">{formatUGX(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Totals Section */}
    <div className="space-y-2 text-sm">
      <div className="flex justify-between font-bold text-base text-gray-800 border-t pt-2">
        <span>Total Amount:</span>
        <span className="text-right">UGX {formatUGX(data.totalAmount)}</span>
      </div>
      <div className="flex justify-between font-bold text-base text-gray-800">
        <span>Balance:</span>
        <span className="text-right">UGX {formatUGX(data.balance)}</span>
      </div>
    </div>

    <footer className="mt-8 text-center text-gray-500 italic text-sm">
      Thank you for your business!
    </footer>
  </div>
));

// Main Application Component
const App = () => {
  const receiptRef = useRef(null);
  const [hasPrinted, setHasPrinted] = useState(false);

  // Function to handle the manual print request
  const handlePrint = () => {
    window.print();
    setHasPrinted(true); // Update state if needed, though usually print dialog handles completion
  };

  // useEffect for automatic printing
  useEffect(() => {
    // We delay the print call slightly to ensure the component is fully rendered
    const timer = setTimeout(() => {
      // Check if it hasn't printed yet to prevent double-printing on strict mode development builds
      if (!hasPrinted) {
        handlePrint();
      }
    }, 500); // 500ms delay

    // Cleanup the timer
    return () => clearTimeout(timer);
  }, []); // Run only once after initial render

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans flex flex-col items-center">
      {/* Print Button - Hidden when printing via CSS media query */}
      <div className="no-print mb-6">
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
        >
          <Printer size={20} />
          <span>{hasPrinted ? 'Print Again' : 'Complete Sale & Print Receipt'}</span>
        </button>
      </div>

      {/* The Receipt Component */}
      <ReceiptContent ref={receiptRef} data={mockReceiptData} />

      {/* Tailwind CSS for Print Optimization */}
      <style>{`
        /* Hide all elements that should not appear on the printed receipt */
        @media print {
          .no-print {
            display: none !important;
          }
          /* Ensure the receipt itself takes full print width and removes padding */
          body {
            margin: 0;
            padding: 0;
            background: none;
          }
          .ReceiptContent-container { /* Target the outer container to remove shadow/margin */
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default App;