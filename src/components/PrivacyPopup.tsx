import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, Shield, X } from "lucide-react";
import Cookies from "js-cookie";

const PrivacyPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("finwise_privacy_consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set("finwise_privacy_consent", "accepted", { expires: 365 });
    setIsVisible(false);
  };

  const handleDecline = () => {
    Cookies.set("finwise_privacy_consent", "declined", { expires: 30 });
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50"
        >
          <div className="glass-card rounded-2xl p-6 shadow-elevated border border-border/50">
            {/* Close button */}
            <button
              onClick={handleDecline}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <Cookie className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground text-lg">
                  Your Privacy Matters
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Bank-grade security
                </p>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              We use cookies to enhance your experience, analyze traffic, and personalize your 
              investment recommendations. Your financial data is encrypted and never sold.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="gradient"
                onClick={handleAccept}
                className="flex-1"
              >
                Accept All
              </Button>
              <Button
                variant="outline"
                onClick={handleDecline}
                className="flex-1"
              >
                Essential Only
              </Button>
            </div>

            {/* Policy link */}
            <p className="text-xs text-muted-foreground mt-4 text-center">
              By continuing, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrivacyPopup;
