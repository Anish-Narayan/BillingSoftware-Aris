import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PaymentTable from '../components/PaymentTable';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const InvoiceDetail = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [invoicePayments, setInvoicePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the main invoice document
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const invoiceRef = doc(db, 'invoices', id);
        const docSnap = await getDoc(invoiceRef);
        if (docSnap.exists()) {
          setInvoice({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Invoice not found.');
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError('Failed to load invoice data.');
      }
    };
    fetchInvoice();
  }, [id]);

  // Listen for real-time payment updates for this invoice
  useEffect(() => {
    if (!id) return;
    const paymentsQuery = query(collection(db, 'payments'), where('invoiceId', '==', id), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
      setInvoicePayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Error fetching payments:", err);
      setError('Failed to load payment history.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  // Calculate derived values efficiently
  const { totalPaid, balanceDue, currentStatus } = useMemo(() => {
    if (!invoice) return { totalPaid: 0, balanceDue: 0, currentStatus: 'Loading...' };
    const totalPaidCalc = invoicePayments.reduce((sum, p) => sum + p.amount, 0);
    const balanceDueCalc = invoice.totalAmount - totalPaidCalc;
    let status = 'Unpaid';
    if (balanceDueCalc <= 0) status = 'Paid';
    else if (totalPaidCalc > 0) status = 'Partially Paid';
    else if (new Date(invoice.dueDate) < new Date()) status = 'Overdue';
    return { totalPaid: totalPaidCalc, balanceDue: balanceDueCalc, currentStatus: status };
  }, [invoice, invoicePayments]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      case 'Overdue': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-10 text-center"><Navbar /><h1 className="text-2xl mt-4">Loading Invoice...</h1></div>;
  }

  if (error) {
    return <div className="p-10 text-center"><Navbar /><h1 className="text-2xl text-red-600 mt-4">{error}</h1></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-10 overflow-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">Invoice: {invoice.invoiceNumber}</h1>
          <Link to="/invoices" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg">Back to Invoices</Link>
        </div>

        <div className="bg-white shadow-xl rounded-xl p-8 mb-10 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Invoice Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-lg">
            <div><span className="font-semibold text-gray-600">Client:</span> {invoice.clientName}</div> {/* Changed */}
            <div><span className="font-semibold text-gray-600">Total Amount:</span> <span className="font-bold">₹{invoice.totalAmount.toFixed(2)}</span></div>
            <div><span className="font-semibold text-gray-600">Due Date:</span> {invoice.dueDate}</div>
            <div>
              <span className="font-semibold text-gray-600">Status:</span>
              <span className={`ml-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(currentStatus)}`}>
                {currentStatus}
              </span>
            </div>
            <div><span className="font-semibold text-gray-600">Paid Amount:</span> <span className="font-bold text-green-700">₹{totalPaid.toFixed(2)}</span></div>
            <div><span className="font-semibold text-gray-600">Balance Due:</span> <span className="font-bold text-red-700">₹{balanceDue.toFixed(2)}</span></div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Payment History</h2>
          {invoicePayments.length > 0 ? (
            <PaymentTable payments={invoicePayments} />
          ) : (
            <p className="text-lg text-gray-600 bg-white p-6 rounded-xl shadow-md">No payments recorded for this invoice yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;