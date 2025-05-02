
import React, { useState, useEffect } from "react";
import { getTodos, addTodo, completeTodo, Todo } from "@/services/todoService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Check, ListTodo } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [completedBy, setCompletedBy] = useState("");
  const { toast } = useToast();

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setIsLoading(true);
    try {
      const todosData = await getTodos();
      setTodos(todosData);
    } catch (error) {
      console.error("Failed to load todos:", error);
      toast({
        title: "Failed to load tasks",
        description: "There was an error loading your tasks.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    setIsLoading(true);
    try {
      const todo = await addTodo(newTask.trim());
      if (todo) {
        setTodos(prevTodos => [todo, ...prevTodos]);
        setNewTask("");
        toast({
          title: "Task added",
          description: "The task has been added successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to add task:", error);
      toast({
        title: "Failed to add task",
        description: "There was an error adding your task.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTodoId || !completedBy.trim()) return;
    
    setIsCompletingTask(true);
    try {
      const success = await completeTodo(selectedTodoId, completedBy.trim());
      if (success) {
        setTodos(prevTodos => 
          prevTodos.map(todo => 
            todo.id === selectedTodoId 
              ? { ...todo, isCompleted: true, completedBy: completedBy, completedAt: new Date().toISOString() } 
              : todo
          )
        );
        closeCompleteDialog();
        toast({
          title: "Task completed",
          description: "The task has been marked as completed.",
        });
      }
    } catch (error) {
      console.error("Failed to complete task:", error);
      toast({
        title: "Failed to complete task",
        description: "There was an error completing your task.",
        variant: "destructive",
      });
    } finally {
      setIsCompletingTask(false);
    }
  };

  const openCompleteDialog = (todoId: string) => {
    setSelectedTodoId(todoId);
    setCompletedBy("");
  };

  const closeCompleteDialog = () => {
    setSelectedTodoId(null);
    setCompletedBy("");
  };

  return (
    <div className="w-full px-2">
      <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
        <Input
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          disabled={isLoading}
          className="flex-1 h-8"
          size={1}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !newTask.trim()}
          size="sm"
        >
          Add
        </Button>
      </form>

      <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2">
        {isLoading && todos.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">Loading tasks...</p>
        ) : todos.length > 0 ? (
          todos.map((todo) => (
            <div key={todo.id} className="group">
              <div className="flex items-center justify-between gap-2 py-1">
                <div className="flex-1">
                  <p className={`${todo.isCompleted ? 'line-through text-muted-foreground' : ''} text-sm`}>
                    {todo.task}
                  </p>
                  {todo.isCompleted && todo.completedBy && (
                    <p className="text-xs text-muted-foreground">
                      By: {todo.completedBy}
                    </p>
                  )}
                </div>
                {!todo.isCompleted && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openCompleteDialog(todo.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Separator className="my-1" />
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-4 text-xs">No tasks yet</p>
        )}
      </div>

      <Dialog open={!!selectedTodoId} onOpenChange={(open) => !open && closeCompleteDialog()}>
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
            <Button variant="outline" onClick={closeCompleteDialog}>Cancel</Button>
            <Button 
              onClick={handleCompleteTask}
              disabled={isCompletingTask || !completedBy.trim()}
            >
              Mark as Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TodoList;
