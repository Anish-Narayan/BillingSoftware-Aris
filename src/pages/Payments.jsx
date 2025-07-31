import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import PaymentTable from '../components/PaymentTable';
import Modal from '../components/Modal';
import { payments } from '../data/payments';

const Payments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddPaymentClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-10 overflow-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">Payments</h1>
          <button
            onClick={handleAddPaymentClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                       transition duration-200 ease-in-out transform hover:scale-105"
          >
            Add New Payment
          </button>
        </div>
        <PaymentTable payments={payments} />

        {/* Add New Payment Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Payment">
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="newPaymentInvoiceId">
                Invoice ID
              </label>
              <input
                type="text"
                id="newPaymentInvoiceId"
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., INV005"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="newPaymentAmount">
                Amount
              </label>
              <input
                type="number"
                id="newPaymentAmount"
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="50.00"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="newPaymentDate">
                Date
              </label>
              <input
                type="date"
                id="newPaymentDate"
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="newPaymentMode">
                Payment Mode
              </label>
              <select
                id="newPaymentMode"
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Mode</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="newPaymentNotes">
                Notes
              </label>
              <textarea
                id="newPaymentNotes"
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24"
                placeholder="Payment for service X"
              ></textarea>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
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
  );
};

export default Payments;