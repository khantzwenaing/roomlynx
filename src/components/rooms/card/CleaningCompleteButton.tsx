
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CleaningCompleteButtonProps {
  onComplete: (cleanedBy: string) => Promise<void>;
  cleanedBy: string;
  setCleanedBy: (cleanedBy: string) => void;
}

const CleaningCompleteButton = ({ onComplete, cleanedBy, setCleanedBy }: CleaningCompleteButtonProps) => {
  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    await onComplete(cleanedBy);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
          onClick={(e) => e.stopPropagation()} // Prevent card click event
        >
          Complete Cleaning
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="text-xl">Mark Room as Cleaned</DialogTitle>
          <DialogDescription>
            Enter the name of the person who cleaned the room.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="cleaned-by" className="text-lg">Cleaned By</Label>
            <Input
              id="cleaned-by"
              placeholder="Enter name of cleaner"
              value={cleanedBy}
              onChange={(e) => setCleanedBy(e.target.value)}
              className="text-lg h-12"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <Button 
            onClick={handleComplete} 
            className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
          >
            Mark as Clean
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CleaningCompleteButton;
