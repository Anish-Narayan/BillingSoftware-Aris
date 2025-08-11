// src/components/AddEditInvoiceModal.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

const AddEditInvoiceModal = ({ isOpen, onClose, onSuccess, invoiceToEditId, clients }) => {
  // Form state
  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState([
    { id: Date.now(), description: '', quantity: 1, rate: 0 },
  ]);

  const [discountAmount, setDiscountAmount] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculations
  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return acc + quantity * rate;
    }, 0);
  }, [lineItems]);

  const totalAmount = useMemo(() => {
    return subtotal - (parseFloat(discountAmount) || 0);
  }, [subtotal, discountAmount]);

  useEffect(() => {
    if (invoiceToEditId) {
      const fetchInvoice = async () => {
        try {
          const docRef = doc(db, 'invoices', invoiceToEditId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setClientId(data.clientId);
            setInvoiceNumber(data.invoiceNumber);
            setIssueDate(data.issueDate);
            setDueDate(data.dueDate);
            setLineItems(data.lineItems || [{ id: Date.now(), description: '', quantity: 1, rate: 0 }]);
            const initialDiscountAmount = data.discountAmount || 0;
            const initialSubtotal = (data.lineItems || []).reduce((acc, item) => acc + (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0), 0);
            setDiscountAmount(initialDiscountAmount);
            if (initialSubtotal > 0 && initialDiscountAmount > 0) {
              setDiscountPercentage(((initialDiscountAmount / initialSubtotal) * 100).toFixed(2));
            } else {
              setDiscountPercentage('');
            }
            setAdvanceAmount(data.advanceAmount || 0);
          }
        } catch (err) { console.error(err); setError('Failed to load invoice data.'); }
      };
      fetchInvoice();
    } else {
      resetForm();
    }
  }, [invoiceToEditId, isOpen]);

  useEffect(() => {
    if (dueDate && issueDate && dueDate < issueDate) {
      setDueDate(issueDate);
    }
  }, [issueDate, dueDate]);

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setClientId('');
    setInvoiceNumber('');
    setIssueDate(today);
    setDueDate('');
    setLineItems([{ id: Date.now(), description: '', quantity: 1, rate: 0 }]);
    setDiscountAmount('');
    setDiscountPercentage('');
    setAdvanceAmount(0);
    setError('');
    setIsSubmitting(false);
  };

  const handleDiscountAmountChange = (e) => {
    const amountValue = e.target.value;
    setDiscountAmount(amountValue);
    const numericAmount = parseFloat(amountValue) || 0;
    if (subtotal > 0) {
      const percentage = (numericAmount / subtotal) * 100;
      setDiscountPercentage(numericAmount > 0 ? percentage.toFixed(2) : '');
    } else {
      setDiscountPercentage('');
    }
  };

  const handleDiscountPercentageChange = (e) => {
    const percentageValue = e.target.value;
    setDiscountPercentage(percentageValue);
    const numericPercentage = parseFloat(percentageValue) || 0;
    const amount = (subtotal * numericPercentage) / 100;
    setDiscountAmount(numericPercentage > 0 ? amount.toFixed(2) : '');
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedLineItems = [...lineItems];
    updatedLineItems[index][field] = value;
    setLineItems(updatedLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now(), description: '', quantity: 1, rate: 0 }]);
  };

  const removeLineItem = (index) => {
    const updatedLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedLineItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- FORM VALIDATION CHECKS ---
    if (!clientId || !issueDate || !dueDate || lineItems.some(item => !item.description.trim())) {
      setError('Please fill in all required fields: Client, Dates, and Item Descriptions.');
      return;
    }
    if (dueDate < issueDate) {
      setError('Due date cannot be earlier than the issue date.');
      return;
    }

    // --- NEW: VALIDATE THAT QUANTITY AND RATE ARE NOT ZERO ---
    const hasInvalidLineItem = lineItems.some(item => 
        (parseFloat(item.quantity) || 0) <= 0 || 
        (parseFloat(item.rate) || 0) <= 0
    );

    if (hasInvalidLineItem) {
        setError('Quantity and Rate for all items must be greater than 0.');
        return;
    }
    // --- END OF NEW VALIDATION ---

    setIsSubmitting(true);

    const trimmedInvoiceNumber = invoiceNumber.trim();
    if (!invoiceToEditId && trimmedInvoiceNumber !== '') {
      try {
        const q = query(collection(db, "invoices"), where("invoiceNumber", "==", trimmedInvoiceNumber));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setError(`Invoice number "${trimmedInvoiceNumber}" already exists. Please use a unique number.`);
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("Error checking for duplicate invoice:", err);
        setError("Could not verify invoice number. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    const clientName = clients.find(c => c.id === clientId)?.name || 'Unknown Client';
    const processedLineItems = lineItems.map(item => ({
      id: item.id,
      description: item.description,
      quantity: parseFloat(item.quantity) || 0,
      rate: parseFloat(item.rate) || 0,
    }));

    const finalSubtotal = processedLineItems.reduce((acc, item) => acc + item.quantity * item.rate, 0);
    const finalDiscount = parseFloat(discountAmount) || 0;
    const finalTotal = finalSubtotal - finalDiscount;
    const finalAdvance = parseFloat(advanceAmount) || 0;

    let status;
    const today = new Date().toISOString().split('T')[0];

    if (finalTotal <= 0 || (finalAdvance > 0 && finalAdvance >= finalTotal)) {
      status = 'Paid';
    } else if (dueDate < today) {
      status = 'Overdue';
    } else if (finalAdvance > 0) {
      status = 'Partially Paid';
    } else {
      status = 'Unpaid';
    }

    const invoiceData = {
      clientId, clientName,
      invoiceNumber: trimmedInvoiceNumber,
      issueDate, dueDate,
      lineItems: processedLineItems,
      subtotal: finalSubtotal,
      discountAmount: finalDiscount,
      totalAmount: finalTotal,
      advanceAmount: finalAdvance,
      paidAmount: finalAdvance,
      status,
      lastUpdated: serverTimestamp(),
    };

    try {
      if (invoiceToEditId) {
        await updateDoc(doc(db, 'invoices', invoiceToEditId), invoiceData);
      } else {
        await addDoc(collection(db, 'invoices'), { ...invoiceData, createdAt: serverTimestamp() });
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving invoice:', err);
      setError('Failed to save the invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 z-50 flex justify-center items-start pt-10 pb-10 overflow-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 m-4 transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">{invoiceToEditId ? 'Edit Invoice' : 'Create New Invoice'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-8 w-8" />
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client*</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required>
                <option value="">Select a Client</option>
                {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice #</label>
              <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., INV-2023-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Issue Date*</label>
              <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date*</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min={issueDate} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="mt-6">
            <div className="grid grid-cols-12 gap-3 items-center mb-2 px-1 text-sm font-medium text-gray-600">
              <div className="col-span-12 md:col-span-5">Product / Service</div>
              <div className="col-span-4 md:col-span-2">Quantity</div>
              <div className="col-span-4 md:col-span-2">Rate</div>
              <div className="col-span-3 md:col-span-2 text-right">Amount</div>
              <div className="col-span-1"></div>
            </div>
            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-12 md:col-span-5">
                    <input type="text" placeholder="Description" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    {/* --- MODIFIED: Added min attribute --- */}
                    <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" min="1" />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                     {/* --- MODIFIED: Added min and step attributes --- */}
                    <input type="number" placeholder="Rate (₹)" value={item.rate} onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" min="0.01" step="0.01" />
                  </div>
                  <div className="col-span-3 md:col-span-2 text-right">
                    <p className="p-2 text-gray-800 font-medium">₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}</p>
                  </div>
                  <div className="col-span-1 flex justify-end items-center">
                    {lineItems.length > 1 && (
                      <button type="button" onClick={() => removeLineItem(index)} className="text-red-500 hover:text-red-700 p-1">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addLineItem} className="mt-3 flex items-center text-indigo-600 hover:text-indigo-800 font-semibold">
              <PlusIcon className="h-5 w-5 mr-1" /> Add Item
            </button>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mt-6">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-gray-600 flex-shrink-0">Discount</label>
                <div className="flex items-center space-x-2">
                  <input type="number" value={discountAmount} onChange={handleDiscountAmountChange} className="w-24 p-1 text-right border border-gray-300 rounded-md" step="0.01" min="0" placeholder="Amount" />
                  <span className="text-gray-600">₹</span>
                  <span className="text-sm text-gray-500">or</span>
                  <input type="number" value={discountPercentage} onChange={handleDiscountPercentageChange} className="w-20 p-1 text-right border border-gray-300 rounded-md" step="0.01" min="0" placeholder="Percent" />
                  <span className="text-gray-600">%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-gray-600">Advance Paid (₹)</label>
                <input type="number" value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)} className="w-28 p-1 text-right border border-gray-300 rounded-md" step="0.01" min="0" />
              </div>
              <hr />
              <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-indigo-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-6 border-t border-gray-200 space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-indigo-400 disabled:cursor-wait">
              {isSubmitting ? 'Saving...' : (invoiceToEditId ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditInvoiceModal;