import React from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline'; // Optional: for a nice delete icon

const PaymentTable = ({ payments, onDelete }) => {
  // Handle the case where there are no payments to display
  if (!payments || payments.length === 0) {
    return (
      <div className="text-center bg-white p-10 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">No Payments Recorded</h2>
        <p className="mt-1 text-gray-600">When you add a new payment, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map(payment => (
            <tr key={payment.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
              <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-900">
                <Link to={`/invoices/${payment.invoiceId}`}>
                  {payment.invoiceNumber}
                </Link>
              </td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{payment.clientName}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700 font-semibold">₹{payment.amount.toFixed(2)}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{payment.date}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{payment.paymentMode}</td>
              <td className="py-4 px-6 text-sm text-gray-700 max-w-xs truncate" title={payment.notes}>
                {payment.notes || '-'}
              </td>
              <td className="py-4 px-6 whitespace-nowrap text-center text-sm font-medium">
                <button
                  onClick={() => onDelete(payment.id, payment.invoiceId, payment.amount)}
                  className="p-2 text-red-600 hover:text-red-900 transition-colors"
                  title="Delete Payment"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;