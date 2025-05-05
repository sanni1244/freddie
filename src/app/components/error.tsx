const ErrorMessage = ({ message }: { message: string }) => {
    return (
      <div className="p-4 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500">
        <strong>{message}</strong>
      </div>
    );
  };
  
  export default ErrorMessage;
  