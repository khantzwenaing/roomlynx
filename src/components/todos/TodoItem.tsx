
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Todo } from "@/services/todoService";

interface TodoItemProps {
  todo: Todo;
  onComplete: (todoId: string) => void;
}

const TodoItem = ({ todo, onComplete }: TodoItemProps) => {
  return (
    <div className={`group p-3 rounded-md ${!todo.isCompleted ? 'bg-[#FBDB93]' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <p className={`${todo.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {todo.task}
          </p>
          {todo.isCompleted && todo.completedBy && (
            <p className="text-xs text-muted-foreground mt-1">
              Completed by: {todo.completedBy}
            </p>
          )}
        </div>
        {!todo.isCompleted && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onComplete(todo.id)}
          >
            <Check className="h-4 w-4 mr-1" />
            Complete
          </Button>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
