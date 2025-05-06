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
  options?: string;
  required: boolean;
  applicantFieldMapping?: string;
  sortOrder: number;
}

export interface FormGroup {
  title: string;
  fields: FormField[];
  sortOrder: number;
}

export interface FormTemplate {
  id: string;
  title: string;
  managerId: string;
  formType: string;
  groups: FormGroup[];
  fields: FormField[];
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
  options?: string; // e.g., for select fields
  required: boolean;
  applicantFieldMapping?: string;
  sortOrder: number;
}







export interface Field {
  label: string;
  type: string;
  options?: string;
  required: boolean;
  applicantFieldMapping?: string;
  sortOrder: number;
}

export interface Group {
  title: string;
  sortOrder: number;
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
  options?: string;
  required: boolean;
  applicantFieldMapping?: string;
  sortOrder: number;
}

export interface FormField {
  id?: string; 
  label: string;
  type: string;
  options?: string;
  required: boolean;
  applicantFieldMapping?: string;
  sortOrder: number;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  validationPattern?: string;
}


export interface FormField {
  id?: string;
  label: string;
  type: string;
  options?: string;
  required: boolean;
  applicantFieldMapping?: string;
  sortOrder: number;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  validationPattern?: string;
}

export interface FormGroupTemplate {
  id?: string;
  title: string;
  fields: FormField[]; // Ensure this is consistent
}