'use client';
import React from 'react';
import { FormTemplate } from '@/types';
import api from '@/lib/api';

interface DisplayFormTemplatesProps {
  formTemplates: FormTemplate[];
  onEdit: (formTemplate: FormTemplate) => void;
  onDelete: (formTemplateId: string) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const DisplayFormTemplates: React.FC<DisplayFormTemplatesProps> = ({ formTemplates, onEdit, onDelete, setLoading, setMessage }) => {
  const handleDelete = async (formTemplateId: string) => {
    setLoading(true);
    try {
      const response = await api.delete(`/form-templates/${formTemplateId}`);
      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData.message || 'Failed to delete form template.');
      }
      onDelete(formTemplateId);
      setMessage('Form template deleted successfully.');
    } catch (error) {
      console.error('Error deleting form template:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!Array.isArray(formTemplates)) {
    return <div className="text-gray-500">No form templates to display.</div>;
  }

  return (
    <div className="grid gap-6">
      {formTemplates.map((formTemplate) => (
        <div key={formTemplate.id} className="border border-gray-200 p-6 rounded-2xl shadow-lg bg-white hover:shadow-xl transition-all">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-800">{formTemplate.title}</h2>
            <div className="flex gap-3">
              <button onClick={() => onEdit(formTemplate)} className="text-blue-600 font-medium hover:underline">
                ✏️ Edit
              </button>
              <button onClick={() => handleDelete(formTemplate.id)} className="text-red-600 font-medium hover:underline">
                🗑️ Delete
              </button>
            </div>
          </div>
          <p className="text-gray-700 mt-2">
            <strong>Form Type:</strong> {formTemplate.formType}
          </p>
          <div className='mt-4'>
          <h3 className='text-md font-semibold'>Groups: </h3>
            {formTemplate.groups.map((group, groupIndex) => (
              <div key={groupIndex} className='mb-4'>
                <p className='text-sm text-gray-600'>Title: {group.title}</p>
                 <p className='text-sm text-gray-600'>Sort Order: {group.sortOrder}</p>
                <h4 className='text-sm font-medium'>Fields: </h4>
                {group.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className='text-xs'>
                    <p>Label: {field.label}, Type: {field.type}, Required: {field.required ? 'Yes' : 'No'}, Sort Order: {field.sortOrder} </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
           <div className='mt-4'>
          <h3 className='text-md font-semibold'>Fields: </h3>
            {/* {formTemplate.fields.map((field, fieldIndex) => (
              <div key={fieldIndex} className='text-sm'>
                <p>Label: {field.label}, Type: {field.type}, Required: {field.required ? 'Yes' : 'No'}, Sort Order: {field.sortOrder} </p>
              </div>
            ))} */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisplayFormTemplates;

