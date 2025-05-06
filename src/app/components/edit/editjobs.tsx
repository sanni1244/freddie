'use client';
import { useState, useEffect } from 'react';
import { Job } from '@/types';

interface EditJobProps {
  job: Job;
  onJobUpdated: (updatedJob: Job) => void;
  onCancel: () => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
  selectedManagerId: string | null;
}

const EditJob: React.FC<EditJobProps> = ({
  job,
  onJobUpdated,
  onCancel,
  setLoading,
  setMessage,
  selectedManagerId,
}) => {
  const [editedJob, setEditedJob] = useState<Partial<Job>>(job);

  useEffect(() => {
    setEditedJob(job);
  }, [job]);

  const isValidJob = (job: Partial<Job>) => {
    const requiredFields = [
      job.title?.trim(),
      job.description?.trim(),
      job.country?.trim(),
      job.state?.trim(),
      job.city?.trim(),
      job.workMode?.trim(),
    ];
    return requiredFields.every(Boolean);
  };

  const handleSaveEdit = async () => {
    if (!editedJob || !editedJob.id || !selectedManagerId) {
      setMessage('Something went wrong.');
      return;
    }
    if (!isValidJob(editedJob)) {
      setMessage('Please fill in all required fields.');
      return;
    }
    const payload = {
      ...editedJob,
      title: editedJob.title?.trim(),
      description: editedJob.description?.trim(),
      country: editedJob.country?.trim(),
      state: editedJob.state?.trim(),
      city: editedJob.city?.trim(),
      workMode: editedJob.workMode?.trim(),
      requirements: editedJob.requirements?.map((r) => r.trim()).filter(Boolean) || [],
      roles: editedJob.roles?.map((r) => r.trim()).filter(Boolean) || [],
      whyJoinUs: editedJob.whyJoinUs?.trim(),
    };

    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${editedJob.id}?managerId=${selectedManagerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update job.');
      }
      const data: Job = await response.json();
      onJobUpdated(data);
      setMessage('Job updated successfully.');
      onCancel();
    } catch (error: any) {
      console.error('Error updating job:', error);
      setMessage(error.message || 'Failed to update job.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'requirements' || name === 'roles') {
      setEditedJob((prev) => ({ ...prev, [name]: value.split(',').map((item) => item.trim()) }));
    } else {
      setEditedJob((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">✏️ Edit Job</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Title"
          name="title"
          value={editedJob.title || ''}
          onChange={handleChange}
        />
        <select
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          name="workMode"
          value={editedJob.workMode || ''}
          onChange={handleChange}
        >
          <option value="">Select Work Mode</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
          <option value="on site">On Site</option>
        </select>
        <textarea
          className="border border-gray-300 p-3 rounded-lg shadow-sm md:col-span-2"
          placeholder="Description"
          name="description"
          value={editedJob.description || ''}
          onChange={handleChange}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Requirements (comma separated)"
          name="requirements"
          value={editedJob.requirements?.join(', ') || ''}
          onChange={handleChange}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Roles (comma separated)"
          name="roles"
          value={editedJob.roles?.join(', ') || ''}
          onChange={handleChange}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Country"
          name="country"
          value={editedJob.country || ''}
          onChange={handleChange}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="State"
          name="state"
          value={editedJob.state || ''}
          onChange={handleChange}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="City"
          name="city"
          value={editedJob.city || ''}
          onChange={handleChange}
        />
        <textarea
          className="border border-gray-300 p-3 rounded-lg shadow-sm md:col-span-2"
          placeholder="Why Join Us"
          name="whyJoinUs"
          value={editedJob.whyJoinUs || ''}
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

export default EditJob;