import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProductsSection from "@/components/landing/ProductsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import InvestorMeetSection from "@/components/landing/InvestorMeetSection";
import AIHubSection from "@/components/landing/AIHubSection";
import LearnSection from "@/components/landing/LearnSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import PrivacyPopup from "@/components/PrivacyPopup";
import WebsiteTour from "@/components/WebsiteTour";
import KuberChatbot from "@/components/KuberChatbot";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProductsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <InvestorMeetSection />
      <AIHubSection />
      <LearnSection />
      <CTASection />
      <Footer />
      
      {/* Interactive Components */}
      <PrivacyPopup />
      <WebsiteTour />
      <KuberChatbot />
    </main>
  );
};

export default Index;
