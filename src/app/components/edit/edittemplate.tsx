'use client';
import { useState, useEffect } from 'react';
import { FormTemplate } from '@/types';
import api from '@/lib/api'; 

interface EditTemplateProps {
  template: FormTemplate;
  onTemplateUpdated: (updatedTemplate: FormTemplate) => void;
  onCancel: () => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
  selectedManagerId: string | null;
}

const EditTemplate: React.FC<EditTemplateProps> = ({
  template,
  onTemplateUpdated,
  onCancel,
  setLoading,
  setMessage,
  selectedManagerId,
}) => {
  const [editedTemplate, setEditedTemplate] = useState<Partial<FormTemplate>>(template);

  useEffect(() => {
    setEditedTemplate(template);
  }, [template]);

  // Basic validation - extend as needed for your specific requirements
  const isValidTemplate = (template: Partial<FormTemplate>) => {
    const requiredFields = [
      template.title?.trim(),
      template.formType?.trim(),
    ];
    return requiredFields.every(Boolean);
  };

    const handleSaveEdit = async () => {
        if (!editedTemplate || !editedTemplate.id || !selectedManagerId) {
            setMessage('Something went wrong.');
            return;
        }

        if (!isValidTemplate(editedTemplate)) {
            setMessage('Please fill in all required fields.');
            return;
        }
        const payload = {
            ...editedTemplate,
            title: editedTemplate.title?.trim(),
            formType: editedTemplate.formType?.trim(),
            groups: editedTemplate.groups, 
            fields: editedTemplate.fields,
        };

        setLoading(true);
        try {
            const response = await api.patch(`/form-templates/${editedTemplate.id}?managerId=${selectedManagerId}`, payload);
            const data: FormTemplate = response.data;
            onTemplateUpdated(data);
            setMessage('Form template updated successfully.');
            onCancel();
        } catch (error) {
            console.error('Error updating form template:', error);
        } finally {
            setLoading(false);
        }
    };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedTemplate((prev) => ({ ...prev, [name]: value }));
  };

    const handleGroupChange = (index: number, fieldName: string, value: null) => {
        setEditedTemplate(prevTemplate => {
            if (!prevTemplate.groups) return { ...prevTemplate };

            const newGroups = [...prevTemplate.groups];
            const groupToUpdate = { ...newGroups[index] };
          newGroups[index] = groupToUpdate;
            return { ...prevTemplate, groups: newGroups };
        });
    };

      const handleFieldChange = (index: number, fieldName: string, value: null) => {
        setEditedTemplate(prevTemplate => {
            if (!prevTemplate.fields) return { ...prevTemplate };

            const newFields = [...prevTemplate.fields];
            const fieldToUpdate = { ...newFields[index] };
            newFields[index] = fieldToUpdate;
            return { ...prevTemplate, fields: newFields };
        });
    };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">✏️ Edit Form Template</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Title"
          name="title"
          value={editedTemplate.title || ''}
          onChange={handleChange}
        />
        <input
          className="border border-gray-300 p-3 rounded-lg shadow-sm"
          placeholder="Form Type"
          name="formType"
          value={editedTemplate.formType || ''}
          onChange={handleChange}
        />

        {/* Editing of groups */}
        <div>
            <label className="block text-sm font-semibold text-gray-700">Groups</label>
             {editedTemplate.groups?.map((group, groupIndex) => (
                <div key={groupIndex} className="border border-gray-300 p-3 rounded-lg shadow-sm my-2">
                    <input
                      className="border border-gray-300 p-2 rounded-lg shadow-sm w-full"
                      placeholder={`Group ${groupIndex + 1} Title`}
                      value={group.title || ''}
                    />
                    <input
                      className="border border-gray-300 p-2 rounded-lg shadow-sm w-full mt-2"
                      placeholder={`Group ${groupIndex + 1} Sort Order`}
                      type="number"
                      value={group.sortOrder || 0}
                    />

                    {/* Display fields within each group */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700">Fields</label>
                        {group.fields?.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="border border-gray-200 p-2 rounded-lg shadow-sm my-1">
                                <input
                                  className="border border-gray-300 p-1 rounded-lg shadow-sm w-full"
                                  placeholder={`Field ${fieldIndex + 1} Label`}
                                  value={field.label || ''}
                                />
                                 <input
                                  className="border border-gray-300 p-1 rounded-lg shadow-sm w-full mt-1"
                                  placeholder={`Field ${fieldIndex + 1} Type`}
                                  value={field.type || ''}
                                />
                                 <input
                                  className="border border-gray-300 p-1 rounded-lg shadow-sm w-full mt-1"
                                  placeholder={`Field ${fieldIndex + 1} Options`}
                                  value={field.options || ''}
                                />
                                <input
                                  className="border border-gray-300 p-1 rounded-lg shadow-sm w-full mt-1"
                                  placeholder={`Field ${fieldIndex + 1} Applicant Field Mapping`}
                                  value={field.applicantFieldMapping || ''}
                                />
                                 <input
                                  className="border border-gray-300 p-1 rounded-lg shadow-sm w-full mt-1"
                                  placeholder={`Field ${fieldIndex + 1} Sort Order`}
                                  type="number"
                                  value={field.sortOrder || 0}
                                />
                                <label className="inline-flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                        checked={field.required || false}
                                    />
                                    <span className="ml-2 text-gray-700 text-sm">Required</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
        {/* Allow editing of root fields (outside groups) */}
         <div>
            <label className="block text-sm font-semibold text-gray-700">Fields (Outside Groups)</label>
             {editedTemplate.fields?.map((field, fieldIndex) => (
                <div key={fieldIndex} className="border border-gray-300 p-2 rounded-lg shadow-sm my-1">
                    <input
                      className="border border-gray-300 p-1 rounded-lg shadow-sm w-full"
                      placeholder={`Field ${fieldIndex + 1} Label`}
                      value={field.label || ''}
                    />
                     <input
                      className="border border-gray-300 p-1 rounded-lg shadow-sm w-full mt-1"
                      placeholder={`Field ${fieldIndex + 1} Type`}
                      value={field.type || ''}
                    />
                     <input
                      className="border border-gray-300 p-1 rounded-lg shadow-sm w-full mt-1"
                      placeholder={`Field ${fieldIndex + 1} Options`}
                      value={field.options || ''}
                    />
                    <input
                      className="border border-gray-300 p-1 rounded-lg shadow-sm w-full mt-1"
                      placeholder={`Field ${fieldIndex + 1} Applicant Field Mapping`}
                      value={field.applicantFieldMapping || ''}
                    />
                     <input
                      className="border border-gray-300 p-1 rounded-lg shadow-sm w-full mt-1"
                      placeholder={`Field ${fieldIndex + 1} Sort Order`}
                      type="number"
                      value={field.sortOrder || 0}
                    />
                    <label className="inline-flex items-center mt-2">
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-blue-600 rounded"
                            checked={field.required || false}
                        />
                        <span className="ml-2 text-gray-700 text-sm">Required</span>
                    </label>
                </div>
            ))}
        </div>
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

export default EditTemplate;
