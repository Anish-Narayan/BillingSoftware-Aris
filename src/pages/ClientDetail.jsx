import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InvoiceTable from '../components/InvoiceTable';
import PaymentTable from '../components/PaymentTable';
import AddEditInvoiceModal from '../components/AddEditInvoiceModal';
import AddPaymentModal from '../components/AddPaymentModal';
import { db } from '../../firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
} from 'firebase/firestore';

const ClientDetail = () => {
  const { id } = useParams(); // Client ID from URL

  // Data states
  const [client, setClient] = useState(null);
  const [allClients, setAllClients] = useState([]);
  const [clientInvoices, setClientInvoices] = useState([]);
  const [clientPayments, setClientPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  // --- Data Fetching ---
  // Fetch all clients for the Add/Edit Invoice Modal dropdown
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsQuery = query(collection(db, 'clients'), orderBy('name'));
        const querySnapshot = await getDocs(clientsQuery);
        setAllClients(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Failed to fetch clients list:", err);
      }
    };
    fetchClients();
  }, []);

  // Fetch details for the specific client
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
    }, (err) => {
        console.error("Invoice snapshot error:", err);
        setError("Failed to load invoices.");
        setLoading(false);
    });

    // Listener for this client's payments
    const paymentsQuery = query(collection(db, 'payments'), where('clientId', '==', id), orderBy('date', 'desc'));
    const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
      setClientPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
        console.error("Payment snapshot error:", err);
        setError("Failed to load payments.");
    });

    return () => { // Cleanup listeners
      unsubInvoices();
      unsubPayments();
    };
  }, [id]);

  // --- Calculated Values ---
  const { outstandingBalance } = useMemo(() => {
    const totalInvoiced = clientInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = clientInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    return { outstandingBalance: totalInvoiced - totalPaid };
  }, [clientInvoices]);

  const activeInvoices = useMemo(() =>
    clientInvoices.filter(inv => inv.status !== 'Paid'),
    [clientInvoices]
  );

  // --- Render Logic ---
  if (loading) {
    return <div className="p-10 text-center"><Navbar /><h1 className="text-2xl mt-4">Loading Client Details...</h1></div>;
  }
  if (error) {
    return <div className="p-10 text-center"><Navbar /><h1 className="text-2xl text-red-600 mt-4">{error}</h1></div>;
  }
  if (!client) {
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

        {/* Add/Edit Invoice Modal */}
        <AddEditInvoiceModal
          isOpen={isAddInvoiceModalOpen}
          onClose={() => setIsAddInvoiceModalOpen(false)}
          onSuccess={() => setIsAddInvoiceModalOpen(false)}
          invoiceToEditId={null} // We are only adding, not editing here
          clients={allClients}
        />

        {/* Add Payment Modal */}
        <AddPaymentModal
            isOpen={isAddPaymentModalOpen}
            onClose={() => setIsAddPaymentModalOpen(false)}
            onSuccess={() => setIsAddPaymentModalOpen(false)}
            activeInvoices={activeInvoices}
        />
      </div>
    </div>
  );
};

export default ClientDetail;