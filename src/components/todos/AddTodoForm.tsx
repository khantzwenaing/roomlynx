
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddTodoFormProps {
  onAddTask: (task: string) => Promise<void>;
  isLoading: boolean;
}

const AddTodoForm = ({ onAddTask, isLoading }: AddTodoFormProps) => {
  const [newTask, setNewTask] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    await onAddTask(newTask.trim());
    setNewTask("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <Input
        placeholder="Add a new task..."
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        disabled={isLoading}
        className="flex-1"
      />
      <Button 
        type="submit" 
        disabled={isLoading || !newTask.trim()}
      >
        Add Task
      </Button>
    </form>
  );
};

export default AddTodoForm;
