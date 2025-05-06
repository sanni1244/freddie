'use client';
import api from '@/lib/api';

type DeleteProp = {
  jobId: string;
  managerId: string;
  onDeleted: () => void;
};

export default function DeleteJob({ jobId, managerId, onDeleted }: DeleteProp) {
  const handleDelete = async () => {
    try {
      await api.delete(`/jobs/${jobId}?managerId=${managerId}`);
      onDeleted(); 
    } catch (err) { 
      console.error('Failed to delete job:', err);
      alert('Failed to delete job');
    }
  };

  return (
    <button onClick={handleDelete} className="text-red-600 hover:underline">🗑️ Delete</button>
  );
}
