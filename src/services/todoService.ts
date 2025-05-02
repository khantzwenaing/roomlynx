
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

// Map database schema names to our interface names
function mapDbToTodo(dbTodo: any): Todo {
  return {
    id: dbTodo.id,
    task: dbTodo.task,
    isCompleted: dbTodo.iscompleted,
    createdAt: dbTodo.createdat,
    completedAt: dbTodo.completedat,
    completedBy: dbTodo.completedby
  };
}

export async function getTodos(): Promise<Todo[]> {
  try {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("iscompleted", { ascending: true })
      .order("createdat", { ascending: false });
    
    if (error) {
      console.error("Error fetching todos:", error);
      return [];
    }
    
    return data ? data.map(mapDbToTodo) : [];
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
      iscompleted: false,
      createdat: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from("todos")
      .insert([newTodo])
      .select();
    
    if (error) {
      console.error("Error adding todo:", error);
      return null;
    }
    
    return data && data.length > 0 ? mapDbToTodo(data[0]) : null;
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
        iscompleted: true,
        completedat: new Date().toISOString(),
        completedby: completedBy
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
