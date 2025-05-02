
import React from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarHeader,
  SidebarTrigger
} from "@/components/ui/sidebar";
import TodoList from "@/components/todos/TodoList";
import { ListTodo } from "lucide-react";

export function AppSidebar() {
  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <ListTodo className="h-5 w-5" />
          <span className="font-semibold">Sebin Hotel</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tasks</SidebarGroupLabel>
          <TodoList />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="text-xs text-muted-foreground text-center p-2">
          Manage your tasks from anywhere
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
