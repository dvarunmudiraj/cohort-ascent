import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Cohorts } from "./pages/Cohorts";
import { CohortDetail } from "./pages/CohortDetail";
import { Candidates } from "./pages/Candidates";
import { DailyEfforts } from "./pages/DailyEfforts";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Admin Only Route
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useAuthContext();
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Redirect authenticated users away from auth pages
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Landing />} />
    <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
    <Route path="/login" element={<Navigate to="/auth" replace />} />
    
    {/* Protected Routes */}
    <Route
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/cohorts" element={<Cohorts />} />
      <Route path="/cohorts/:id" element={<CohortDetail />} />
      <Route path="/candidates" element={<Candidates />} />
      <Route path="/efforts" element={<DailyEfforts />} />
      <Route path="/reports" element={<Reports />} />
      <Route
        path="/settings"
        element={
          <AdminRoute>
            <Settings />
          </AdminRoute>
        }
      />
    </Route>
    
    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
