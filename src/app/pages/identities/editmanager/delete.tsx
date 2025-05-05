"use client";

interface DeleteIdentityProps {
  identityId: string;
  onConfirm: (id: string) => void;
  onClose: () => void;
}

export default function DeleteIdentity({ 
  identityId, 
  onConfirm, 
  onClose 
}: DeleteIdentityProps) {
  // ... component implementation
}