'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
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
      setMessage(null);
      try {
        const response = await fetch(`https://api-freddie.ai-wk.com/form-templates?managerId=${selectedManagerId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: FormTemplate[] = await response.json();
        setTemplates(data);
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

      {selectedManagerId && templates.length > 0 && !isEditing && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{template.title}</h2>
              <p className="text-gray-600 mb-2">Type: {template.formType}</p>

              {template.groups && template.groups.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">Groups:</h3>
                  <ul>
                    {template.groups.map((group) => (
                      <li key={group.title} className="text-gray-500 mb-2">
                        <span className="font-medium">{group.title}</span>
                        {group.fields && group.fields.length > 0 && (
                          <ul className="ml-4">
                            <li className="text-sm text-gray-600">Fields:</li>
                            {group.fields.map((field, index) => (
                              <li key={`${group.title}-${index}`} className="text-xs text-gray-500">
                                - {field.label} ({field.type})
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                                {field.applicantFieldMapping && <span className="ml-1 italic">({field.applicantFieldMapping})</span>}
                                {field.options && <span className="ml-1">Options: {field.options}</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {template.fields && template.fields.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mt-2 mb-1">Top-Level Fields:</h3>
                  <ul>
                    {template.fields.map((field, index) => (
                      <li key={`field-${index}`} className="text-sm text-gray-500">
                        - {field.label} ({field.type})
                        {field.required && <span className="ml-1 text-red-500">*</span>}
                        {field.applicantFieldMapping && <span className="ml-1 italic">({field.applicantFieldMapping})</span>}
                        {field.options && <span className="ml-1">Options: {field.options}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => handleEdit(template)}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Edit
              </button>
              {/* You might want to add a delete button here as well */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormTemplatesPage;