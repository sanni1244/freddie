'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { Identity } from '@/types';

interface DisplayManagerIdentitiesProps {
  managerId: string;
  identities: Identity[];
  onIdentityDeleted: (id: string) => void;
  onEdit: (identity: Identity) => void;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const DisplayManagerIdentities: React.FC<DisplayManagerIdentitiesProps> = ({
  managerId,
  identities,
  onIdentityDeleted,
  onEdit,
  setSuccessMessage,
  setErrorMessage,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (identityId: string) => {
    if (!showConfirmDelete) return;
    try {
      await api.delete(`/managers/${managerId}/identities/${identityId}`);
      onIdentityDeleted(identityId);
      setSuccessMessage('Identity deleted successfully.');
      setShowConfirmDelete(null);
    } catch (error) {
      setErrorMessage('Error deleting identity.');
      console.error('Error deleting identity:', error);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Manager's Identities:</h2>
      {identities.length > 0 ? (
        identities.map((identity) => (
          <div key={identity.id} className="mt-4 p-6 border rounded-xl shadow-sm bg-white">
            <p className="text-lg font-semibold text-gray-700">Email: {identity.identity}</p>
            <p className="text-md text-gray-600">Identity Type: {identity.identityType}</p>
            <p className="text-md text-gray-600">Verification Status: {identity.verificationStatus}</p>
            <p className="text-sm text-gray-500">Created At: {new Date(identity.createdAt).toLocaleDateString()}</p>
            <div className="mt-4 flex items-center space-x-4">
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                onClick={() => onEdit(identity)}
                disabled={identity.verificationStatus === 'verified'}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
                onClick={() => setShowConfirmDelete(identity.id)}
              >
                Delete
              </button>
            </div>
            {showConfirmDelete === identity.id && (
              <div className="mt-4 flex items-center space-x-4">
                <button
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300"
                  onClick={() => handleDelete(identity.id)}
                >
                  Confirm Delete
                </button>
                <button
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300"
                  onClick={() => setShowConfirmDelete(null)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500">No identities available for this manager.</p>
      )}
    </div>
  );
};

export default DisplayManagerIdentities;