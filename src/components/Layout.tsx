
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, 
  LogOut, 
  Settings, 
  Calendar, 
  DollarSign, 
  FileText, 
  Menu, 
  X,
  ListTodo
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import TodoList from "@/components/todos/TodoList";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [todoListOpen, setTodoListOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTodoList = () => {
    setTodoListOpen(!todoListOpen);
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "#", label: "Todo List", icon: <ListTodo size={20} />, action: toggleTodoList },
    { path: "/rooms", label: "Rooms", icon: <Calendar size={20} /> },
    { path: "/payments", label: "Payments", icon: <DollarSign size={20} /> },
    { path: "/reports", label: "Reports", icon: <FileText size={20} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-hotel-background flex flex-col w-full">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={toggleSidebar}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
              <Link to="/dashboard" className="flex items-center">
                <span className="text-xl font-bold text-hotel-primary">Sebin</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-sm text-gray-600">{user.name}</span>
                    <div className="h-8 w-8 rounded-full bg-hotel-primary text-white flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <LogOut size={20} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* App Sidebar with Todo List */}
          <AppSidebar />

          {/* Main navigation sidebar */}
          <aside
            className={`bg-white border-r border-gray-200 transition-all duration-300 ${
              sidebarOpen ? "w-64" : "w-0 -ml-64"
            } md:ml-0 ${sidebarOpen ? "md:w-64" : "md:w-64"} flex-shrink-0 overflow-y-auto`}
          >
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.path}>
                  {item.action ? (
                    <button
                      onClick={item.action}
                      className={`flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        todoListOpen && item.label === "Todo List"
                          ? "bg-hotel-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? "bg-hotel-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Todo List display when toggled */}
            {todoListOpen && (
              <div className="px-4 pb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-medium mb-2 text-gray-700">Todo List</h3>
                  <TodoList />
                </div>
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
