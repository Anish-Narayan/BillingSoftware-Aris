import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ClientTable from '../components/ClientTable';
import Modal from '../components/Modal';
import { db } from '../../firebase'; // Import Firestore db
import { collection, addDoc, onSnapshot } from 'firebase/firestore'; // Firestore functions

const Clients = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const clientsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClients(clientsData);
    }, (error) => {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients. Please try again.');
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const handleAddClientClick = () => {
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
    });
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Form validation
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      setError('Client Name, Email, and Phone are required.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.clientEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate phone number (remove non-digits and check length)
    const cleanedPhone = formData.clientPhone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      await addDoc(collection(db, 'clients'), {
        name: formData.clientName,
        email: formData.clientEmail,
        phone: cleanedPhone,
        address: formData.clientAddress,
        createdAt: new Date(),
      });
      setSuccess('Client added successfully!');
      handleCloseModal();
    } catch (err) {
      console.error('Error adding client:', err);
      setError('Failed to add client. Please try again.');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Clients</h1>
          <button
            onClick={handleAddClientClick}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md
                       transition duration-200 ease-in-out hover:scale-105"
          >
            Add New Client
          </button>
        </div>

        <ClientTable clients={clients} />

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Client">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="clientName">
                Client Name *
              </label>
              <input
                type="text"
                id="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="clientEmail">
                Email *
              </label>
              <input
                type="email"
                id="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="john.doe@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="clientPhone">
                Phone *
              </label>
              <input
                type="tel"
                id="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="123-456-7890"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="clientAddress">
                Address
              </label>
              <textarea
                id="clientAddress"
                value={formData.clientAddress}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
                placeholder="123 Main St, Anytown, USA"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md
                           transition duration-200 ease-in-out hover:scale-105"
              >
                Save Client
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Clients;