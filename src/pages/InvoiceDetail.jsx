import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import PaymentTable from '../components/PaymentTable';
import { invoices } from '../data/invoices';
import { payments } from '../data/payments';

const InvoiceDetail = () => {
  const { id } = useParams();
  const invoice = invoices.find(inv => inv.id === id);
  const invoicePayments = payments.filter(payment => payment.invoiceId === id);

  if (!invoice) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64 p-10">
          <Navbar />
          <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-200 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Invoice Not Found</h1>
            <p className="text-lg text-gray-700 mb-6">The invoice you are looking for does not exist.</p>
            <Link
              to="/invoices"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:scale-105"
            >
              Back to Invoices
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      case 'Overdue': return 'bg-orange-200 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
        <div className="p-10 overflow-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800">Invoice Details: {invoice.id}</h1>
            <Link
              to="/invoices"
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-md
                         transition duration-200 ease-in-out transform hover:scale-105"
            >
              Back to Invoices
            </Link>
          </div>

          <div className="bg-white shadow-xl rounded-xl p-8 mb-10 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Invoice Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-lg">
              <div><span className="font-semibold text-gray-600">Client:</span> {invoice.clientName}</div>
              <div><span className="font-semibold text-gray-600">Amount:</span> <span className="font-bold">₹{invoice.amount.toFixed(2)}</span></div>
              <div><span className="font-semibold text-gray-600">Due Date:</span> {invoice.dueDate}</div>
              <div>
                <span className="font-semibold text-gray-600">Status:</span>
                <span className={`ml-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
              <div><span className="font-semibold text-gray-600">Paid Amount:</span> <span className="font-bold">₹{invoice.paidAmount.toFixed(2)}</span></div>
              <div><span className="font-semibold text-gray-600">Balance Due:</span> <span className="font-bold text-red-700">₹{(invoice.amount - invoice.paidAmount).toFixed(2)}</span></div>
            </div>
            <div className="mt-10 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                                 transition duration-200 ease-in-out transform hover:scale-105">
                Download PDF (Non-functional)
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Payment History</h2>
            {invoicePayments.length > 0 ? (
              <PaymentTable payments={invoicePayments} />
            ) : (
              <p className="text-lg text-gray-600 bg-white p-6 rounded-xl shadow-md border border-gray-200">No payments recorded for this invoice yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;