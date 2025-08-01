// src/components/AddClientModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal'; // Assuming a generic modal wrapper component
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

const AddClientModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
      });
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.clientName || !formData.clientEmail) {
      setError('Client Name and Email are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'clients'), {
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone,
        address: formData.clientAddress,
        createdAt: new Date(),
      });
      onSuccess(); // Notify parent component of success
    } catch (err) {
      console.error('Error adding client:', err);
      setError('Failed to add client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // We don't render anything if the modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Client">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
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
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md
                       transition duration-200 ease-in-out transform hover:scale-105 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Client'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddClientModal;