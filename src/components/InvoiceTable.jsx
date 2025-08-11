import React from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const InvoiceTable = ({ invoices, onEdit, onDelete }) => {
  // Use the improved status color logic, which is case-insensitive
  const getStatusColor = (status) => {
    const lowerCaseStatus = (status || '').toLowerCase();
    
    switch (lowerCaseStatus) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-blue-100 text-blue-800'; // Using blue for unpaid is more common
      case 'overdue':
        return 'bg-red-100 text-red-800 font-bold'; // Using red for overdue
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get today's date at midnight for accurate "overdue" comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
            <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
            <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
            <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
            <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map(invoice => {
            // Dynamically calculate the 'Overdue' status
            const invoiceDueDate = new Date(invoice.dueDate);
            const isOverdue = 
              (invoice.status?.toLowerCase() !== 'paid') && 
              invoiceDueDate < today;
            
            // Use 'Overdue' if it's overdue, otherwise use the status from the database
            const effectiveStatus = isOverdue ? 'Overdue' : (invoice.status || 'Unknown');
            
            // Safely calculate amounts
            const totalAmount = typeof invoice.totalAmount === 'number' ? invoice.totalAmount : 0;
            const paidAmount = typeof invoice.paidAmount === 'number' ? invoice.paidAmount : 0;
            const balance = totalAmount - paidAmount;

            return (
              <tr key={invoice.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-900">
                  <Link to={`/invoices/${invoice.id}`}>
                    {invoice.invoiceNumber || 'N/A'}
                  </Link>
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-center">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(effectiveStatus)}`}>
                    {effectiveStatus}
                  </span>
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{invoice.issueDate}</td>
                <td className={`py-4 px-6 whitespace-nowrap text-sm ${isOverdue ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                  {invoice.dueDate}
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700 text-right">₹{totalAmount.toFixed(2)}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-green-600 text-right">₹{paidAmount.toFixed(2)}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-red-600 font-semibold text-right">₹{balance.toFixed(2)}</td>

                <td className="py-4 px-6 whitespace-nowrap text-center text-sm font-medium space-x-2">
                  <button
                    onClick={() => onEdit(invoice.id)}
                    className="p-2 text-blue-600 hover:text-blue-900 transition-colors"
                    title="Edit Invoice"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(invoice.id)}
                    className="p-2 text-red-600 hover:text-red-900 transition-colors"
                    title="Delete Invoice"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;