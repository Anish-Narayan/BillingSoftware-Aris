// src/components/AddPaymentModal.jsx

import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import Select from 'react-select';
import { db } from '../../firebase';
import {
  collection,
  doc,
  writeBatch
} from 'firebase/firestore';

const AddPaymentModal = ({ isOpen, onClose, onSuccess, activeInvoices }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedInvoice(null);
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMode('');
      setPaymentNotes('');
      setFormError('');
    }
  }, [isOpen]);

  const invoiceOptions = useMemo(() =>
    activeInvoices.map(inv => {
      // FIX: Read from the standardized 'paidAmount' field.
      const paidSoFar = inv.paidAmount || 0;
      const balanceDue = inv.totalAmount - paidSoFar;
      return {
        value: inv.id,
        label: `${inv.invoiceNumber || 'INV-N/A'} - ${inv.clientName} (₹${balanceDue.toFixed(2)} due)`,
        ...inv
      };
    }), [activeInvoices]);

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

    // FIX: Calculate balance based on the standardized 'paidAmount' field.
    const paidSoFar = selectedInvoice.paidAmount || 0;
    const balanceDue = selectedInvoice.totalAmount - paidSoFar;
    
    if (newPaymentAmount > balanceDue + 0.01) { // Add tolerance for float precision
      setFormError(`Payment (₹${newPaymentAmount.toFixed(2)}) exceeds balance due (₹${balanceDue.toFixed(2)}).`);
      setSaving(false);
      return;
    }

    const batch = writeBatch(db);
    try {
      const newTotalPaid = paidSoFar + newPaymentAmount;
      
      // FIX: Use correct capitalized status strings.
      let newStatus;
      if (newTotalPaid >= selectedInvoice.totalAmount) {
        newStatus = 'Paid';
      } else if (selectedInvoice.status === 'Overdue') {
        newStatus = 'Overdue'; // Stays 'Overdue' if not fully paid
      } else {
        newStatus = 'Partially Paid';
      }

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
        createdAt: new Date(),
      });

      const invoiceRef = doc(db, 'invoices', selectedInvoice.id);
      batch.update(invoiceRef, { 
        status: newStatus, 
        paidAmount: newTotalPaid // Update the master paidAmount field
      });

      await batch.commit();
      onSuccess();

    } catch (err) {
      setFormError('Failed to save payment. Please try again.');
      console.error("Error committing batch: ", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Payment">
      <form onSubmit={handleSavePayment} className="space-y-6">
        {formError && <p className="text-red-500 text-center mb-4 font-semibold">{formError}</p>}
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="invoice">Invoice*</label>
          <Select
            id="invoice" options={invoiceOptions} value={selectedInvoice}
            onChange={(option) => {
              setSelectedInvoice(option);
              const paidSoFar = option ? (option.paidAmount || 0) : 0;
              const balanceDue = option ? (option.totalAmount - paidSoFar).toFixed(2) : '';
              setPaymentAmount(balanceDue);
            }}
            placeholder="Search by invoice # or client name..." isClearable classNamePrefix="react-select" required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="paymentAmount">Amount (₹)*</label>
          <input type="number" step="0.01" id="paymentAmount" className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="paymentDate">Date*</label>
          <input type="date" id="paymentDate" className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="paymentMode">Payment Mode*</label>
          <Select
            id="paymentMode"
            value={paymentMode ? { value: paymentMode, label: paymentMode } : null}
            options={[{ value: 'Cash', label: 'Cash' }, { value: 'Bank Transfer', label: 'Bank Transfer' }, { value: 'Credit Card', label: 'Credit Card' }]}
            onChange={(option) => setPaymentMode(option ? option.value : '')}
            placeholder="Select Mode..." required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="paymentNotes">Notes (Optional)</label>
          <textarea id="paymentNotes" className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 h-24" placeholder="e.g., Transaction ID, check number" value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)}></textarea>
        </div>
        <div className="flex justify-end pt-4 space-x-3">
          <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-indigo-400 disabled:cursor-not-allowed">
            {saving ? 'Saving...' : 'Save Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPaymentModal;