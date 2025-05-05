"use client";

interface CreateIdentityProps {
  managers: {
    id: string;
    fullName: string;
  }[];
  managerId: string | null;
  onCreate: (identity: {
    fullName?: string;
    companyName?: string;
    identity?: string;
    identityType?: string;
    managerId?: string;
  }) => void;
  onClose: () => void;
}

export default function CreateIdentity({ 
  managers, 
  managerId, 
  onCreate, 
  onClose 
}: CreateIdentityProps) {
  // ... component implementation
}