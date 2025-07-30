import React from 'react';

const PaymentTable = ({ payments }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map(payment => (
            <tr key={payment.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
              <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{payment.id}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{payment.invoiceId}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">${payment.amount.toFixed(2)}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{payment.date}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{payment.mode}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{payment.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;