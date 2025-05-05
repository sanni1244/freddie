'use client'

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Manager {
  id: string;
  fullName: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  roles: string[];
  country: string;
  state: string;
  city: string;
  workMode: string;
  whyJoinUs: string;
  status: string;
  applicantCount: number;
  createdAt: string;
}

const JobsPage = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState<Job | null>(null);
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    description: '',
    requirements: [],
    roles: [],
    country: '',
    state: '',
    city: '',
    workMode: '',
    whyJoinUs: '',
    status: 'active'
  });

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await api.get('/managers');
        setManagers(response.data);
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    fetchManagers();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!selectedManagerId) return;
      try {
        const response = await api.get(`/jobs?managerId=${selectedManagerId}`);
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, [selectedManagerId]);

  const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedManagerId(e.target.value);
  };

  const handleCreateJob = async () => {
    if (!selectedManagerId) return;
    try {
      const response = await api.post('/jobs', {
        ...newJob,
        managerId: selectedManagerId
      });
      setJobs([...jobs, response.data]);
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
        status: 'active'
      });
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const handleEditJob = (job: Job) => {
    setIsEditing(true);
    setEditedJob(job);
    setNewJob({ ...job });
  };

  const handleSaveEdit = async () => {
    if (!editedJob) return;
    try {
      const response = await api.patch(`/jobs/${editedJob.id}`, newJob);
      setJobs(jobs.map(j => (j.id === editedJob.id ? response.data : j)));
      setIsEditing(false);
      setEditedJob(null);
    } catch (error) {
      console.error('Error editing job:', error);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Manage Jobs</h1>

      <select
        className="border p-2 mb-4"
        onChange={handleManagerChange}
        value={selectedManagerId || ''}
      >
        <option value="">Select Manager</option>
        {managers.map(manager => (
          <option key={manager.id} value={manager.id}>
            {manager.fullName}
          </option>
        ))}
      </select>

      {jobs.map(job => (
        <div key={job.id} className="border p-4 mb-4 rounded shadow">
          <h2 className="text-lg font-semibold">{job.title}</h2>
          <p>{job.description}</p>
          <p className="text-sm">Location: {job.city}, {job.state}, {job.country}</p>
          <p className="text-sm">Mode: {job.workMode}</p>
          <p className="text-sm">Status: {job.status}</p>
          <p className="text-sm">Applicants: {job.applicantCount}</p>
          <p className="text-sm">Posted: {new Date(job.createdAt).toLocaleDateString()}</p>
          <button className="text-blue-500 mr-2" onClick={() => handleEditJob(job)}>Edit</button>
          <button className="text-red-500" onClick={() => handleDeleteJob(job.id)}>Delete</button>
        </div>
      ))}

      <div className="mt-6">
        <h2 className="text-lg font-bold mb-2">{isEditing ? 'Edit Job' : 'Create Job'}</h2>
        <input
          type="text"
          className="border p-2 mb-2 block w-full"
          placeholder="Title"
          value={newJob.title}
          onChange={e => setNewJob({ ...newJob, title: e.target.value })}
        />
        <textarea
          className="border p-2 mb-2 block w-full"
          placeholder="Description"
          value={newJob.description}
          onChange={e => setNewJob({ ...newJob, description: e.target.value })}
        />
        <input
          type="text"
          className="border p-2 mb-2 block w-full"
          placeholder="Requirements (comma separated)"
          value={newJob.requirements?.join(',') || ''}
          onChange={e =>
            setNewJob({ ...newJob, requirements: e.target.value.split(',') })
          }
        />
        <input
          type="text"
          className="border p-2 mb-2 block w-full"
          placeholder="Roles (comma separated)"
          value={newJob.roles?.join(',') || ''}
          onChange={e =>
            setNewJob({ ...newJob, roles: e.target.value.split(',') })
          }
        />
        <input
          type="text"
          className="border p-2 mb-2 block w-full"
          placeholder="Country"
          value={newJob.country}
          onChange={e => setNewJob({ ...newJob, country: e.target.value })}
        />
        <input
          type="text"
          className="border p-2 mb-2 block w-full"
          placeholder="State"
          value={newJob.state}
          onChange={e => setNewJob({ ...newJob, state: e.target.value })}
        />
        <input
          type="text"
          className="border p-2 mb-2 block w-full"
          placeholder="City"
          value={newJob.city}
          onChange={e => setNewJob({ ...newJob, city: e.target.value })}
        />
        <input
          type="text"
          className="border p-2 mb-2 block w-full"
          placeholder="Work Mode"
          value={newJob.workMode}
          onChange={e => setNewJob({ ...newJob, workMode: e.target.value })}
        />
        <textarea
          className="border p-2 mb-2 block w-full"
          placeholder="Why Join Us"
          value={newJob.whyJoinUs}
          onChange={e => setNewJob({ ...newJob, whyJoinUs: e.target.value })}
        />

        {isEditing ? (
          <button className="bg-blue-500 text-white p-2 rounded" onClick={handleSaveEdit}>
            Save Changes
          </button>
        ) : (
          <button className="bg-green-600 text-white p-2 rounded" onClick={handleCreateJob}>
            Create Job
          </button>
        )}
        {isEditing && (
          <button
            className="bg-gray-500 text-white p-2 rounded ml-2"
            onClick={() => {
              setIsEditing(false);
              setEditedJob(null);
              setNewJob({});
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
