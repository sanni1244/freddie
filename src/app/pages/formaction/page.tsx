'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import CreateTemplate from '../../components/create/createaction';
import EditTemplate from '../../components/edit/editaction';
import { Manager, FormTemplate, Job } from '@/types';
import BackButton from '@/app/components/backbutton';

const FormTemplatesPage = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
        setSelectedJobId(null);
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
      if (!selectedJobId || !selectedManagerId) {
        setTemplates([]);
        setSelectedTemplate(null);
        return;
      }
      setLoading(true);
      setMessage(null);
      try {
        const response = await api.get(`/form-templates?jobId=${selectedJobId}&managerId=${selectedManagerId}`);
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }
        const data: FormTemplate[] = response.data;
        setTemplates(data);
        setSelectedTemplate(data.length > 0 ? data[0] : null);
      } catch (error: any) {
        console.error('Error fetching form templates:', error);
        setMessage(error.message || 'Failed to load form templates.');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [selectedManagerId, selectedJobId]);

  const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedManagerId(e.target.value);
    setSelectedJobId(null);
    setTemplates([]);
    setSelectedTemplate(null);
    setIsEditing(false);
    setEditedTemplate(null);
  };

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedJobId(e.target.value);
    setTemplates([]);
    setSelectedTemplate(null);
    setIsEditing(false);
    setEditedTemplate(null);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const selected = templates.find((template) => template.id === templateId);
    setSelectedTemplate(selected || null);
    setIsEditing(false);
    setEditedTemplate(null);
  };

  const handleTemplateCreated = (newTemplate: FormTemplate) => {
    setTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
    if (!selectedTemplate) {
      setSelectedTemplate(newTemplate);
    }
  };

  const handleTemplateUpdated = (updatedTemplate: FormTemplate) => {
    setTemplates((prevTemplates) =>
      prevTemplates.map((template) => (template.id === updatedTemplate.id ? updatedTemplate : template))
    );
    setSelectedTemplate(updatedTemplate);
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
    <div className="relative p-6 max-w-7xl mx-auto min-h-screen">
      <BackButton />
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
            value={selectedJobId || ''}
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

      {selectedManagerId && selectedJobId && templates.length > 0 && (
        <div className="mb-8">
          <label className="block mb-2 text-sm font-semibold text-gray-700">Select Application Form</label>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            onChange={handleTemplateChange}
            value={selectedTemplate?.id || ''}
          >
            <option value="">Select Application</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.title} ({template.formType.toUpperCase()} FORM)
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedTemplate && !isEditing && (
        <div className="bg-gray-100 p-8 rounded-md shadow-md mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">{selectedTemplate.title}</h1>
          <p className="text-gray-600 text-sm mb-4">
            {selectedTemplate.formType.toUpperCase()} FORM
          </p>
          {selectedTemplate.groups.map((group, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2 border-b pb-2">{group.title}</h3>
              {group.fields.map((field) => (
                <div key={field.id} className="mb-3">
                  <label htmlFor={`field-${field.id}`} className="block text-gray-700 text-sm font-bold mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type}
                    id={`field-${field.id}`}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder={field.placeholder || ''}
                    required={field.required}
                    readOnly
                  />
                </div>
              ))}
            </div>
          ))}
          <div className="flex justify-end mt-6">
            <button
              onClick={() => handleEdit(selectedTemplate)}
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Edit Application
            </button>
          </div>
        </div>
      )}

      {isEditing && editedTemplate && (
        <div className="">
          <div className="">
            <h2 className="text-lg font-semibold mb-4">Edit Form Template</h2>
            <EditTemplate
              initialTemplate={JSON.stringify(editedTemplate)}
              managerId={selectedManagerId}
              onTemplateUpdated={handleTemplateUpdated}
              onCancel={handleCancelEdit}
              form={editedTemplate}
              onFormUpdated={() => { }}
            />
          </div>
        </div>
      )}

      {selectedManagerId && selectedJobId && !isEditing && (
        <div className="mt-8">
          <CreateTemplate
            onTemplateCreated={handleTemplateCreated}
            managerId={selectedManagerId}
            jobId={selectedJobId}
          />
        </div>
      )}
      {selectedManagerId && selectedJobId && templates.length === 0 && !loading && !isEditing && (
        <p className="text-gray-600">No job application forms available for the selected job. You can create one below.</p>
      )}
    </div>
  );
};

export default FormTemplatesPage;