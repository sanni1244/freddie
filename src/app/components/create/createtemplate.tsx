'use client';
import React, { useState } from 'react';
import { FormTemplate } from '@/types';
import api from '@/lib/api'; // Import your custom API client

interface CreateTemplateProps {
  onTemplateCreated: (newTemplate: FormTemplate) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
  selectedManagerId: string | null;
}

const CreateTemplate: React.FC<CreateTemplateProps> = ({ onTemplateCreated, setLoading, setMessage, selectedManagerId }) => {
  const [newTemplate, setNewTemplate] = useState<Partial<Omit<FormTemplate, 'id'>>>({
    title: '',
    formType: '',
    groups: [],
    fields: [],
  });

  // Basic validation for required fields
  const isValidTemplate = (template: Partial<Omit<FormTemplate, 'id'>>) => {
    const requiredFields = [
      template.title?.trim(),
      template.formType?.trim(),
    ];
    return requiredFields.every(Boolean);
  };

  const handleCreateTemplate = async () => {
    if (!selectedManagerId) {
      setMessage('Please select a manager.');
      return;
    }

    if (!isValidTemplate(newTemplate)) {
      setMessage('Please fill in all required fields.');
      return;
    }

    const payload = {
      ...newTemplate,
      title: newTemplate.title?.trim(),
      formType: newTemplate.formType?.trim(),
      managerId: selectedManagerId,
      groups: newTemplate.groups || [],
      fields: newTemplate.fields || [],
    };

    setLoading(true);
    try {
      const response = await api.post('/form-templates', payload); // Use your api client
      const data: FormTemplate = response.data;
      onTemplateCreated(data);
      setNewTemplate({  //reset form
        title: '',
        formType: '',
        groups: [],
        fields: [],
      });
      setMessage('Form Template created successfully.');
    } catch (error: any) {
      console.error('Error creating form template:', error);
      setMessage(error.response?.data?.message || error.message || 'Failed to create form template.');
    } finally {
      setLoading(false);
    }
  };

    //  Functions to handle changes in form fields
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewTemplate(prev => ({ ...prev, [name]: value }));
    };

    const handleGroupChange = (index: number, fieldName: string, value: any) => {
        setNewTemplate(prevTemplate => {
            const newGroups = prevTemplate.groups ? [...prevTemplate.groups] : [];
            const groupToUpdate = newGroups[index] ? { ...newGroups[index] } : { fields: [] };  // Ensure fields exist

            groupToUpdate[fieldName] = value;

            newGroups[index] = groupToUpdate;
            return { ...prevTemplate, groups: newGroups };
        });
    };

    const handleFieldChange = (groupIndex: number, fieldIndex: number, fieldName: string, value: any) => {
      setNewTemplate((prevTemplate) => {
        const newGroups = prevTemplate.groups ? [...prevTemplate.groups] : [];
        const groupToUpdate = newGroups[groupIndex] ? { ...newGroups[groupIndex] } : { fields: [] };
        const newFields = groupToUpdate.fields ? [...groupToUpdate.fields] : [];
        const fieldToUpdate = newFields[fieldIndex] ? { ...newFields[fieldIndex] } : {};

        fieldToUpdate[fieldName] = value;
        newFields[fieldIndex] = fieldToUpdate;
        groupToUpdate.fields = newFields;
        newGroups[groupIndex] = groupToUpdate;

        return { ...prevTemplate, groups: newGroups };
      });
    };

    const addGroup = () => {
        setNewTemplate(prev => ({
            ...prev,
            groups: [...(prev.groups || []), { title: '', sortOrder: 0, fields: [] }]
        }));
    };

      const removeGroup = (index: number) => {
        setNewTemplate(prevTemplate => {
            const newGroups = prevTemplate.groups ? prevTemplate.groups.filter((_, i) => i !== index) : [];
            return { ...prevTemplate, groups: newGroups };
        });
    };

    const addFieldToGroup = (groupIndex: number) => {
        setNewTemplate(prevTemplate => {
             const newGroups = prevTemplate.groups ? [...prevTemplate.groups] : [];
            const groupToUpdate = newGroups[groupIndex] ? { ...newGroups[groupIndex] } : { fields: [] };
            const newFields = groupToUpdate.fields ? [...groupToUpdate.fields] : [];

            newFields.push({
                label: '',
                type: 'text',
                options: '',
                required: false,
                applicantFieldMapping: '',
                sortOrder: 0
            });
            groupToUpdate.fields = newFields;
            newGroups[groupIndex] = groupToUpdate;

            return { ...prevTemplate, groups: newGroups };
        });
    };

      const removeFieldFromGroup = (groupIndex: number, fieldIndex: number) => {
        setNewTemplate(prevTemplate => {
           const newGroups = prevTemplate.groups ? [...prevTemplate.groups] : [];
            const groupToUpdate = newGroups[groupIndex] ? { ...newGroups[groupIndex] } : { fields: [] };
            const newFields = groupToUpdate.fields ? groupToUpdate.fields.filter((_, i) => i !== fieldIndex) : [];
            groupToUpdate.fields = newFields;
            newGroups[groupIndex] = groupToUpdate;
            return { ...prevTemplate, groups: newGroups };
        });
    };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">➕ Create New Form Template</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Title"
          name="title"
          value={newTemplate.title || ''}
          onChange={handleInputChange}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Form Type"
          name="formType"
          value={newTemplate.formType || ''}
          onChange={handleInputChange}
        />
      </div>

        {/* Groups Input */}
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Groups</label>
             {newTemplate.groups?.map((group, groupIndex) => (
                <div key={groupIndex} className="border border-gray-300 p-4 rounded-lg shadow-sm my-4">
                    <div className="flex justify-between items-start mb-2">
                        <input
                          className="border border-gray-300 p-2 rounded-lg shadow-sm w-3/4"
                          placeholder={`Group ${groupIndex + 1} Title`}
                          value={group.title || ''}
                          onChange={(e) => handleGroupChange(groupIndex, 'title', e.target.value)}
                        />
                         <button
                            type="button"
                            className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded-md shadow-sm"
                            onClick={() => removeGroup(groupIndex)}
                          >
                            Remove Group
                        </button>
                    </div>
                    <input
                      className="border border-gray-300 p-2 rounded-lg shadow-sm w-full mb-2"
                      placeholder={`Group ${groupIndex + 1} Sort Order`}
                      type="number"
                      value={group.sortOrder || 0}
                      onChange={(e) => handleGroupChange(groupIndex, 'sortOrder', parseInt(e.target.value, 10))}
                    />

                    {/* Fields within Group */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fields</label>
                         {group.fields?.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="border border-gray-200 p-2 rounded-lg shadow-sm my-2">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    <input
                                      className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                      placeholder={`Field ${fieldIndex + 1} Label`}
                                      value={field.label || ''}
                                      onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'label', e.target.value)}
                                    />
                                    <input
                                      className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                      placeholder={`Field ${fieldIndex + 1} Type`}
                                      value={field.type || 'text'}
                                      onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'type', e.target.value)}
                                    />
                                    <input
                                      className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                      placeholder={`Field ${fieldIndex + 1} Options`}
                                      value={field.options || ''}
                                      onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'options', e.target.value)}
                                    />
                                    <input
                                      className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                      placeholder={`Field ${fieldIndex + 1} Applicant Field Mapping`}
                                      value={field.applicantFieldMapping || ''}
                                      onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'applicantFieldMapping', e.target.value)}
                                    />
                                    <input
                                      className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                      placeholder={`Field ${fieldIndex + 1} Sort Order`}
                                      type="number"
                                      value={field.sortOrder || 0}
                                      onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'sortOrder', parseInt(e.target.value, 10))}
                                    />
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                            checked={field.required || false}
                                            onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'required', e.target.checked)}
                                        />
                                        <span className="ml-2 text-gray-700 text-sm">Required</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                         <button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md shadow-sm mt-2"
                            onClick={() => addFieldToGroup(groupIndex)}
                          >
                            Add Field
                        </button>
                         {group.fields?.length > 0 && (
                            <button
                                type="button"
                                className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-md shadow-sm mt-2 ml-2"
                                onClick={() => removeFieldFromGroup(groupIndex, group.fields.length -1)} // Remove last field
                            >
                                Remove Last Field
                            </button>
                        )}
                    </div>
                </div>
            ))}
            <button
              type="button"
              className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm"
              onClick={addGroup}
            >
              Add Group
            </button>
        </div>

      <div className="mt-6">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md"
          onClick={handleCreateTemplate}
        >
          ✅ Create Template
        </button>
      </div>
    </div>
  );
};

export default CreateTemplate;
