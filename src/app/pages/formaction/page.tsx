'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import CreateTemplate from '../../components/create/createaction';
import EditTemplate from '../../components/edit/editaction';
import { Manager, FormTemplate, Job } from '@/types';

const FormTemplatesPage = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await api.get('/managers');
        setManagers(response.data);
      } catch (error: any) {
        console.error('Error fetching managers:', error);
        setMessage(error.message || 'Failed to load managers.');
      }
    };
    fetchManagers();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!selectedManagerId) {
        setJobs([]);
        return;
      }
      setLoading(true);
      setMessage(null);
      try {
        const response = await api.get(`/jobs?managerId=${selectedManagerId}`);
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }
        const data: Job[] = response.data;
        setJobs(data);
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        setMessage(error.message || 'Failed to load jobs.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [selectedManagerId]);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!jobId || !selectedManagerId) {
        setTemplates([]);
        return;
      }
      setLoading(true);
      setMessage(null);
      try {
        const response = await api.get(`/form-templates?jobId=${jobId}&managerId=${selectedManagerId}`);
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }
        const data: FormTemplate[] = response.data;
        setTemplates(data);
      } catch (error: any) {
        console.error('Error fetching form templates:', error);
        setMessage(error.message || 'Failed to load form templates.');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [selectedManagerId, jobId]);

  const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedManagerId(e.target.value);
    setJobId(null);
    setIsEditing(false);
    setEditedTemplate(null);
    setTemplates([]); // Clear templates when manager changes
  };

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setJobId(e.target.value);
    setIsEditing(false);
    setEditedTemplate(null);
    setTemplates([]); // Clear templates when job changes
  };

  const handleTemplateCreated = (newTemplate: FormTemplate) => {
    setTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
  };

  const handleTemplateUpdated = (updatedTemplate: FormTemplate) => {
    setTemplates((prevTemplates) =>
      prevTemplates.map((template) => (template.id === updatedTemplate.id ? updatedTemplate : template))
    );
    setIsEditing(false);
    setEditedTemplate(null);
  };

  const handleEdit = (template: FormTemplate) => {
    setIsEditing(true);
    setEditedTemplate(template);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTemplate(null);
  };



  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-blue-900 drop-shadow-md">📄 Manage Form Templates</h1>
      {message && (
        <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-300 p-3 rounded-md shadow-sm">
          {message}
        </div>
      )}
      <div className="mb-8">
        <label className="block mb-2 text-sm font-semibold text-gray-700">Select Manager</label>
        <select
          className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          onChange={handleManagerChange}
          value={selectedManagerId || ''}
        >
          <option value="">Select Manager</option>
          {managers.map((manager) => (
            <option key={manager.id} value={manager.id}>
              {manager.fullName}
            </option>
          ))}
        </select>
      </div>

      {selectedManagerId && (
        <div className="mb-8">
          <label className="block mb-2 text-sm font-semibold text-gray-700">Select Job</label>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            onChange={handleJobChange}
            value={jobId || ''}
            disabled={!selectedManagerId}
          >
            <option value="">Select Job</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <p className="text-blue-600 font-medium animate-pulse">Loading...</p>}

      {selectedManagerId && jobId && (
        <>
          {templates.length > 0 ? (
            <div className="shadow-md rounded-md overflow-hidden">
              {templates.map((template) => (
                <div key={template.id} className="bg-white shadow-md rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-800">{template.title}</h2>
                  <p className="text-sm text-gray-600">Form Type: {template.formType}</p>
                  {template.groups.map((group) => (
                    <div key={group.id} className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-700 mb-2">{group.title}</h3>
                      {group.fields.map((field) => (
                        <div key={field.id} className="mb-2 border rounded p-3 bg-white">
                          <p><strong>Label:</strong> {field.label}</p>
                          <p><strong>Type:</strong> {field.type}</p>
                          <p><strong>Required:</strong> {field.required ? "Yes" : "No"}</p>
                          <p><strong>Options:</strong> {field.options?.join(", ") || "None"}</p>
                        </div>
                      ))}
                    </div>
                  ))}

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleEdit(template)}
                      className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No form templates available for the selected job.</p>
          )}
        </>
      )}

      {/* {isEditing && editedTemplate && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                    <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                        <h2 className="text-lg font-semibold mb-4">Edit Form Template</h2>
                        <EditTemplate
                            initialTemplate={editedTemplate}
                            onTemplateUpdated={handleTemplateUpdated}
                            onCancel={handleCancelEdit}
                            managerId={selectedManagerId}
                            jobId={jobId}
                        />
                    </div>
                </div>
            )}

            {selectedManagerId && jobId && !isEditing && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Create New Form Template</h2>
                    <CreateTemplate
                        onTemplateCreated={handleTemplateCreated}
                        managerId={selectedManagerId}
                        jobId={jobId}
                    />
                </div>
            )} */}
    </div>
  );
};

export default FormTemplatesPage;