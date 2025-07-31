import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ClientTable from '../components/ClientTable';
import Modal from '../components/Modal';
import { clients } from '../data/clients';
import { db } from '../../firebase'; // Import Firestore db
import { collection, addDoc } from 'firebase/firestore'; // Firestore functions

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

    // Basic form validation
    if (!formData.clientName || !formData.clientEmail) {
      setError('Client Name and Email are required.');
      return;
    }

    try {
      // Add client to Firestore 'clients' collection
      await addDoc(collection(db, 'clients'), {
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone,
        address: formData.clientAddress,
        createdAt: new Date(),
      });
      setSuccess('Client added successfully!');
      handleCloseModal(); // Close modal on success
    } catch (err) {
      console.error('Error adding client:', err);
      setError('Failed to add client. Please try again.');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-10 overflow-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">Clients</h1>
          <button
            onClick={handleAddClientClick}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                       transition duration-200 ease-in-out transform hover:scale-105"
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
                Client Name
              </label>
              <input
                type="text"
                id="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="clientEmail">
                Email
              </label>
              <input
                type="email"
                id="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="john.doe@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="clientPhone">
                Phone
              </label>
              <input
                type="text"
                id="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="123-456-7890"
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
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24"
                placeholder="123 Main St, Anytown, USA"
              ></textarea>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                           transition duration-200 ease-in-out transform hover:scale-105"
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