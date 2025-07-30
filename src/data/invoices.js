export const invoices = [
  {
    id: 'INV001',
    clientId: 'CL001',
    clientName: 'Acme Corporation',
    amount: 500.00,
    paidAmount: 500.00,
    dueDate: '2025-06-15',
    status: 'Paid',
    items: [
      { description: 'Web Design Project', quantity: 1, unitPrice: 500.00, total: 500.00 },
    ],
  },
  {
    id: 'INV002',
    clientId: 'CL002',
    clientName: 'Wayne Enterprises',
    amount: 1200.00,
    paidAmount: 800.00,
    dueDate: '2025-07-01',
    status: 'Partially Paid',
    items: [
      { description: 'Consulting Services', quantity: 20, unitPrice: 60.00, total: 1200.00 },
    ],
  },
  {
    id: 'INV003',
    clientId: 'CL001',
    clientName: 'Acme Corporation',
    amount: 300.00,
    paidAmount: 0.00,
    dueDate: '2025-07-25',
    status: 'Overdue', // Simulate overdue
    items: [
      { description: 'Maintenance Services', quantity: 1, unitPrice: 300.00, total: 300.00 },
    ],
  },
  {
    id: 'INV004',
    clientId: 'CL003',
    clientName: 'Stark Industries',
    amount: 2500.00,
    paidAmount: 0.00,
    dueDate: '2025-08-10',
    status: 'Unpaid',
    items: [
      { description: 'Software Development', quantity: 1, unitPrice: 2500.00, total: 2500.00 },
    ],
  },
  {
    id: 'INV005',
    clientId: 'CL004',
    clientName: 'Cyberdyne Systems',
    amount: 750.00,
    paidAmount: 750.00,
    dueDate: '2025-07-20',
    status: 'Paid',
    items: [
      { description: 'Server Migration', quantity: 1, unitPrice: 750.00, total: 750.00 },
    ],
  },
];