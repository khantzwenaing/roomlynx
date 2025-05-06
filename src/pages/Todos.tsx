
import React, { useState, useEffect } from "react";
import { getTodos, addTodo, completeTodo, Todo } from "@/services/todoService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, RefreshCw } from "lucide-react";

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const handleDataRefresh = () => {
    setIsRefreshing(true);
    loadTodos().finally(() => {
      setIsRefreshing(false);
      toast({
        title: "Refreshed",
        description: "Tasks list has been refreshed",
      });
    });
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Todo List</h1>
        <Button 
          onClick={handleDataRefresh} 
          variant="outline" 
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
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

        <div className="space-y-3">
          <h2 className="text-lg font-medium">Tasks</h2>
          
          <div className="space-y-2">
            {isLoading && todos.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            ) : todos.length > 0 ? (
              todos.map((todo) => (
                <div key={todo.id} className={`group p-3 rounded-md ${!todo.isCompleted ? 'bg-[#FBDB93]' : 'bg-gray-50'}`}>
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
                        onClick={() => openCompleteDialog(todo.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No tasks yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add a new task to get started</p>
              </div>
            )}
          </div>
        </div>
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

export default Todos;
