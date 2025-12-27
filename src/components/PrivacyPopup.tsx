import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Lock, CheckCircle, FileText } from "lucide-react";
import Cookies from "js-cookie";

const PrivacyPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("finwise_privacy_consent");
    if (!consent) {
      setIsVisible(true);
    } else {
      setIsAgreed(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set("finwise_privacy_consent", "accepted", { expires: 365 });
    setIsVisible(false);
    setIsAgreed(true);
  };

  const securityFeatures = [
    { icon: Lock, text: "256-bit SSL Encryption" },
    { icon: Shield, text: "Bank-grade Security" },
    { icon: FileText, text: "SEBI Compliant" },
  ];

  // Block access until user agrees
  if (!isAgreed && isVisible) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            <div className="glass-card rounded-3xl p-8 shadow-elevated border border-border/50 text-center">
              {/* Security Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Shield className="w-10 h-10 text-primary" />
              </div>

              {/* Header */}
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Your Security is Our Priority
              </h2>
              <p className="text-muted-foreground mb-6">
                Welcome to FinWise! Before you explore our platform, please review and accept our security and privacy policies.
              </p>

              {/* Security Features */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {securityFeatures.map((feature) => (
                  <div
                    key={feature.text}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50"
                  >
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Content Box */}
              <div className="bg-secondary/30 rounded-xl p-4 mb-6 text-left">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      Your financial data is encrypted and never shared with third parties
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      We use cookies to enhance your experience and personalize recommendations
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      All transactions are protected with multi-layer security protocols
                    </span>
                  </li>
                </ul>
              </div>

              {/* CTA Button */}
              <Button
                variant="gradient"
                onClick={handleAccept}
                className="w-full py-6 text-lg font-semibold"
              >
                I Agree & Continue
              </Button>

              {/* Policy Links */}
              <p className="text-xs text-muted-foreground mt-4">
                By clicking "I Agree", you accept our{" "}
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
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
};

export default PrivacyPopup;
