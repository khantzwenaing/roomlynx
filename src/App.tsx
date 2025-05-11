
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Customers from "./pages/Customers";
import RoomDetailsPage from "./pages/RoomDetailsPage";
import Todos from "./pages/Todos"; // Import the Todo page

// Components
import Layout from "./components/Layout";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log("ProtectedRoute check - isAuthenticated:", isAuthenticated, "isLoading:", isLoading);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("User authenticated, rendering protected content");
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  console.log("AppRoutes rendered - isAuthenticated:", isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      
      {/* Explicitly ensure root path redirects to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/todos" element={
        <ProtectedRoute>
          <Layout>
            <Todos />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/rooms" element={
        <ProtectedRoute>
          <Layout>
            <Rooms />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/payments" element={
        <ProtectedRoute>
          <Layout>
            <Payments />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout>
            <Reports />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/customers" element={
        <ProtectedRoute>
          <Layout>
            <Customers />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/room-details" element={
        <ProtectedRoute>
          <Layout>
            <RoomDetailsPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  console.log("App component rendered");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
