import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import PageTransition from "@/components/PageTransition";
import '@/i18n';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import IPO from "./pages/IPO";
import IPORegistration from "./pages/IPORegistration";
import IPODetail from "./pages/IPODetail";
import Startups from "./pages/Startups";
import StartupRegistration from "./pages/StartupRegistration";
import VideoCall from "./pages/VideoCall";
import SaveWhileSpend from "./pages/SaveWhileSpend";
import ExpenseTracker from "./pages/ExpenseTracker";
import Community from "./pages/Community";
import FinancialLiteracy from "./pages/FinancialLiteracy";
import AdminDashboard from "./pages/AdminDashboard";
import Portfolio from "./pages/Portfolio";
import InvestmentCalculator from "./pages/InvestmentCalculator";
import Watchlist from "./pages/Watchlist";
import TrendingAnalytics from "./pages/TrendingAnalytics";
import KYCVerification from "./pages/KYCVerification";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/courses" element={<PageTransition><Courses /></PageTransition>} />
        <Route path="/courses/:id" element={<PageTransition><CourseDetail /></PageTransition>} />
        <Route path="/ipo" element={<PageTransition><IPO /></PageTransition>} />
        <Route path="/ipo/:id" element={<PageTransition><IPODetail /></PageTransition>} />
        <Route path="/ipo/register" element={<PageTransition><IPORegistration /></PageTransition>} />
        <Route path="/startups" element={<PageTransition><Startups /></PageTransition>} />
        <Route path="/startups/register" element={<PageTransition><StartupRegistration /></PageTransition>} />
        <Route path="/video-call" element={<PageTransition><VideoCall /></PageTransition>} />
        <Route path="/save-while-spend" element={<PageTransition><SaveWhileSpend /></PageTransition>} />
        <Route path="/expense-tracker" element={<PageTransition><ExpenseTracker /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/financial-literacy" element={<PageTransition><FinancialLiteracy /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
        <Route path="/calculator" element={<PageTransition><InvestmentCalculator /></PageTransition>} />
        <Route path="/watchlist" element={<PageTransition><Watchlist /></PageTransition>} />
        <Route path="/analytics" element={<PageTransition><TrendingAnalytics /></PageTransition>} />
        <Route path="/kyc" element={<PageTransition><KYCVerification /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
