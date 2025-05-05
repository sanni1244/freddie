// components/SuccessMessage.tsx
const SuccessMessage = ({ message }: { message: string }) => {
    return (
      <div className="p-4 mb-4 text-green-700 bg-green-100 border-l-4 border-green-500">
        <strong>{message}</strong>
      </div>
    );
  };
  
  export default SuccessMessage;
  