
import React, { useState, useEffect } from "react";
import { Todo, getTodos, addTodo, completeTodo } from "@/services/todoService";
import { useToast } from "@/hooks/use-toast";
import TodoHeader from "./TodoHeader";
import AddTodoForm from "./AddTodoForm";
import TodoItem from "./TodoItem";
import CompleteTodoDialog from "./CompleteTodoDialog";

const TodosContainer = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
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

  const handleAddTask = async (taskText: string) => {
    setIsLoading(true);
    try {
      const todo = await addTodo(taskText);
      if (todo) {
        setTodos(prevTodos => [todo, ...prevTodos]);
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

  // Separate todos into incomplete and completed
  const incompleteTodos = todos.filter(todo => !todo.isCompleted);
  const completedTodos = todos.filter(todo => todo.isCompleted);

  return (
    <div className="space-y-6">
      <TodoHeader onRefresh={handleDataRefresh} isRefreshing={isRefreshing} />

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <AddTodoForm onAddTask={handleAddTask} isLoading={isLoading} />

        <div className="space-y-5">
          {isLoading && todos.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          ) : (
            <>
              {/* Incomplete Tasks Section */}
              <div>
                <h2 className="text-lg font-medium mb-3">Tasks To Do</h2>
                <div className="space-y-2">
                  {incompleteTodos.length > 0 ? (
                    incompleteTodos.map((todo) => (
                      <TodoItem 
                        key={todo.id} 
                        todo={todo} 
                        onComplete={openCompleteDialog} 
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-muted-foreground">No pending tasks</p>
                      <p className="text-sm text-muted-foreground mt-1">All caught up!</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Completed Tasks Section */}
              {completedTodos.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-medium mb-3">Completed Tasks</h2>
                  <div className="space-y-2">
                    {completedTodos.map((todo) => (
                      <TodoItem key={todo.id} todo={todo} onComplete={openCompleteDialog} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CompleteTodoDialog
        isOpen={!!selectedTodoId}
        onClose={closeCompleteDialog}
        onComplete={handleCompleteTask}
        completedBy={completedBy}
        setCompletedBy={setCompletedBy}
        isCompletingTask={isCompletingTask}
      />
    </div>
  );
};

export default TodosContainer;
