import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import InvoiceTable from '../components/InvoiceTable';
import Modal from '../components/Modal';
import Select from 'react-select';
import { db } from '../../firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs, // <-- Import getDocs for one-time fetch
  where,    // <-- Import where for querying
  serverTimestamp
} from 'firebase/firestore';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [formState, setFormState] = useState({
    invoiceNumber: '',
    selectedClient: null,
    totalAmount: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // --- Data Fetching ---
  useEffect(() => {
    setLoading(true);
    const invoicesQuery = query(collection(db, 'invoices'), orderBy('issueDate', 'desc'));
    const clientsQuery = query(collection(db, 'clients'), orderBy('name', 'asc'));

    const unsubInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setLoading(false);
    });
    const unsubClients = onSnapshot(clientsQuery, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => { unsubInvoices(); unsubClients(); };
  }, []);

  const clientOptions = useMemo(() =>
    clients.map(c => ({ value: c.id, label: `${c.name} (${c.email})`, ...c })),
    [clients]
  );
  
  // --- Form and Modal Handlers ---
  const resetForm = () => {
    setFormState({
      invoiceNumber: '', selectedClient: null, totalAmount: '',
      issueDate: new Date().toISOString().split('T')[0], dueDate: '',
    });
    setFormError('');
    setEditingInvoiceId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (invoiceId) => {
    const invoiceToEdit = invoices.find(inv => inv.id === invoiceId);
    if (!invoiceToEdit) return;
    const clientForInvoice = clientOptions.find(opt => opt.value === invoiceToEdit.clientId);
    setEditingInvoiceId(invoiceId);
    setFormState({
      invoiceNumber: invoiceToEdit.invoiceNumber, selectedClient: clientForInvoice || null,
      totalAmount: invoiceToEdit.totalAmount, issueDate: invoiceToEdit.issueDate, dueDate: invoiceToEdit.dueDate,
    });
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(resetForm, 300); 
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };
  
  const handleClientChange = (selectedOption) => {
    setFormState(prev => ({ ...prev, selectedClient: selectedOption }));
  };

  const handleSaveOrUpdateInvoice = async (e) => {
    e.preventDefault();
    const { invoiceNumber, selectedClient, totalAmount, issueDate, dueDate } = formState;

    if (!invoiceNumber || !selectedClient || !totalAmount || !issueDate || !dueDate) {
      setFormError('Please fill out all fields.');
      return;
    }
    setSaving(true);
    setFormError('');

    // --- Uniqueness Check ---
    const trimmedInvoiceNumber = invoiceNumber.trim();
    const q = query(collection(db, 'invoices'), where('invoiceNumber', '==', trimmedInvoiceNumber));
    const querySnapshot = await getDocs(q);
    
    let isDuplicate = false;
    if (!querySnapshot.empty) {
      if (editingInvoiceId) { // In Edit Mode
        // It's not a duplicate if the found doc is the one we are currently editing
        const isSameDoc = querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === editingInvoiceId;
        if (!isSameDoc) {
          isDuplicate = true;
        }
      } else { // In Create Mode
        isDuplicate = true;
      }
    }

    if (isDuplicate) {
      setFormError('This invoice number is already in use. Please choose another.');
      setSaving(false);
      return;
    }
    // --- End Uniqueness Check ---

    const invoiceData = {
      invoiceNumber: trimmedInvoiceNumber,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      totalAmount: parseFloat(totalAmount),
      issueDate,
      dueDate,
    };

    try {
      if (editingInvoiceId) {
        const invoiceRef = doc(db, 'invoices', editingInvoiceId);
        // Only update the form fields, preserving status and paidAmount
        await updateDoc(invoiceRef, invoiceData);
      } else {
        await addDoc(collection(db, 'invoices'), {
          ...invoiceData,
          status: 'unpaid', // Set initial status
          paidAmount: 0,   // Set initial paid amount
          createdAt: serverTimestamp()
        });
      }
      handleCloseModal();
    } catch (err) {
      console.error("Error saving invoice: ", err);
      setFormError('Failed to save invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice? This also deletes associated payments.')) {
      try {
        // Advanced: You might also want to delete all payments linked to this invoice.
        // This is a more complex operation involving a batch write to delete multiple docs.
        await deleteDoc(doc(db, 'invoices', id));
      } catch (err) {
        console.error("Error deleting invoice: ", err);
        alert("Failed to delete the invoice.");
      }
    }
  };

  const renderContent = () => {
    if (loading) return <div className="text-center text-lg text-gray-600">Loading invoices...</div>;
    if (error) return <div className="text-center text-lg text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>;
    if (invoices.length === 0) return (
      <div className="text-center bg-white p-10 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">No invoices yet</h2>
        <p className="mt-1 text-gray-600 mb-6">Click the button to create your first invoice.</p>
      </div>
    );
    return <InvoiceTable invoices={invoices} onEdit={handleOpenEditModal} onDelete={handleDelete} />;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-10 overflow-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">Invoices</h1>
          <button
            onClick={handleOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
          >
            Add New Invoice
          </button>
        </div>
        {renderContent()}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingInvoiceId ? 'Edit Invoice' : 'Create New Invoice'}>
        <form onSubmit={handleSaveOrUpdateInvoice} className="space-y-4">
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
              <input type="date" id="dueDate" value={formState.dueDate} onChange={handleInputChange} className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4" required />
            </div>
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={handleCloseModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-indigo-400 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : (editingInvoiceId ? 'Update Invoice' : 'Save Invoice')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Invoices;