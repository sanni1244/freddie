'use client';
import React, { useState } from 'react';
import { Job } from '@/types';
import api from '@/lib/api';

interface CreateJobProps {
  onJobCreated: (newJob: Job) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
  selectedManagerId: string | null;
}

const CreateJob: React.FC<CreateJobProps> = ({ onJobCreated, setLoading, setMessage, selectedManagerId }) => {
  const [newJob, setNewJob] = useState<Partial<Omit<Job, 'id' | 'createdAt' | 'applicantCount'>>>({
    title: '',
    description: '',
    requirements: [],
    roles: [], 
    country: '',
    state: '',
    city: '',
    workMode: '',
    whyJoinUs: '',
    status: 'active',
  });

  const isValidJob = (job: Partial<Omit<Job, 'id' | 'createdAt' | 'applicantCount'>>) => {
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

  const handleCreateJob = async () => {
    if (!selectedManagerId) {
      setMessage('Please select a manager.');
      return;
    }
    if (!isValidJob(newJob)) {
      setMessage('Please fill in all required fields.');
      return;
    }
    const payload = {
      ...newJob,
      title: newJob.title?.trim(),
      description: newJob.description?.trim(),
      country: newJob.country?.trim(),
      state: newJob.state?.trim(),
      city: newJob.city?.trim(),
      workMode: newJob.workMode?.trim(),
      requirements: newJob.requirements, 
      roles: newJob.roles, 
      managerId: selectedManagerId,
    };

    setLoading(true);
    try {
      const response = await api.post('/jobs', payload);
      const data: Job = response.data;
      onJobCreated(data);
      setNewJob({
        title: '',
        description: '',
        requirements: [],
        roles: [], 
        country: '',
        state: '',
        city: '',
        workMode: '',
        whyJoinUs: '',
        status: 'active',
      });
      setMessage('Job created successfully.');
    } catch (error: any) {
      console.error('Error creating job:', error);
      setMessage(error.response?.data?.message || error.message || 'Failed to create job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6"> Create New Job</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Title"
          value={newJob.title || ''}
          onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
        />
        <select
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          value={newJob.workMode || ''}
          onChange={(e) => setNewJob({ ...newJob, workMode: e.target.value })}
        >
          <option value="">Select Work Mode</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
          <option value="on site">On Site</option>
        </select>
        <textarea
          className="border border-gray-300 p-3 rounded-lg shadow-sm md:col-span-2"
          placeholder="Description"
          value={newJob.description || ''}
          onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Requirements (comma separated)"
          value={newJob.requirements?.join(', ') || ''}
          onChange={(e) =>
            setNewJob({
              ...newJob,
              requirements: e.target.value.split(',').map((r) => r.trim()),
            })
          }
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Roles (comma separated)"
          value={newJob.roles?.join(', ') || ''}
          onChange={(e) =>
            setNewJob({
              ...newJob,
              roles: e.target.value.split(',').map((r) => r.trim()),
            })
          }
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Country"
          value={newJob.country || ''}
          onChange={(e) => setNewJob({ ...newJob, country: e.target.value })}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="State"
          value={newJob.state || ''}
          onChange={(e) => setNewJob({ ...newJob, state: e.target.value })}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="City"
          value={newJob.city || ''}
          onChange={(e) => setNewJob({ ...newJob, city: e.target.value })}
        />
        <textarea
          className="border border-gray-300 p-3 rounded-lg shadow-sm md:col-span-2"
          placeholder="Why Join Us"
          value={newJob.whyJoinUs || ''}
          onChange={(e) => setNewJob({ ...newJob, whyJoinUs: e.target.value })}
        />
      </div>
      <div className="mt-6">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md"
          onClick={handleCreateJob}
        >
           Create Job
        </button>
      </div>
    </div>
  );
};

export default CreateJob;
