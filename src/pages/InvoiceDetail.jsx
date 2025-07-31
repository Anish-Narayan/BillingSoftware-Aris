import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PaymentTable from '../components/PaymentTable';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const InvoiceDetail = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [invoicePayments, setInvoicePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const fetchInvoiceData = async () => {
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
      } finally {
        setLoading(false);
      }
    };
    fetchInvoiceData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const paymentsQuery = query(collection(db, 'payments'), where('invoiceId', '==', id), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
      setInvoicePayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [id]);
  
  // --- Calculations (no changes) ---
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
  
  const handleDownloadPdf = () => {
    if (!invoice) {
      alert("Cannot generate PDF: Invoice data is missing.");
      return;
    }
    setIsGeneratingPdf(true);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('INVOICE', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('BillingPro Inc.', 14, 40);
    doc.text('123 App Street, Suite 456', 14, 45);
    doc.text('Tech City, TC 78901', 14, 50);
    
    doc.setLineWidth(0.1);
    doc.line(14, 55, pageWidth - 14, 55);

    // --- Client and Invoice Info ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('BILL TO:', 14, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 14, 68);

    const infoX = pageWidth - 70;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice #:', infoX, 62);
    doc.text('Issue Date:', infoX, 68);
    doc.text('Due Date:', infoX, 74);
    
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoiceNumber, infoX + 25, 62);
    doc.text(invoice.issueDate, infoX + 25, 68);
    doc.text(invoice.dueDate, infoX + 25, 74);
    
    doc.line(14, 80, pageWidth - 14, 80);

    const tableHead = [['Description', 'Amount (₹)']];
    const tableBody = [[ 'Services Rendered', invoice.totalAmount.toFixed(2) ]];

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 85,
      theme: 'plain', // Use 'plain' theme to have full control over styling
      headStyles: { 
        fillColor: [29, 78, 216], // Solid blue background (Tailwind's blue-700)
        textColor: 255, // White text
        fontStyle: 'bold',
      },
      bodyStyles: {
        fillColor: [243, 244, 246] // Light gray background (Tailwind's gray-100)
      },
      styles: {
        cellPadding: 3,
        fontSize: 10
      },
      columnStyles: {
        1: { halign: 'right' } // Align the amount column to the right
      }
    });

    // --- Financial Summary ---
    const finalY = (doc).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    
    const totalX = pageWidth - 70;
    doc.text('Total Amount Due:', totalX, finalY + 15);
    doc.text(`₹${invoice.totalAmount.toFixed(2)}`, pageWidth - 14, finalY + 15, { align: 'right' });

    // --- Save ---
    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    setIsGeneratingPdf(false);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      case 'Overdue': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) return <div className="p-10 text-center"><Navbar /><h1 className="text-2xl mt-4">Loading Invoice...</h1></div>;
  if (error) return <div className="p-10 text-center"><Navbar /><h1 className="text-2xl text-red-600 mt-4">{error}</h1></div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-10 overflow-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">Invoice: {invoice.invoiceNumber}</h1>
          <div className="flex space-x-4">
             <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                         transition duration-200 ease-in-out transform hover:scale-105
                         disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </button>
            <Link to="/invoices" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg">Back to Invoices</Link>
          </div>
        </div>
        
        <div className="bg-white shadow-xl rounded-xl p-8 mb-10 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Internal View / Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-lg">
            <div><span className="font-semibold text-gray-600">Client:</span> {invoice.clientName}</div>
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