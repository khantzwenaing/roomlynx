
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = "Loading room details..." }: LoadingStateProps) => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-lg text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
