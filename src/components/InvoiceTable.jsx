import React from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const InvoiceTable = ({ invoices, onEdit, onDelete }) => {
  // Fix 1: Make status check case-insensitive and handle null/undefined status
  const getStatusColor = (status) => {
    // Ensure status is a string and convert to lowercase for reliable comparison
    const lowerCaseStatus = (status || '').toLowerCase();
    
    switch (lowerCaseStatus) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-purple-100 text-purple-800 font-bold'; // Made overdue bold for emphasis
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
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map(invoice => {
            // Fix 2: Dynamically calculate the 'Overdue' status
            const invoiceDueDate = new Date(invoice.dueDate);
            const isOverdue = 
              (invoice.status.toLowerCase() === 'unpaid' || invoice.status.toLowerCase() === 'partially paid') && 
              invoiceDueDate < today;
            
            // Use 'Overdue' if it's overdue, otherwise use the status from the database
            const effectiveStatus = isOverdue ? 'Overdue' : invoice.status;

            return (
              <tr key={invoice.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-900">
                  <Link to={`/invoices/${invoice.id}`}>
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{invoice.clientName}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">₹{invoice.totalAmount.toFixed(2)}</td>
                <td className={`py-4 px-6 whitespace-nowrap text-sm ${isOverdue ? 'text-purple-700 font-semibold' : 'text-gray-700'}`}>
                  {invoice.dueDate}
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(effectiveStatus)}`}>
                    {effectiveStatus}
                  </span>
                </td>
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