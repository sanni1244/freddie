'use client';
import React, { useState } from 'react';
import { FormTemplate, Group } from '@/types'; 
import api from '@/lib/api'; 

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
            const response = await api.post('/form-templates', payload);
            const data: FormTemplate = response.data;
            onTemplateCreated(data);
            setNewTemplate({
                title: '',
                formType: '',
                groups: [],
                fields: [],
            });
            setMessage('Form Template created successfully.');
        } catch (error: any) {
            console.error('Error creating form template:', error);
            setMessage(error.response?.data?.message || 'Failed to create form template.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewTemplate(prev => ({ ...prev, [name]: value }));
    };

    const handleFormTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewTemplate(prev => ({ ...prev, formType: e.target.value }));
    };

    const handleGroupInputChange = (e: React.ChangeEvent<HTMLInputElement>, groupIndex: number) => {
        const { name, value } = e.target;
        setNewTemplate(prevTemplate => {
            const newGroups = prevTemplate.groups ? [...prevTemplate.groups] : [];
            if (newGroups[groupIndex]) {
                newGroups[groupIndex] = { ...newGroups[groupIndex], [name]: name === 'sortOrder' ? parseInt(value, 10) : value };
            }
            return { ...prevTemplate, groups: newGroups };
        });
    };

    const handleFieldInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const [groupIndexStr, fieldIndexStr, fieldName] = name.split('-');
        const groupIndex = parseInt(groupIndexStr, 10);
        const fieldIndex = parseInt(fieldIndexStr, 10);

        setNewTemplate(prevTemplate => {
            const newGroups = prevTemplate.groups ? [...prevTemplate.groups] : [];
            if (newGroups[groupIndex]?.fields?.[fieldIndex]) {
                let updatedValue: string | number | boolean | string[] = value;
                if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
                    updatedValue = e.target.checked;
                } else if (fieldName === 'sortOrder') {
                    updatedValue = parseInt(value, 10);
                } else if (fieldName === 'options' && (newGroups[groupIndex].fields[fieldIndex].type === 'select' || newGroups[groupIndex].fields[fieldIndex].type === 'radio')) {
                    updatedValue = value.split(',').map(option => option.trim());
                }
                const updatedField = { ...newGroups[groupIndex].fields[fieldIndex], [fieldName]: updatedValue };
                const newFields = [...newGroups[groupIndex].fields];
                newFields[fieldIndex] = updatedField;
                newGroups[groupIndex] = { ...newGroups[groupIndex], fields: newFields };
            }
            return { ...prevTemplate, groups: newGroups };
        });
    };

    const addGroup = () => {
        setNewTemplate(prev => ({
            ...prev,
            groups: [...(prev.groups ?? []), { title: '', sortOrder: 0, fields: [] }],
        }) as Partial<FormTemplate>);
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
            if (newGroups[groupIndex]) {
                const updatedFields = [...(newGroups[groupIndex].fields || []), {
                    label: '',
                    type: 'text',
                    options: [], // Initialize as empty array.  
                    required: false,
                    applicantFieldMapping: 'none',
                    sortOrder: 0
                }];
                newGroups[groupIndex] = { ...newGroups[groupIndex], fields: updatedFields };
            }
            return { ...prevTemplate, groups: newGroups };
        });
    };

    const removeFieldFromGroup = (groupIndex: number, fieldIndex: number) => {
        setNewTemplate(prevTemplate => {
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
            <h2 className="text-2xl font-semibold text-blue-900 mb-6"> Create New Form Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <input
                    className="border border-gray-300 p-3 rounded-lg shadow-sm"
                    placeholder="Title"
                    name="title"
                    value={newTemplate.title || ''}
                    onChange={handleInputChange}
                />
                <select
                    className="border border-gray-300 p-3 rounded-lg shadow-sm"
                    name="formType"
                    value={newTemplate.formType || ''}
                    onChange={handleFormTypeChange}
                >
                    <option value="">Select Form Type</option>
                    <option value="application">Application</option>
                    <option value="assessment">Assessment</option>
                    <option value="others">Others</option>
                </select>
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
                                name="title"
                                value={group.title || ''}
                                onChange={(e) => handleGroupInputChange(e, groupIndex)}
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
                            onChange={(e) => handleGroupInputChange(e, groupIndex)}
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
                                            name={`${groupIndex}-${fieldIndex}-label`}
                                            value={field.label || ''}
                                            onChange={handleFieldInputChange}
                                        />
                                        <select
                                            className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                            name={`${groupIndex}-${fieldIndex}-type`}
                                            value={field.type || 'text'}
                                            onChange={handleFieldInputChange}>
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
                                        </select>
                                        <input
                                            className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                            placeholder={`Field ${fieldIndex + 1} Options (comma-separated)`}
                                            name={`${groupIndex}-${fieldIndex}-options`}
                                            value={Array.isArray(field.options) ? field.options.join(', ') : field.options || ''}
                                            onChange={handleFieldInputChange}
                                        />
                                        <select
                                            className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                            name={`${groupIndex}-${fieldIndex}-applicantFieldMapping`}
                                            value={field.applicantFieldMapping || 'none'}
                                            onChange={handleFieldInputChange}
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
                                            className="border border-gray-300 p-2 rounded-lg shadow-sm"
                                            placeholder={`Field ${fieldIndex + 1} Sort Order`}
                                            type="number"
                                            name={`${groupIndex}-${fieldIndex}-sortOrder`}
                                            value={field.sortOrder || 0}
                                            onChange={handleFieldInputChange}
                                        />
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                                name={`${groupIndex}-${fieldIndex}-required`}
                                                checked={field.required || false}
                                                onChange={handleFieldInputChange}
                                            />
                                            <span className="ml-2 text-gray-700 text-sm">Required</span>
                                        </label>
                                        <button
                                            type="button"
                                            className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded-md shadow-sm"
                                            onClick={() => removeFieldFromGroup(groupIndex, fieldIndex)}>
                                            Remove Field
                                        </button>
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
                    Create Template
                </button>
            </div>
        </div>
    );
};

export default CreateTemplate;