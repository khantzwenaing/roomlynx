
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CleaningCompleteButtonProps {
  onCleaningComplete: (cleanedBy: string) => Promise<void>;
}

const CleaningCompleteButton = ({ onCleaningComplete }: CleaningCompleteButtonProps) => {
  const [cleanedBy, setCleanedBy] = useState("");

  const handleComplete = async () => {
    await onCleaningComplete(cleanedBy);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full py-6 text-lg bg-green-600 hover:bg-green-700">
          Complete Cleaning
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
