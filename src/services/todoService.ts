
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface Todo {
  id: string;
  task: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
  completedBy?: string;
}

export async function getTodos(): Promise<Todo[]> {
  try {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("isCompleted", { ascending: true })
      .order("createdAt", { ascending: false });
    
    if (error) {
      console.error("Error fetching todos:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getTodos:", error);
    return [];
  }
}

export async function addTodo(task: string): Promise<Todo | null> {
  try {
    const newTodo = {
      id: uuidv4(),
      task,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from("todos")
      .insert([newTodo])
      .select()
      .single();
    
    if (error) {
      console.error("Error adding todo:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error in addTodo:", error);
    return null;
  }
}

export async function completeTodo(id: string, completedBy: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("todos")
      .update({
        isCompleted: true,
        completedAt: new Date().toISOString(),
        completedBy
      })
      .eq("id", id);
    
    if (error) {
      console.error("Error completing todo:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in completeTodo:", error);
    return false;
  }
}
