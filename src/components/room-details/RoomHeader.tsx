
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, X, Edit, RefreshCw, Trash2 } from "lucide-react";

interface RoomHeaderProps {
  roomNumber: string;
  isEditing: boolean;
  onBackClick: () => void;
  onEditClick: () => void;
  onRefreshData: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDeleteClick: () => void;
}

const RoomHeader = ({ 
  roomNumber, 
  isEditing, 
  onBackClick, 
  onEditClick,
  onRefreshData,
  onSave, 
  onCancelEdit,
  onDeleteClick
}: RoomHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center pb-6 border-b mb-6">
      <div className="flex items-center mb-4 md:mb-0">
        <Button variant="ghost" size="icon" onClick={onBackClick} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          Room {roomNumber} {isEditing ? "(Editing)" : ""}
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onRefreshData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        
        {isEditing ? (
          <>
            <Button variant="default" size="sm" onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onEditClick}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={onDeleteClick}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Room
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomHeader;
