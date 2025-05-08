'use client';
import React, { useState, useEffect } from 'react';
import { Managerdetails, EditManagerProps } from '@/types';
import api from '@/lib/api';

const EditManager: React.FC<EditManagerProps> = ({ manager, onManagerUpdated, onCancel, setLoading, setMessage }) => {
  const [editedManager, setEditedManager] = useState<Partial<Managerdetails>>(manager);

  useEffect(() => {
    setEditedManager(manager);
  }, [manager]);

  const isValidManager = (manager: Partial<Managerdetails>) => {
    // Check if all required fields are filled
    const requiredFields = [
      manager.fullName?.trim(),
      manager.companyName?.trim(),
    ];
    return requiredFields.every(Boolean);
  };

  const handleSaveEdit = async () => {
    // Validate the edited manager object before sending it to the API
    if (!editedManager || !editedManager.id) {
      setMessage('Something went wrong.');
      return;
    }
    if (!isValidManager(editedManager)) {
      setMessage('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch(`/managers/${editedManager.id}`, editedManager);
      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData.message || 'Failed to update manager.');
      }
      const data: Managerdetails = response.data;
      onManagerUpdated(data);
      setMessage('Manager updated successfully.');
      onCancel();
    } catch (error) {
      console.error('Error updating manager:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedManager((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">✏️ Edit Manager</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Full Name"
          name="fullName"
          value={editedManager.fullName || ''}
          onChange={handleChange}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Email"
          name="email"
          value={editedManager.email || ''}
          onChange={handleChange}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Company Name"
          name="companyName"
          value={editedManager.companyName || ''}
          onChange={handleChange}
        />
        <textarea
          className="border border-gray-300 p-3 rounded-lg shadow-sm md:col-span-2"
          placeholder="Company Description"
          name="companyDescription"
          value={editedManager.companyDescription || ''}
          onChange={handleChange}
        />
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md"
          onClick={handleSaveEdit}
        >
          💾 Save Changes
        </button>
        <button
          className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg shadow-md"
          onClick={onCancel}
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );
};

export default EditManager;