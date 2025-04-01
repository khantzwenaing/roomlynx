
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface NotFoundStateProps {
  onBackClick: () => void;
}

const NotFoundState = ({ onBackClick }: NotFoundStateProps) => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center h-64 justify-center">
        <p className="text-lg mb-4">Room not found</p>
        <Button onClick={onBackClick}>
          <ArrowLeft className="mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFoundState;
