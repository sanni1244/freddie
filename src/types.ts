export type Manager = {
    id: string;
    fullName: string;
    email: string;
    // Add other fields you use
  };

  export interface Managerdetails {
    id: string;
    fullName: string;
    email: string;
    companyName: string;  
    companyDescription: string;
    createdAt: string;
  }

  export interface EditManagerProps {
    manager: Managerdetails;
    onManagerUpdated: (updatedManager: Managerdetails) => void;
    onCancel: () => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setMessage: React.Dispatch<React.SetStateAction<string | null>>;
  }
  
 export interface Job {
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
  export type Identity = {
    id: string;
    identityType: string;
    identity: string;
    verificationStatus: string;
    createdAt: string;
  };






export interface FormField {
  label: string;
  type: string;
  options?: string[];
  required: boolean;
  applicantFieldMapping?: string;
  sortOrder: number;
}


export interface FormTemplate {
  id: string;
  initialTemplate: [];
  title: string;
  name: string;
  group: string;
  formType: string;
  groups: FormGroup[];
  fields: FormField[];
  description?: string;
  createdAt?: string;
  updatedAt?: string; 
  version?: number;
}

export interface Group {
  id?: string;
  title: string;
  sortOrder: number;
  fields?: Field[];
}

export interface Field {
  id?: string;
  label: string;
  type: string;
  required: boolean;
  options: string;
  applicantFieldMapping?: string;
  sortOrder: number;
  fields: '';
}

export interface Form {
  id: string;
  title: string;
  // managerId: string;
  formType: string;
  groups: FormGroup[];
  fields: FormField[];
  
}

export interface FormField {
  label: string;
  type: string;
  required: boolean;
  applicantFieldMapping?: string;
  sortOrder: number;
  id?: string; 
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  validationPattern?: string;
}

export interface FormGroupTemplate {
  id?: string;
  title: string;
  fields: FormField[];
}

export interface LocalField {
  id?: string;
  label: string;
  type: string;
  options?: string; // Keep as string for input
  required?: boolean;
  applicantFieldMapping?: string;
  sortOrder: number;
}


export interface FormGroup {
  title: string;
  sortOrder: number;
  fields: FormField[];
}


export interface EditFormProps {
  initialTemplate: string; 
  managerId: string | null;
  jobId: string | null;
  onTemplateUpdated: (updatedTemplate: FormTemplate) => void;
  onCancel: () => void;
}

export interface Response {
    label: string;
    value: any;
    fileUrl: string;
    fieldId: string;
    createdAt: string;
}

export interface FormResponse {
    applicantId: string;
    createdAt: string;
    d: string;
  token: string;
  isActive: boolean;
    responses: Response[];
}

export interface ApiResponse {
    data: FormResponse[];
    total: number;
    page: number;
    limit: number;
}