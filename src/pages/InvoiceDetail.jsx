// src/pages/InvoiceDetail.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PaymentTable from '../components/PaymentTable';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlignLeft } from 'lucide-react';

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
        const unsub = onSnapshot(invoiceRef, (docSnap) => {
          if (docSnap.exists()) {
            setInvoice({ id: docSnap.id, ...docSnap.data() });
          } else {
            setError('Invoice not found.');
          }
          setLoading(false);
        });
        return () => unsub();
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError('Failed to load invoice data.');
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

  const { totalPaid, balanceDue, currentStatus } = useMemo(() => {
    if (!invoice) return { totalPaid: 0, balanceDue: 0, currentStatus: 'Loading...' };
    const totalPaidCalc = invoicePayments.reduce((sum, p) => sum + p.amount, 0);
    const balanceDueCalc = (invoice.totalAmount || 0) - totalPaidCalc;

    let status = invoice.status;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const invoiceDueDate = new Date(invoice.dueDate);

    if (balanceDueCalc > 0 && invoiceDueDate < today) {
      status = 'Overdue';
    }

    return { totalPaid: totalPaidCalc, balanceDue: balanceDueCalc, currentStatus: status };
  }, [invoice, invoicePayments]);

  const handleDownloadPdf = () => {
    if (!invoice || !invoice.lineItems) {
      alert("Cannot generate PDF: Invoice data is incomplete.");
      return;
    }
    setIsGeneratingPdf(true);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const logoUrl = '/512x512-01.png';

    doc.addImage(logoUrl, 'PNG', 14, 15, 10, 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('ArisInnovations.', 26, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('+91 63858 70211 | www.arisinnovations.in | info@arisinnovations.in', 14, 30);

    doc.setLineWidth(0.5);
    doc.setDrawColor(150);
    doc.line(150, 15, 150, 35);

    doc.setFontSize(10);
    doc.text('Coimbatore,', 155, 22);
    doc.text('TN - 641029.', 155, 28);

    doc.setDrawColor(0);
    doc.setTextColor(0);

    let startY = 50;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('INVOICE', pageWidth / 2, startY, { align: 'center' });
    startY += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('BILL TO:', 14, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 14, startY + 6);

    const infoX = pageWidth - 70;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice #:', infoX, startY);
    doc.text('Issue Date:', infoX, startY + 6);
    doc.text('Due Date:', infoX, startY + 12);

    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoiceNumber, infoX + 25, startY);
    doc.text(invoice.issueDate, infoX + 25, startY + 6);
    doc.text(invoice.dueDate, infoX + 25, startY + 12);

    const tableStartY = startY + 22;

    const tableHead = [['Product/Service', 'Quantity', 'Rate (Rs)', 'Amount (Rs)']];
    const tableBody = invoice.lineItems.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return [
        item.description,
        quantity,
        rate.toFixed(2),
        (quantity * rate).toFixed(2)
      ];
    });

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: tableStartY,
      theme: 'striped',
      headStyles: { fillColor: [29, 78, 216] },
      styles: { cellPadding: 2.5, fontSize: 10 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    const finalY = doc.lastAutoTable.finalY;
    const summaryLabelX = pageWidth - 80;
    const valueX = pageWidth - 14;
    const symbolX = valueX - 23;

    let currentY = finalY + 10;

    const drawMoneyRow = (label, amount, bold = false, color = 'black', isNegative = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(color);
      doc.text(label, summaryLabelX, currentY, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.text('Rs', symbolX, currentY, { align: 'right' });

      doc.setFont('courier', 'normal');
      const formatted = `${isNegative ? '-' : ''}${Math.abs(amount).toFixed(2)}`;
      doc.text(formatted, valueX, currentY, { align: 'right' });

      currentY += 6;
      doc.setTextColor(0); // reset color
    };

    drawMoneyRow('Subtotal:', invoice.subtotal || 0);

    if (invoice.discountAmount > 0) {
      drawMoneyRow('Discount:', invoice.discountAmount, false, 'green', true);
    }

    drawMoneyRow('Total:', invoice.totalAmount || 0, true);

    if (invoice.advanceAmount > 0) {
      drawMoneyRow('Advance Paid:', invoice.advanceAmount, false, 'black', true);
    }

    if (totalPaid > 0) {
      drawMoneyRow('Payments Received:', totalPaid, false, 'black');
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('red');
    doc.text('Balance Due:', summaryLabelX, currentY + 2, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor('red');
    doc.text('Rs', symbolX, currentY + 2, { align: 'right' });

    doc.setFont('courier', 'bold');
    doc.text(balanceDue.toFixed(2), valueX, currentY + 2, { align: 'right' });

    doc.setTextColor(0);

    doc.save(`Invoice-${invoice.invoiceNumber || invoice.id}.pdf`);
    setIsGeneratingPdf(false);
  };


  const getStatusColor = (status = '') => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partially paid': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-10 text-center"><Navbar /><h1 className="text-2xl mt-4">Loading Invoice...</h1></div>;
  if (error) return <div className="p-10 text-center"><Navbar /><h1 className="text-2xl text-red-600 mt-4">{error}</h1></div>;
  if (!invoice) return <div className="p-10 text-center"><Navbar /><h1 className="text-2xl text-red-600 mt-4">Invoice data could not be loaded.</h1></div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800">Invoice {invoice.invoiceNumber}</h1>
            <p className="text-lg text-gray-500">for {invoice.clientName}</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition transform hover:scale-105 disabled:bg-blue-400 disabled:cursor-not-allowed">
              {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </button>
            <Link to="/invoices" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded-lg">Back</Link>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-xl p-8 mb-8 border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Product / Service</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Rate Rs</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Amount Rs</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.lineItems?.map(item => {
                  const quantity = parseFloat(item.quantity) || 0;
                  const rate = parseFloat(item.rate) || 0;
                  return (
                    <tr key={item.id}>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-800">{item.description}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-600 text-center">{quantity}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-600 text-right">Rs {rate.toFixed(3)}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-800 font-medium text-right">Rs {(quantity * rate).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* --- START: Layout and Style Fix --- */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-sm space-y-2 text-gray-700">
              <div className="grid grid-cols-2">
                <span className="text-right pr-4 text-sm">Subtotal:</span>
                <span className="text-right text-sm">Rs {(invoice.subtotal || 0).toFixed(2)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="grid grid-cols-2">
                  <span className="text-right pr-4 text-sm">Discount:</span>
                  <span className="text-right text-sm text-green-600">- Rs {(invoice.discountAmount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="grid grid-cols-2 font-bold border-t pt-2 mt-1">
                <span className="text-right pr-4 text-gray-900">Total:</span>
                <span className="text-right">Rs {(invoice.totalAmount || 0).toFixed(2)}</span>
              </div>
              {invoice.advanceAmount > 0 && (
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-right pr-4">Advance Paid:</span>
                  <span className="text-right">- Rs {(invoice.advanceAmount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="grid grid-cols-2 text-sm">
                <span className="text-right pr-4">Payments Received:</span>
                <span className="text-right">Rs {totalPaid.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 text-red-600 font-bold text-lg border-t pt-2 mt-1">
                <span className="text-right pr-4">Balance Due:</span>
                <span className="text-right">Rs {balanceDue.toFixed(2)}</span>
              </div>
            </div>
          </div>
          {/* --- END: Layout and Style Fix --- */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Internal Summary</h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between"><span>Due Date:</span> <span>{invoice.dueDate}</span></div>
              <div className="flex justify-between items-center">
                <span>Current Status:</span>
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full capitalize ${getStatusColor(currentStatus)}`}>
                  {currentStatus}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Payment History</h3>
            {invoicePayments.length > 0 ? (
              <PaymentTable payments={invoicePayments} />
            ) : (
              <p className="text-lg text-gray-600 bg-white p-6 rounded-xl shadow-md">No payments recorded for this invoice yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;