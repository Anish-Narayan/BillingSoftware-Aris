// src/pages/Invoices.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import InvoiceTable from '../components/InvoiceTable';
import AddEditInvoiceModal from '../components/AddEditInvoiceModal'; // The new, powerful modal
import { db } from '../../firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const invoicesQuery = query(collection(db, 'invoices'), orderBy('issueDate', 'desc'));
    const clientsQuery = query(collection(db, 'clients'), orderBy('name', 'asc'));

    const unsubInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setLoading(false);
    }, (err) => {
        console.error("Error fetching invoices:", err);
        setError("Failed to load invoices.");
        setLoading(false);
    });

    const unsubClients = onSnapshot(clientsQuery, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (err) => {
        console.error("Error fetching clients:", err);
        setError("Failed to load client data.");
    });

    return () => { unsubInvoices(); unsubClients(); };
  }, []);
  
  const handleOpenCreateModal = () => {
    setEditingInvoiceId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (invoiceId) => {
    setEditingInvoiceId(invoiceId);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInvoiceId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
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

      {/* The modal is now much more powerful */}
      <AddEditInvoiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleCloseModal} // onSnapshot handles UI update, so just close modal
        invoiceToEditId={editingInvoiceId}
        clients={clients}
      />
    </div>
  );
};

export default Invoices;