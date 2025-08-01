// src/components/AddEditInvoiceModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import Select from 'react-select';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  where,
  serverTimestamp,
  query
} from 'firebase/firestore';

const AddEditInvoiceModal = ({ isOpen, onClose, onSuccess, invoiceToEditId, clients }) => {
  const initialFormState = {
    invoiceNumber: '',
    selectedClient: null,
    totalAmount: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
  };

  const [formState, setFormState] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const clientOptions = useMemo(() =>
    clients.map(c => ({ value: c.id, label: `${c.name} (${c.email})`, ...c })),
    [clients]
  );

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!invoiceToEditId) {
        setFormState(initialFormState);
        return;
      }
      setLoading(true);
      const invoiceRef = doc(db, 'invoices', invoiceToEditId);
      const docSnap = await getDoc(invoiceRef);
      if (docSnap.exists()) {
        const invoiceData = docSnap.data();
        const clientForInvoice = clientOptions.find(opt => opt.value === invoiceData.clientId);
        setFormState({
          invoiceNumber: invoiceData.invoiceNumber,
          selectedClient: clientForInvoice || null,
          totalAmount: invoiceData.totalAmount,
          issueDate: invoiceData.issueDate,
          dueDate: invoiceData.dueDate,
        });
      }
      setLoading(false);
    };

    if (isOpen) {
      setFormError('');
      fetchInvoiceData();
    }
  }, [isOpen, invoiceToEditId, clients]); // Rerun if clients load after modal opens

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleClientChange = (selectedOption) => {
    setFormState(prev => ({ ...prev, selectedClient: selectedOption }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { invoiceNumber, selectedClient, totalAmount, issueDate, dueDate } = formState;

    if (!invoiceNumber || !selectedClient || !totalAmount || !issueDate || !dueDate) {
      setFormError('Please fill out all required fields.');
      return;
    }
    setSaving(true);
    setFormError('');

    const trimmedInvoiceNumber = invoiceNumber.trim();
    const q = query(collection(db, 'invoices'), where('invoiceNumber', '==', trimmedInvoiceNumber));
    const querySnapshot = await getDocs(q);
    
    let isDuplicate = false;
    if (!querySnapshot.empty) {
      if (invoiceToEditId) { // Editing
        const isSameDoc = querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === invoiceToEditId;
        if (!isSameDoc) isDuplicate = true;
      } else { // Creating
        isDuplicate = true;
      }
    }

    if (isDuplicate) {
      setFormError('This invoice number is already in use.');
      setSaving(false);
      return;
    }

    const invoiceData = {
      invoiceNumber: trimmedInvoiceNumber,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      totalAmount: parseFloat(totalAmount),
      issueDate,
      dueDate,
    };

    try {
      if (invoiceToEditId) {
        const invoiceRef = doc(db, 'invoices', invoiceToEditId);
        await updateDoc(invoiceRef, invoiceData);
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDueDate = new Date(dueDate);
        const initialStatus = selectedDueDate < today ? 'overdue' : 'unpaid';
        
        await addDoc(collection(db, 'invoices'), {
          ...invoiceData,
          status: initialStatus,
          paidAmount: 0,
          createdAt: serverTimestamp()
        });
      }
      onSuccess(); // Notify parent of success
    } catch (err) {
      console.error("Error saving invoice: ", err);
      setFormError('Failed to save invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={invoiceToEditId ? 'Edit Invoice' : 'Create New Invoice'}>
      {loading ? (
        <div className="text-center p-8">Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="text-red-500 text-center font-semibold">{formError}</p>}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="client">Client</label>
            <Select
              id="client"
              options={clientOptions}
              value={formState.selectedClient}
              onChange={handleClientChange}
              placeholder="Select a client..."
              classNamePrefix="react-select"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="invoiceNumber">Invoice #</label>
              <input type="text" id="invoiceNumber" value={formState.invoiceNumber} onChange={handleInputChange} className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="totalAmount">Amount (₹)</label>
              <input type="number" id="totalAmount" step="0.01" value={formState.totalAmount} onChange={handleInputChange} className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="issueDate">Issue Date</label>
              <input type="date" id="issueDate" value={formState.issueDate} onChange={handleInputChange} className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="dueDate">Due Date</label>
              <input type="date" id="dueDate" value={formState.dueDate} onChange={handleInputChange} className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4" min={formState.issueDate} required />
            </div>
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-indigo-400 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : (invoiceToEditId ? 'Update Invoice' : 'Save Invoice')}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AddEditInvoiceModal;