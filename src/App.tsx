import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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
import NotFound from "./pages/NotFound";

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
            <Route path="/auth" element={<Auth />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/ipo" element={<IPO />} />
            <Route path="/ipo/:id" element={<IPODetail />} />
            <Route path="/ipo/register" element={<IPORegistration />} />
            <Route path="/startups" element={<Startups />} />
            <Route path="/startups/register" element={<StartupRegistration />} />
            <Route path="/video-call" element={<VideoCall />} />
            <Route path="/save-while-spend" element={<SaveWhileSpend />} />
            <Route path="/expense-tracker" element={<ExpenseTracker />} />
            <Route path="/community" element={<Community />} />
            <Route path="/financial-literacy" element={<FinancialLiteracy />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/calculator" element={<InvestmentCalculator />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/analytics" element={<TrendingAnalytics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
