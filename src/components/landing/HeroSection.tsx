import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Shield, Award, Users } from "lucide-react";
import FloatingElements from "./FloatingElements";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const punchlines = [
  { text: "Spend", gradient: "text-gradient-primary" },
  { text: "Sleep", gradient: "text-gradient-accent" },
  { text: "Study", gradient: "text-gradient-primary" },
  { text: "Dream", gradient: "text-gradient-accent" },
];

const HeroSection = () => {
  const [currentPunchline, setCurrentPunchline] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPunchline((prev) => (prev + 1) % punchlines.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-gradient-hero">
      <FloatingElements />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">
              Trusted by 50,000+ Students Across India
            </span>
          </motion.div>

          {/* Main Headline with rotating punchline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-foreground">Save While You</span>
            <br />
            <span className="relative inline-block h-[1.2em] overflow-hidden align-bottom" style={{ minWidth: '200px' }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentPunchline}
                  initial={{ y: 40, opacity: 0, rotateX: -45 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: -40, opacity: 0, rotateX: 45 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className={`absolute left-0 right-0 ${punchlines[currentPunchline].gradient}`}
                >
                  {punchlines[currentPunchline].text}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Turn your small change into smart investments. FinWise rounds up your spending, 
            teaches you finance, and helps you build wealth — one rupee at a time.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button variant="hero" className="group" onClick={() => navigate('/auth')}>
              Start Investing Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="hero-outline" className="group" onClick={() => navigate('/courses')}>
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12"
          >
            <div className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
                ₹10
              </div>
              <div className="text-sm text-muted-foreground">Min Investment</div>
            </div>
            <div className="text-center border-x border-border/50 px-4">
              <div className="font-display text-3xl sm:text-4xl font-bold text-gradient-primary mb-1">
                50K+
              </div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-gradient-accent mb-1">
                ₹2Cr+
              </div>
              <div className="text-sm text-muted-foreground">Invested</div>
            </div>
          </motion.div>

          {/* Trust indicators strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>SEBI Regulated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-accent" />
              <span>Bank-Grade Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>ISO 27001 Certified</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ height: ["20%", "40%", "20%"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 bg-primary rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
