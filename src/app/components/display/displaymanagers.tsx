'use client';
import React from 'react';
import { Managerdetails } from '@/types';
import api from '@/lib/api';

interface DisplayManagersProps {
  managers: Managerdetails[];
  onEdit: (manager: Managerdetails) => void;
  onDelete: (managerId: string) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

/// This component is for displaying the list of managers
const DisplayManagers: React.FC<DisplayManagersProps> = ({ managers, onEdit, onDelete, setLoading, setMessage }) => {
  const handleDelete = async (managerId: string) => {
    setLoading(true);
    try {
      const response = await api.delete(`/managers/${managerId}`);
      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData.message || 'Failed to delete manager.');
      }
      onDelete(managerId);
      setMessage('Manager deleted successfully.');
    } catch (error) {
      console.error('Error deleting manager:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      {managers.map((manager) => (
        <div key={manager.id} className="border border-gray-200 p-6 rounded-2xl shadow-lg bg-white hover:shadow-xl transition-all">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-800">{manager.fullName}</h2>
            <div className="flex gap-3">
              <button onClick={() => onEdit(manager)} className="text-blue-600 font-medium hover:underline">
                ✏️ Edit
              </button>
              <button onClick={() => handleDelete(manager.id)} className="text-red-600 font-medium hover:underline">
                🗑️ Delete
              </button>
            </div>
          </div>
          <p className="text-gray-700 mt-2">
            <strong>Company:</strong> {manager.companyName}
          </p>
          <p className="text-gray-700 mt-2">{manager.companyDescription}</p>
          <div className="text-sm text-gray-500 mt-3">
          <p>
              <strong>Email:</strong> {manager.email}
            </p>
            <p>
              <strong>Joined:</strong> {new Date(manager.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisplayManagers;
