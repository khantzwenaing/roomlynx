
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface CompleteTodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  completedBy: string;
  setCompletedBy: (value: string) => void;
  isCompletingTask: boolean;
}

const CompleteTodoDialog = ({
  isOpen,
  onClose,
  onComplete,
  completedBy,
  setCompletedBy,
  isCompletingTask
}: CompleteTodoDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Task as Completed</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm font-medium">Completed by:</label>
          <Textarea 
            value={completedBy}
            onChange={(e) => setCompletedBy(e.target.value)}
            placeholder="Enter your name or notes about who completed this task"
            className="mt-1"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={onComplete}
            disabled={isCompletingTask || !completedBy.trim()}
          >
            Mark as Completed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteTodoDialog;
