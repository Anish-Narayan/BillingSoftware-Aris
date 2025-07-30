import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import InvoiceTable from '../components/InvoiceTable';
import PaymentTable from '../components/PaymentTable';
import Modal from '../components/Modal';
import { clients } from '../data/clients';
import { invoices } from '../data/invoices';
import { payments } from '../data/payments';

const ClientDetail = () => {
  const { id } = useParams();
  const client = clients.find(c => c.id === id);

  const clientInvoices = invoices.filter(invoice => invoice.clientId === id);
  const clientPayments = payments.filter(payment => payment.clientId === id);

  const totalInvoiced = clientInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPaid = clientInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const outstandingBalance = totalInvoiced - totalPaid;

  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  if (!client) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64 p-10">
          <Navbar />
          <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-200 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Client Not Found</h1>
            <p className="text-lg text-gray-700 mb-6">The client you are looking for does not exist.</p>
            <Link
              to="/clients"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:scale-105"
            >
              Back to Clients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
        <div className="p-10 overflow-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800">Client Details: {client.name}</h1>
            <Link
              to="/clients"
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-md
                         transition duration-200 ease-in-out transform hover:scale-105"
            >
              Back to Clients
            </Link>
          </div>

          <div className="bg-white shadow-xl rounded-xl p-8 mb-10 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-lg">
              <div><span className="font-semibold text-gray-600">Email:</span> {client.email}</div>
              <div><span className="font-semibold text-gray-600">Phone:</span> {client.phone}</div>
              <div className="col-span-1 md:col-span-2"><span className="font-semibold text-gray-600">Address:</span> {client.address}</div>
              <div className="col-span-1 md:col-span-2 text-3xl font-extrabold text-red-700 mt-4">
                Outstanding Balance: ${outstandingBalance.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Invoices</h2>
              <button
                onClick={() => setIsAddInvoiceModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                           transition duration-200 ease-in-out transform hover:scale-105"
              >
                Add New Invoice
              </button>
            </div>
            {clientInvoices.length > 0 ? (
              <InvoiceTable invoices={clientInvoices} />
            ) : (
              <p className="text-lg text-gray-600 bg-white p-6 rounded-xl shadow-md border border-gray-200">No invoices for this client yet.</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Payments</h2>
              <button
                onClick={() => setIsAddPaymentModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                           transition duration-200 ease-in-out transform hover:scale-105"
              >
                Add New Payment
              </button>
            </div>
            {clientPayments.length > 0 ? (
              <PaymentTable payments={clientPayments} />
            ) : (
              <p className="text-lg text-gray-600 bg-white p-6 rounded-xl shadow-md border border-gray-200">No payments for this client yet.</p>
            )}
          </div>

          {/* Add Invoice Modal */}
          <Modal isOpen={isAddInvoiceModalOpen} onClose={() => setIsAddInvoiceModalOpen(false)} title="Add New Invoice">
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="invoiceAmount">
                  Amount
                </label>
                <input
                  type="number"
                  id="invoiceAmount"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="100.00"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="invoiceDueDate">
                  Due Date
                </label>
                <input
                  type="date"
                  id="invoiceDueDate"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddInvoiceModalOpen(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                             transition duration-200 ease-in-out transform hover:scale-105"
                >
                  Save Invoice (Non-functional)
                </button>
              </div>
            </form>
          </Modal>

          {/* Add Payment Modal */}
          <Modal isOpen={isAddPaymentModalOpen} onClose={() => setIsAddPaymentModalOpen(false)} title="Add New Payment">
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="paymentAmount">
                  Amount
                </label>
                <input
                  type="number"
                  id="paymentAmount"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="50.00"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="paymentDate">
                  Date
                </label>
                <input
                  type="date"
                  id="paymentDate"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="paymentMode">
                  Payment Mode
                </label>
                <select
                  id="paymentMode"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="paymentNotes">
                  Notes
                </label>
                <textarea
                  id="paymentNotes"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24"
                  placeholder="Payment for service X"
                ></textarea>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentModalOpen(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                             transition duration-200 ease-in-out transform hover:scale-105"
                >
                  Save Payment (Non-functional)
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;