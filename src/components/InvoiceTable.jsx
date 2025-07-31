import React from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; // Optional: for nice icons

const InvoiceTable = ({ invoices, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      case 'Overdue': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          {invoices.map(invoice => (
            <tr key={invoice.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
              <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-900">
                <Link to={`/invoices/${invoice.id}`}>
                  {invoice.invoiceNumber}
                </Link>
              </td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{invoice.clientName}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">₹{invoice.totalAmount.toFixed(2)}</td>
              <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{invoice.dueDate}</td>
              <td className="py-4 px-6 whitespace-nowrap text-center">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </td>
              <td className="py-4 px-6 whitespace-nowrap text-center text-sm font-medium space-x-2">
                {/* 
                  The onEdit and onDelete props should be passed down from Invoices.jsx.
                  Example implementation in the parent:
                  const handleEdit = (id) => navigate(`/invoices/edit/${id}`);
                  const handleDelete = (id) => { if(window.confirm('...')) deleteDoc(doc(db, 'invoices', id)); };
                */}
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;