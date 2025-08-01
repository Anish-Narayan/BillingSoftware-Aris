// src/pages/Payments.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PaymentTable from '../components/PaymentTable';
import AddPaymentModal from '../components/AddPaymentModal'; // Import the new modal
import { db } from '../../firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  writeBatch,
  getDoc,
  deleteDoc
} from 'firebase/firestore';

const Payments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [activeInvoices, setActiveInvoices] = useState([]);

  useEffect(() => {
    const paymentsQuery = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    const invoicesQuery = query(collection(db, 'invoices'), where('status', 'in', ['unpaid', 'partially paid', 'overdue']));
    const unsubInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      setActiveInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => {
      unsubPayments();
      unsubInvoices();
    };
  }, []);

  const handleCloseModal = () => setIsModalOpen(false);

  const handleDeletePayment = async (paymentId, invoiceId, paymentAmount) => {
    if (!window.confirm('Are you sure you want to delete this payment? This will update the linked invoice.')) {
        return;
    }
    try {
      const batch = writeBatch(db);
      const paymentRef = doc(db, 'payments', paymentId);
      batch.delete(paymentRef);
      const invoiceRef = doc(db, 'invoices', invoiceId);
      const invoiceDoc = await getDoc(invoiceRef);

      if (invoiceDoc.exists()) {
        const invoiceData = invoiceDoc.data();
        const newPaidAmount = (invoiceData.paidAmount || 0) - paymentAmount;
        let newStatus;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const invoiceDueDate = new Date(invoiceData.dueDate);
        if (newPaidAmount <= 0) {
            newStatus = invoiceDueDate < today ? 'overdue' : 'unpaid';
        } else if (invoiceDueDate < today) {
            newStatus = 'overdue';
        } else {
            newStatus = 'partially paid';
        }
        batch.update(invoiceRef, { paidAmount: newPaidAmount, status: newStatus });
      }
      await batch.commit();
    } catch (error) {
      console.error("Error deleting payment: ", error);
      alert("Failed to delete the payment.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-10 overflow-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">Payments</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                       transition duration-200 ease-in-out transform hover:scale-105"
          >
            Add New Payment
          </button>
        </div>
        <PaymentTable payments={payments} onDelete={handleDeletePayment} />
        
        <AddPaymentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleCloseModal} // onSnapshot updates UI, so just close
          activeInvoices={activeInvoices}
        />
      </div>
    </div>
  );
};

export default Payments;