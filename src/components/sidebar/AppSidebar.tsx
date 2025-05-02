
import React from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  SidebarTrigger
} from "@/components/ui/sidebar";
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
        {/* We've moved the TodoList to the main sidebar */}
      </SidebarContent>
      <SidebarFooter>
        <div className="text-xs text-muted-foreground text-center p-2">
          Manage your tasks from anywhere
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
