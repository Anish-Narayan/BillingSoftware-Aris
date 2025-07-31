import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InvoiceTable from '../components/InvoiceTable';
import PaymentTable from '../components/PaymentTable';
import Modal from '../components/Modal';
import Select from 'react-select';
import { db } from '../../firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  getDocs,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';

const ClientDetail = () => {
  const { id } = useParams(); // Client ID from URL

  // Data states
  const [client, setClient] = useState(null);
  const [clientInvoices, setClientInvoices] = useState([]);
  const [clientPayments, setClientPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  // Form states
  const [invoiceForm, setInvoiceForm] = useState({ number: '', amount: '', dueDate: '' });
  const [paymentForm, setPaymentForm] = useState({ invoice: null, amount: '', date: new Date().toISOString().split('T')[0], mode: '', notes: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    setLoading(true);
    // Fetch client details
    const clientRef = doc(db, 'clients', id);
    getDoc(clientRef).then(docSnap => {
      if (docSnap.exists()) {
        setClient({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError('Client not found.');
      }
    }).catch(err => {
      setError('Failed to load client data.');
      console.error(err);
    });

    // Listener for this client's invoices
    const invoicesQuery = query(collection(db, 'invoices'), where('clientId', '==', id), orderBy('issueDate', 'desc'));
    const unsubInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      setClientInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Listener for this client's payments
    const paymentsQuery = query(collection(db, 'payments'), where('clientId', '==', id), orderBy('date', 'desc'));
    const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
      setClientPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { // Cleanup listeners
      unsubInvoices();
      unsubPayments();
    };
  }, [id]);

  // --- Calculated Values ---
  const { outstandingBalance } = useMemo(() => {
    const totalInvoiced = clientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = clientInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    return { outstandingBalance: totalInvoiced - totalPaid };
  }, [clientInvoices]);

  const clientUnpaidInvoicesOptions = useMemo(() =>
    clientInvoices
      .filter(inv => inv.status !== 'Paid')
      .map(inv => ({
        value: inv.id,
        label: `${inv.invoiceNumber} (₹${(inv.totalAmount - (inv.paidAmount || 0)).toFixed(2)} due)`,
        ...inv
      })), [clientInvoices]);

  // --- Form Handlers ---
  const resetForms = () => {
    setInvoiceForm({ number: '', amount: '', dueDate: '' });
    setPaymentForm({ invoice: null, amount: '', date: new Date().toISOString().split('T')[0], mode: '', notes: '' });
    setFormError('');
    setSaving(false);
  };

  // --- Add Invoice Logic ---
  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    const { number, amount, dueDate } = invoiceForm;
    if (!number || !amount || !dueDate) {
      setFormError('Please fill all invoice fields.');
      return;
    }
    setSaving(true);
    setFormError('');
    
    // Check for unique invoice number
    const q = query(collection(db, 'invoices'), where('invoiceNumber', '==', number.trim()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setFormError('This invoice number is already in use.');
      setSaving(false);
      return;
    }

    try {
      await addDoc(collection(db, 'invoices'), {
        invoiceNumber: number.trim(),
        clientId: client.id,
        clientName: client.name,
        totalAmount: parseFloat(amount),
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: dueDate,
        status: 'unpaid',
        paidAmount: 0,
        createdAt: serverTimestamp(),
      });
      setIsAddInvoiceModalOpen(false);
      resetForms();
    } catch (err) {
      console.error(err);
      setFormError('Failed to save invoice.');
    } finally {
      setSaving(false);
    }
  };

  // --- Add Payment Logic ---
  const handleSavePayment = async (e) => {
    e.preventDefault();
    const { invoice, amount, date, mode, notes } = paymentForm;
    if (!invoice || !amount || !date || !mode) {
      setFormError('Please fill all required payment fields.');
      return;
    }
    
    const paymentAmount = parseFloat(amount);
    const balanceDue = invoice.totalAmount - (invoice.paidAmount || 0);

    if (paymentAmount > balanceDue + 0.01) {
      setFormError(`Payment exceeds balance due of ₹${balanceDue.toFixed(2)}.`);
      return;
    }
    
    setSaving(true);
    setFormError('');

    const batch = writeBatch(db);
    try {
      const newTotalPaid = (invoice.paidAmount || 0) + paymentAmount;
      const newStatus = newTotalPaid >= invoice.totalAmount ? 'Paid' : 'Partially Paid';

      const paymentRef = doc(collection(db, 'payments'));
      batch.set(paymentRef, {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientId: client.id,
        clientName: client.name,
        amount: paymentAmount,
        date,
        paymentMode: mode,
        notes,
        createdAt: serverTimestamp(),
      });
      
      const invoiceRef = doc(db, 'invoices', invoice.id);
      batch.update(invoiceRef, {
        status: newStatus,
        paidAmount: newTotalPaid,
      });

      await batch.commit();
      setIsAddPaymentModalOpen(false);
      resetForms();
    } catch (err) {
      console.error(err);
      setFormError('Failed to save payment.');
    } finally {
      setSaving(false);
    }
  };

  // --- Render Logic ---
  if (loading) {
    return <div className="p-10 text-center"><Navbar /><h1 className="text-2xl mt-4">Loading Client Details...</h1></div>;
  }
  if (error) {
    return <div className="p-10 text-center"><Navbar /><h1 className="text-2xl text-red-600 mt-4">{error}</h1></div>;
  }
  if (!client) { // Should be covered by error state, but good for safety
    return <div className="p-10 text-center"><Navbar /><h1 className="text-2xl text-red-600 mt-4">Client not found.</h1></div>;
  }
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-10 overflow-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">{client.name}</h1>
          <Link to="/clients" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg">Back to Clients</Link>
        </div>

        <div className="bg-white shadow-xl rounded-xl p-8 mb-10 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-lg">
            <div><span className="font-semibold text-gray-600">Email:</span> {client.email}</div>
            <div><span className="font-semibold text-gray-600">Phone:</span> {client.phone}</div>
            <div className="col-span-1 md:col-span-2"><span className="font-semibold text-gray-600">Address:</span> {client.address}</div>
            <div className="col-span-1 md:col-span-2 text-2xl font-bold text-gray-800 mt-4">
              Outstanding Balance: <span className={outstandingBalance > 0 ? 'text-red-700' : 'text-green-700'}>₹{outstandingBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Invoices</h2>
            <button onClick={() => setIsAddInvoiceModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">Add New Invoice</button>
          </div>
          {clientInvoices.length > 0 ? <InvoiceTable invoices={clientInvoices} /> : <p className="text-lg text-gray-600 bg-white p-6 rounded-xl">No invoices for this client yet.</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Payments</h2>
            <button onClick={() => setIsAddPaymentModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">Add New Payment</button>
          </div>
          {clientPayments.length > 0 ? <PaymentTable payments={clientPayments} /> : <p className="text-lg text-gray-600 bg-white p-6 rounded-xl">No payments for this client yet.</p>}
        </div>

        {/* Add Invoice Modal */}
        <Modal isOpen={isAddInvoiceModalOpen} onClose={() => setIsAddInvoiceModalOpen(false)} title={`New Invoice for ${client.name}`}>
          <form onSubmit={handleSaveInvoice} className="space-y-4">
            {formError && <p className="text-red-500 text-center font-semibold">{formError}</p>}
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="invNumber">Invoice #</label>
              <input type="text" id="invNumber" value={invoiceForm.number} onChange={(e) => setInvoiceForm({...invoiceForm, number: e.target.value})} className="w-full p-2 border rounded" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" htmlFor="invAmount">Amount (₹)</label>
                <input type="number" id="invAmount" value={invoiceForm.amount} onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" htmlFor="invDueDate">Due Date</label>
                <input type="date" id="invDueDate" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})} className="w-full p-2 border rounded" required />
              </div>
            </div>
            <div className="flex justify-end pt-4 space-x-2">
              <button type="button" onClick={() => setIsAddInvoiceModalOpen(false)} className="bg-gray-200 py-2 px-4 rounded">Cancel</button>
              <button type="submit" disabled={saving} className="bg-indigo-600 text-white py-2 px-4 rounded disabled:bg-indigo-400">{saving ? 'Saving...' : 'Save Invoice'}</button>
            </div>
          </form>
        </Modal>

        {/* Add Payment Modal */}
        <Modal isOpen={isAddPaymentModalOpen} onClose={() => setIsAddPaymentModalOpen(false)} title={`New Payment for ${client.name}`}>
          <form onSubmit={handleSavePayment} className="space-y-4">
            {formError && <p className="text-red-500 text-center font-semibold">{formError}</p>}
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="payInvoice">For Invoice</label>
              <Select id="payInvoice" options={clientUnpaidInvoicesOptions} onChange={(opt) => setPaymentForm({...paymentForm, invoice: opt, amount: (opt.totalAmount - (opt.paidAmount || 0)).toFixed(2)})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="payAmount">Amount (₹)</label>
                  <input type="number" id="payAmount" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full p-2 border rounded" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="payDate">Date</label>
                  <input type="date" id="payDate" value={paymentForm.date} onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})} className="w-full p-2 border rounded" required />
                </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="payMode">Payment Mode</label>
              <Select id="payMode" options={[{value: 'Cash', label: 'Cash'}, {value: 'Bank Transfer', label: 'Bank Transfer'}, {value: 'Credit Card', label: 'Credit Card'}]} onChange={(opt) => setPaymentForm({...paymentForm, mode: opt.value})} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="payNotes">Notes</label>
              <textarea id="payNotes" value={paymentForm.notes} onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})} className="w-full p-2 border rounded h-20" />
            </div>
            <div className="flex justify-end pt-4 space-x-2">
              <button type="button" onClick={() => setIsAddPaymentModalOpen(false)} className="bg-gray-200 py-2 px-4 rounded">Cancel</button>
              <button type="submit" disabled={saving} className="bg-indigo-600 text-white py-2 px-4 rounded disabled:bg-indigo-400">{saving ? 'Saving...' : 'Save Payment'}</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ClientDetail;