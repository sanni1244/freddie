'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import SuccessMessage from '../../components/success';
import ErrorMessage from '../../components/error';
import Back from '../../components/backbutton';
import DisplayTemplates from '../../components/display/displaytemplate';
import CreateTemplate from '../../components/create/createtemplate';
import EditTemplate from '../../components/edit/edittemplate';
import { Manager, FormTemplate } from '@/types'; 

const FormTemplatesPage = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await api.get('/managers');
        setManagers(response.data);
      } catch (error) {
        console.error('Error fetching managers:', error);
        setMessage('Failed to load managers.');
      }
    };
    fetchManagers();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!selectedManagerId) {
        setTemplates([]);
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(`/form-templates?managerId=${selectedManagerId}`);
        setTemplates(response.data);
      } catch (error) {
        console.error('Error fetching form templates:', error);
        setMessage('Failed to load form templates.');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [selectedManagerId]);

  const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedManagerId(e.target.value);
  };

  const handleTemplateCreated = (newTemplate: FormTemplate) => {
    setTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
  };

  const handleTemplateUpdated = (updatedTemplate: FormTemplate) => {
    setTemplates((prevTemplates) =>
      prevTemplates.map((template) => (template.id === updatedTemplate.id ? updatedTemplate : template))
    );
  };

  const handleEdit = (template: FormTemplate) => {
    setIsEditing(true);
    setEditedTemplate(template);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTemplate(null);
  };

  const handleTemplateDeleted = (templateId: string) => {
    setTemplates((prevTemplates) => prevTemplates.filter((template) => template.id !== templateId));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-b from-white to-blue-50 min-h-screen">
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
      {loading && <p className="text-blue-600 font-medium animate-pulse">Loading...</p>}

      {selectedManagerId && (
        <DisplayTemplates 
          templates={templates}
          onEdit={handleEdit}
          onDelete={handleTemplateDeleted}
          setLoading={setLoading}
          setMessage={setMessage}
          selectedManagerId={selectedManagerId}
        />
      )}

      {selectedManagerId && !isEditing && (
        <CreateTemplate 
          onTemplateCreated={handleTemplateCreated}
          setLoading={setLoading}
          setMessage={setMessage}
          selectedManagerId={selectedManagerId}
        />
      )}

      {isEditing && editedTemplate && selectedManagerId && (
        <EditTemplate
          template={editedTemplate}
          onTemplateUpdated={handleTemplateUpdated}
          onCancel={handleCancelEdit}
          setLoading={setLoading}
          setMessage={setMessage}
          selectedManagerId={selectedManagerId}
        />
      )}
    </div>
  );
};

export default FormTemplatesPage;