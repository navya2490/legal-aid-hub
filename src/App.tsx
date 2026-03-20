import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/query-core";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import PortalSelection from "./pages/PortalSelection";
import ClientLogin from "./pages/ClientLogin";
import LawyerLogin from "./pages/LawyerLogin";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CaseSubmission from "./pages/CaseSubmission";
import CaseSubmitted from "./pages/CaseSubmitted";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import LawyerDashboard from "./pages/dashboard/LawyerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminCaseDetail from "./pages/dashboard/AdminCaseDetail";
import ClientCaseDetail from "./pages/dashboard/ClientCaseDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<PortalSelection />} />
            <Route path="/client-login" element={<ClientLogin />} />
            <Route path="/lawyer-login" element={<LawyerLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/submit-case"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <CaseSubmission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/case-submitted"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <CaseSubmitted />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/client"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/client/case/:caseId"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientCaseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/lawyer"
              element={
                <ProtectedRoute allowedRoles={["lawyer"]}>
                  <LawyerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/case/:caseId"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminCaseDetail />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
