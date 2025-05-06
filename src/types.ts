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