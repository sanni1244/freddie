interface DeleteIdentityProps {
    identityId: string;
    onDelete: (id: string) => void;
  }
  
  const DeleteIdentity = ({ identityId, onDelete }: DeleteIdentityProps) => {
    return (
      <div>
        <button onClick={() => onDelete(identityId)}>Confirm Delete</button>
      </div>
    );
  };
  
  export default DeleteIdentity;
  