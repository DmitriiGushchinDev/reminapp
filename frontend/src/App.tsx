import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { UserProvider } from "./contexts/UserContext";
import AuthPage from "./components/auth/AuthPage";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={
            <>
              <SignedOut>
                <AuthPage />
              </SignedOut>
              <SignedIn>
                <UserProvider>
                  <Index />
                </UserProvider>
              </SignedIn>
            </>
          } />
          <Route path="/profile" element={
            <SignedIn>
              <UserProvider>
                <Profile />
              </UserProvider>
            </SignedIn>
          } />
          <Route path="/settings" element={
            <SignedIn>
              <UserProvider>
                <Settings />
              </UserProvider>
            </SignedIn>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
