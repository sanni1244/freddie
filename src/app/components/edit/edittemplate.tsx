'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FormTemplate, Group, Field } from '@/types'; // Assuming these types exist
import api from '@/lib/api'; // Assuming this is a properly configured API client

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
        };

        setLoading(true);
        try {
            const response = await api.patch(`/form-templates/${editedTemplate.id}?managerId=${selectedManagerId}`, payload);
            const data: FormTemplate = response.data;
            onTemplateUpdated(data);
            setMessage('Form template updated successfully.');
            onCancel();
        } catch (error: any) {
            console.error('Error updating form template:', error);
            setMessage(error.response?.data?.message || 'Failed to update form template.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedTemplate((prev) => ({ ...prev, [name]: value }));
    };

    const handleGroupChange = useCallback((groupIndex: number, fieldName: string, value: any) => { // Use useCallback
        setEditedTemplate(prevTemplate => {
            if (!prevTemplate.groups) return { ...prevTemplate, groups: [{ title: '', sortOrder: 0, fields: [] }] };

            const newGroups = [...prevTemplate.groups];
            const groupToUpdate = { ...newGroups[groupIndex], [fieldName]: value };  //update the field
            newGroups[groupIndex] = groupToUpdate;
            return { ...prevTemplate, groups: newGroups };
        });
    }, []);

    const handleFieldChange = useCallback((groupIndex: number, fieldIndex: number, fieldName: string, value: any) => { // Use useCallback
        setEditedTemplate(prevTemplate => {
            if (!prevTemplate.groups) return { ...prevTemplate, groups: [{ title: '', sortOrder: 0, fields: [] }] };

            const newGroups = [...prevTemplate.groups];
            if (!newGroups[groupIndex]?.fields) return { ...prevTemplate, groups: newGroups };
            const newFields = [...newGroups[groupIndex].fields];
            const fieldToUpdate = { ...newFields[fieldIndex], [fieldName]: value };
            newFields[fieldIndex] = fieldToUpdate;
            newGroups[groupIndex] = { ...newGroups[groupIndex], fields: newFields };
            return { ...prevTemplate, groups: newGroups };
        });
    }, []);

    const handleAddFieldToGroup = useCallback((groupIndex: number) => {
        setEditedTemplate(prevTemplate => {
            const newGroups = prevTemplate.groups ? [...prevTemplate.groups] : [];
            if (newGroups[groupIndex]) {
                const updatedFields = [...(newGroups[groupIndex].fields || []), {
                    label: '',
                    type: 'text',
                    options: [],
                    required: false,
                    applicantFieldMapping: 'none',
                    sortOrder: 0
                }];
                newGroups[groupIndex] = { ...newGroups[groupIndex], fields: updatedFields };
            }
            return { ...prevTemplate, groups: newGroups };
        });
    }, []);

    const handleAddGroup = useCallback(() => {
        setEditedTemplate(prev => ({
            ...prev,
            groups: [...(prev.groups || []), { title: '', sortOrder: 0, fields: [] }],
        }));
    }, []);

    const removeGroup = (index: number) => {
        setEditedTemplate(prevTemplate => {
            const newGroups = prevTemplate.groups ? prevTemplate.groups.filter((_, i) => i !== index) : [];
            return { ...prevTemplate, groups: newGroups };
        });
    };

    const removeFieldFromGroup = (groupIndex: number, fieldIndex: number) => {
        setEditedTemplate(prevTemplate => {
            const newGroups = prevTemplate.groups ? [...prevTemplate.groups] : [];
            if (newGroups[groupIndex]?.fields) {
                const newFields = newGroups[groupIndex].fields.filter((_, i) => i !== fieldIndex);
                newGroups[groupIndex] = { ...newGroups[groupIndex], fields: newFields };
            }
            return { ...prevTemplate, groups: newGroups };
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
                <select
                    className="border border-gray-300 p-3 rounded-lg shadow-sm"
                    name="formType"
                    value={editedTemplate.formType || ''}
                    onChange={handleChange}
                >
                    <option value="">Select Form Type</option>
                    <option value="application">Application</option>
                    <option value="assessment">Assessment</option>
                    <option value="others">Others</option>
                </select>

                {/* Editing of groups */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700">Groups</label>
                    {editedTemplate.groups?.map((group, groupIndex) => (
                        <div key={groupIndex} className="border border-gray-300 p-4 rounded-lg shadow-sm my-4">
                            <div className="flex justify-between items-start mb-2">
                                <input
                                    className="border border-gray-300 p-2 rounded-lg shadow-sm w-3/4"
                                    placeholder={`Group ${groupIndex + 1} Title`}
                                    name="title"
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
                                name="sortOrder"
                                value={group.sortOrder || 0}
                                onChange={(e) => handleGroupChange(groupIndex, 'sortOrder', parseInt(e.target.value, 10) || 0)}
                            />

                            {/* Display fields within each group */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fields</label>
                                {group.fields?.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className="border border-gray-200 p-2 rounded-lg shadow-sm my-2">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            <input
                                                className="border border-gray-300 p-2 rounded-lg shadow-sm w-full"
                                                placeholder={`Field ${fieldIndex + 1} Label`}
                                                name="label"
                                                value={field.label || ''}
                                                onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'label', e.target.value)}
                                            />
                                            <select
                                                className="border border-gray-300 p-2 rounded-lg shadow-sm w-full"
                                                name="type"
                                                value={field.type || 'text'}
                                                onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'type', e.target.value)}
                                            >
                                                <option value="text">Text</option>
                                                <option value="textarea">Text Area</option>
                                                <option value="url">URL</option>
                                                <option value="phone">Phone</option>
                                                <option value="city">City</option>
                                                <option value="date">Date</option>
                                                <option value="country">Country</option>
                                                <option value="state">State</option>
                                                <option value="zipcode">Zipcode</option>
                                                <option value="select">Select</option>
                                                <option value="checkbox">Checkbox</option>
                                                <option value="number">Number</option>
                                                <option value="rating">Rating</option>
                                                <option value="radio">Radio</option>
                                                <option value="email">Email</option>
                                                <option value="document">Document</option>
                                                {/* Add more field types as needed */}
                                            </select>
                                            <input
                                                className="border border-gray-300 p-2 rounded-lg shadow-sm w-full"
                                                placeholder={`Field ${fieldIndex + 1} Options (comma-separated)`}
                                                name="options"
                                                value={Array.isArray(field.options) ? field.options.join(', ') : field.options || ''}
                                                onChange={(e) => {
                                                    const optionsValue = e.target.value.split(',').map(option => option.trim());
                                                    handleFieldChange(groupIndex, fieldIndex, 'options', optionsValue);
                                                }}
                                            />
                                            <select
                                                className="border border-gray-300 p-2 rounded-lg shadow-sm w-full"
                                                name="applicantFieldMapping"
                                                value={field.applicantFieldMapping || 'none'}
                                                onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'applicantFieldMapping', e.target.value)}
                                            >
                                                <option value="none">None</option>
                                                <option value="email">Email</option>
                                                <option value="firstname">First Name</option>
                                                <option value="middle name">Middle Name</option>
                                                <option value="lastname">Last Name</option>
                                                <option value="phone">Phone</option>
                                                <option value="full name">Full Name</option>
                                            </select>
                                            <input
                                                className="border border-gray-300 p-2 rounded-lg shadow-sm w-full"
                                                placeholder={`Field ${fieldIndex + 1} Sort Order`}
                                                type="number"
                                                name="sortOrder"
                                                value={field.sortOrder || 0}
                                                onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'sortOrder', parseInt(e.target.value, 10) || 0)}
                                            />
                                            <label className="inline-flex items-center mt-2">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                                    name="required"
                                                    checked={field.required || false}
                                                    onChange={(e) => handleFieldChange(groupIndex, fieldIndex, 'required', e.target.checked)}
                                                />
                                                <span className="ml-2 text-gray-700 text-sm">Required</span>
                                            </label>
                                            <button
                                                type="button"
                                                className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded-md shadow-sm"
                                                onClick={() => removeFieldFromGroup(groupIndex, fieldIndex)}
                                            >
                                                Remove Field
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md shadow-sm mt-2"
                                    onClick={() => handleAddFieldToGroup(groupIndex)}
                                >
                                    Add Field
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm"
                        onClick={handleAddGroup}
                    >
                        Add Group
                    </button>
                </div>
                 {/* Allow editing of root fields (outside groups) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700">Fields (Outside Groups)</label>
                    {editedTemplate.fields?.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="border border-gray-300 p-2 rounded-lg shadow-sm my-1">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                <input
                                    className="border border-gray-300 p-2 rounded-lg shadow-sm w-full"
                                    placeholder={`Field ${fieldIndex + 1} Label`}
                                    name="label"
                                    value={field.label || ''}
                                    onChange={(e) => handleFieldChange(0, fieldIndex, 'label', e.target.value)}
                                />
                                <select
                                    className="border border-gray-300 p-2 rounded-lg shadow-sm w-full"
                                    name="type"
                                    value={field.type || 'text'}
                                     onChange={(e) => handleFieldChange(0, fieldIndex, 'type', e.target.value)}
                                >
                                    <option value="text">Text</option>
                                    <option value="textarea">Text Area</option>
                                    <option value="url">URL</option>
                                    <option value="phone">Phone</option>
                                    <option value="city">City</option>
                                    <option value="date">Date</option>
                                    <option value="country">Country</option>
                                    <option value="state">State</option>
                                    <option value="zipcode">Zipcode</option>
                                    <option value="select">Select</option>
                                    <option value="checkbox">Checkbox</option>
                                    <option value="number">Number</option>
                                    <option value="rating">Rating</option>
                                     <option value="radio">Radio</option>
                                    <option value="email">Email</option>
                                    <option value="document">Document</option>
                                    {/* Add more field types as needed */}
                                </select>
                                <input
                                    className="border border-gray-300 p-2 rounded-lg shadow-sm w-full"
                                    placeholder={`Field ${fieldIndex + 1} Options`}
                                    name="options"
                                     value={Array.isArray(field.options) ? field.options.join(', ') : field.options || ''}
                                    onChange={(e) => {
                                         const optionsValue = e.target.value.split(',').map(option => option.trim());
                                         handleFieldChange(0, fieldIndex, 'options', optionsValue);
                                    }}
                                />
                                <select
                                    className="border border-gray-300 p-2 rounded-lg shadow-sm w-full"
                                    name="applicantFieldMapping"
                                    value={field.applicantFieldMapping || 'none'}
                                    onChange={(e) => handleFieldChange(0, fieldIndex, 'applicantFieldMapping', e.target.value)}
                                >
                                    <option value="none">None</option>
                                    <option value="email">Email</option>
                                    <option value="firstname">First Name</option>
                                    <option value="middle name">Middle Name</option>
                                    <option value="lastname">Last Name</option>
                                    <option value="phone">Phone</option>
                                    <option value="full name">Full Name</option>
                                </select>
                                <input
                                    className="border border-gray-300 p-2 rounded-lg shadow-sm w-full"
                                    placeholder={`Field ${fieldIndex + 1} Sort Order`}
                                    type="number"
                                    name="sortOrder"
                                    value={field.sortOrder || 0}
                                    onChange={(e) => handleFieldChange(0, fieldIndex, 'sortOrder', parseInt(e.target.value, 10) || 0)}
                                />
                                <label className="inline-flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                        name="required"
                                        checked={field.required || false}
                                         onChange={(e) => handleFieldChange(0, fieldIndex, 'required', e.target.checked)}
                                    />
                                    <span className="ml-2 text-gray-700 text-sm">Required</span>
                                </label>
                                 <button
                                            type="button"
                                            className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded-md shadow-sm"
                                            onClick={() => removeFieldFromGroup(0, fieldIndex)}
                                        >
                                            Remove Field
                                </button>
                            </div>
                        </div>
                    ))}
                     <button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md shadow-sm mt-2"
                        onClick={() => handleAddFieldToGroup(0)}
                    >
                        Add Field
                    </button>
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

