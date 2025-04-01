
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";

interface NotFoundStateProps {
  onBackClick: () => void;
}

const NotFoundState = ({ onBackClick }: NotFoundStateProps) => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center h-64 justify-center">
        <div className="bg-gray-100 rounded-full p-4 mb-4">
          <Search className="h-8 w-8 text-gray-500" />
        </div>
        <p className="text-lg mb-4 text-gray-600">Room not found</p>
        <Button onClick={onBackClick}>
          <ArrowLeft className="mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFoundState;
