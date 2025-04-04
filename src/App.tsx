
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider } from "./components/ui/sidebar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NoteTaking from "./pages/NoteTaking";
import DoubtClarification from "./pages/DoubtClarification";
import Flashcards from "./pages/Flashcards";
import Podcast from "./pages/Podcast";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <Dashboard />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/notes" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <NoteTaking />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/doubts" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <DoubtClarification />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/flashcards" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <Flashcards />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/podcast" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <Podcast />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
