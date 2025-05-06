'use client';
import React, { useState } from 'react';
import { Managerdetails } from '@/types';
import api from '@/lib/api';

interface CreateManagerProps {
  onManagerCreated: (newManager: Managerdetails) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const sanitize = (value: string): string =>
  value.replace(/<script.*?>.*?<\/script>/gi, '').trim();

const isEmailValid = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const CreateManager: React.FC<CreateManagerProps> = ({ onManagerCreated, setLoading, setMessage }) => {
  const [newManager, setNewManager] = useState<Partial<Omit<Managerdetails, 'id' | 'createdAt'>>>({
    fullName: '',
    email: '',
    companyName: '',
    companyDescription: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    const { fullName = '', email = '', companyName = '' } = newManager;

    if (!sanitize(fullName)) newErrors.fullName = 'Full name is required.';
    if (!sanitize(email)) newErrors.email = 'Email is required.';
    else if (!isEmailValid(email)) newErrors.email = 'Invalid email format.';
    if (!sanitize(companyName)) newErrors.companyName = 'Company name is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateManager = async () => {
    if (!validateFields()) {
      setMessage('Please correct the errors.');
      return;
    }

    const payload = {
      fullName: sanitize(newManager.fullName!),
      email: sanitize(newManager.email!),
      companyName: sanitize(newManager.companyName!),
      companyDescription: sanitize(newManager.companyDescription || ''),
    };

    setLoading(true);
    try {
      const response = await api.post('/managers', payload);
      if (response.status !== 201) {
        throw new Error(response.data?.message || 'Failed to create manager.');
      }

      onManagerCreated(response.data);
      setNewManager({ fullName: '', email: '', companyName: '', companyDescription: '' });
      setMessage('Manager created successfully.');
      setErrors({});
    } catch (error: any) {
      console.error('Error creating manager:', error);
      setMessage(error.response?.data?.message || error.message || 'Failed to create manager.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof newManager, value: string) => {
    setNewManager({ ...newManager, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6"> Create New Manager</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <input
            className="border border-gray-300 p-3 rounded-lg shadow-sm w-full"
            placeholder="Full Name"
            value={newManager.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <input
            className="border border-gray-300 p-3 rounded-lg shadow-sm w-full"
            placeholder="Email"
            value={newManager.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <input
            className="border border-gray-300 p-3 rounded-lg shadow-sm w-full"
            placeholder="Company Name"
            value={newManager.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
          />
          {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
        </div>
        <div className="md:col-span-2">
          <textarea
            className="border border-gray-300 p-3 rounded-lg shadow-sm w-full"
            placeholder="Company Description"
            value={newManager.companyDescription || ''}
            onChange={(e) => handleChange('companyDescription', e.target.value)}
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md"
          onClick={handleCreateManager}
        >
           Create Manager
        </button>
      </div>
    </div>
  );
};

export default CreateManager;
