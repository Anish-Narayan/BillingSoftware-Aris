import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import PaymentTable from '../components/PaymentTable';
import Modal from '../components/Modal';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
  doc,
  writeBatch,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import Select from 'react-select';

const Payments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [activeInvoices, setActiveInvoices] = useState([]);


  // State for the new payment form
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // --- Data Fetching ---
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

  // --- Memoized Dropdown Options ---
  const invoiceOptions = useMemo(() =>
    activeInvoices.map(inv => {
      const balanceDue = inv.totalAmount - (inv.paidAmount || 0);
      return {
        value: inv.id,
        label: `${inv.invoiceNumber} - ${inv.clientName} (₹${balanceDue.toFixed(2)} due)`,
        ...inv
      };
    }), [activeInvoices]);

  // --- Modal and Form Handlers ---
  const handleOpenModal = () => setIsModalOpen(true);
  const resetForm = () => {
    setSelectedInvoice(null);
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMode('');
    setPaymentNotes('');
    setFormError('');
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(resetForm, 300);
  };

  // --- Core Logic for Saving a Payment ---
  const handleSavePayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    if (!selectedInvoice || !paymentAmount || !paymentDate || !paymentMode) {
      setFormError('Please fill out all required fields.');
      setSaving(false);
      return;
    }

    const newPaymentAmount = parseFloat(paymentAmount);
    if (isNaN(newPaymentAmount) || newPaymentAmount <= 0) {
      setFormError('Please enter a valid, positive payment amount.');
      setSaving(false);
      return;
    }

    const balanceDue = selectedInvoice.totalAmount - (selectedInvoice.paidAmount || 0);
    if (newPaymentAmount > balanceDue + 0.01) {
      setFormError(`Payment (₹${newPaymentAmount.toFixed(2)}) exceeds balance due (₹${balanceDue.toFixed(2)}).`);
      setSaving(false);
      return;
    }

    const batch = writeBatch(db);
    try {
      const totalPaidSoFar = selectedInvoice.paidAmount || 0;
      const newTotalPaid = totalPaidSoFar + newPaymentAmount;
      
      // ====================================================================
      // === MODIFIED LOGIC STARTS HERE ===
      // ====================================================================
      let newStatus;
      if (newTotalPaid >= selectedInvoice.totalAmount) {
        // If the invoice is fully paid, the status is always 'paid'.
        newStatus = 'paid';
      } else if (selectedInvoice.status === 'overdue') {
        // If it's not fully paid but was already overdue, it REMAINS 'overdue'.
        newStatus = 'overdue';
      } else {
        // Otherwise (it was 'unpaid' or 'partially paid' before due date), it becomes 'partially paid'.
        newStatus = 'partially paid';
      }
      // ====================================================================
      // === MODIFIED LOGIC ENDS HERE ===
      // ====================================================================

      const paymentRef = doc(collection(db, 'payments'));
      batch.set(paymentRef, {
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.invoiceNumber,
        clientId: selectedInvoice.clientId,
        clientName: selectedInvoice.clientName,
        amount: newPaymentAmount,
        date: paymentDate,
        paymentMode: paymentMode,
        notes: paymentNotes,
        createdAt: serverTimestamp(),
      });

      const invoiceRef = doc(db, 'invoices', selectedInvoice.id);
      batch.update(invoiceRef, {
        status: newStatus,
        paidAmount: newTotalPaid
      });

      await batch.commit();
      handleCloseModal();

    } catch (err) {
      setFormError('Failed to save payment. Please try again.');
      console.error("Error committing batch: ", err);
    } finally {
      setSaving(false);
    }
  };


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
        const currentPaidAmount = invoiceData.paidAmount || 0;
        const newPaidAmount = currentPaidAmount - paymentAmount;
        
        // ====================================================================
        // === MODIFIED LOGIC STARTS HERE ===
        // ====================================================================
        let newStatus;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const invoiceDueDate = new Date(invoiceData.dueDate);

        if (newPaidAmount <= 0) {
            // If no payment is left, status depends purely on the due date.
            newStatus = invoiceDueDate < today ? 'overdue' : 'unpaid';
        } else if (invoiceDueDate < today) {
            // If there's a balance and it's past due, it must be 'overdue'.
            newStatus = 'overdue';
        } else {
            // If there's a balance and it's not past due, it's 'partially paid'.
            newStatus = 'partially paid';
        }
        // ====================================================================
        // === MODIFIED LOGIC ENDS HERE ===
        // ====================================================================

        batch.update(invoiceRef, { paidAmount: newPaidAmount, status: newStatus });
      }

      await batch.commit();

    } catch (error) {
      console.error("Error deleting payment: ", error);
      alert("Failed to delete the payment. Please check the console for more details.");
    }
  };

  // --- JSX Rendering ---
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-10 overflow-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">Payments</h1>
          <button
            onClick={handleOpenModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                       transition duration-200 ease-in-out transform hover:scale-105"
          >
            Add New Payment
          </button>
        </div>
        <PaymentTable payments={payments} onDelete={handleDeletePayment} />

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Payment">
          <form onSubmit={handleSavePayment} className="space-y-6">
            {formError && <p className="text-red-500 text-center mb-4 font-semibold">{formError}</p>}

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="invoice">Invoice</label>
              <Select
                id="invoice"
                options={invoiceOptions}
                value={selectedInvoice}
                onChange={(option) => {
                  setSelectedInvoice(option);
                  const balanceDue = option ? (option.totalAmount - (option.paidAmount || 0)).toFixed(2) : '';
                  setPaymentAmount(balanceDue);
                }}
                getOptionValue={(option) => option.id}
                getOptionLabel={(option) => option.label}
                placeholder="Search by invoice # or client name..."
                isClearable
                classNamePrefix="react-select"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="paymentAmount">Amount (₹)</label>
              <input type="number" step="0.01" id="paymentAmount" className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="paymentDate">Date</label>
              <input type="date" id="paymentDate" className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="paymentMode">Payment Mode</label>
              <Select
                id="paymentMode"
                value={paymentMode ? { value: paymentMode, label: paymentMode } : null}
                options={[{ value: 'Cash', label: 'Cash' }, { value: 'Bank Transfer', label: 'Bank Transfer' }, { value: 'Credit Card', label: 'Credit Card' }]}
                onChange={(option) => setPaymentMode(option ? option.value : '')}
                placeholder="Select Mode..."
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="paymentNotes">Notes (Optional)</label>
              <textarea id="paymentNotes" className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 h-24" placeholder="e.g., Transaction ID, check number" value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)}></textarea>
            </div>
            <div className="flex justify-end pt-4 space-x-3">
              <button type="button" onClick={handleCloseModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg">Cancel</button>
              <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-indigo-400 disabled:cursor-not-allowed">
                {saving ? 'Saving...' : 'Save Payment'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Payments;