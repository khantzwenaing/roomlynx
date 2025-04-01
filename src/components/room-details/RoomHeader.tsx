
import React from "react";
import { ArrowLeft, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomHeaderProps {
  roomNumber: string;
  isEditing: boolean;
  onBackClick: () => void;
  onEditClick: () => void;
  onRefreshData: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
}

const RoomHeader = ({
  roomNumber,
  isEditing,
  onBackClick,
  onEditClick,
  onRefreshData,
  onSave,
  onCancelEdit
}: RoomHeaderProps) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center">
        <Button variant="outline" onClick={onBackClick} className="mr-4">
          <ArrowLeft className="mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Room {roomNumber} Details</h1>
      </div>
      <div className="flex gap-2">
        <Button onClick={onRefreshData} variant="outline" className="mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          Refresh
        </Button>
        {!isEditing ? (
          <Button onClick={onEditClick} variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Room
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={onCancelEdit} variant="outline">
              Cancel
            </Button>
            <Button onClick={onSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomHeader;
