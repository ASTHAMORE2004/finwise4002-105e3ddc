import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Wallet, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Fin<span className="text-gradient-primary">Wise</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/portfolio" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Portfolio
            </Link>
            <Link to="/analytics" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Analytics
            </Link>
            <Link to="/watchlist" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Watchlist
            </Link>
            <Link to="/calculator" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Calculator
            </Link>
            <Link to="/ipo" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              IPO
            </Link>
            <Link to="/startups" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Startups
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => navigate('/auth')}>
              Log In
            </Button>
            <Button variant="gradient" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border/50"
          >
            <div className="flex flex-col gap-4">
              <Link to="/ipo" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>
                IPO Listings
              </Link>
              <Link to="/courses" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>
                Courses
              </Link>
              <Link to="/video-call" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>
                Video Calls
              </Link>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                Features
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                How It Works
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/auth'); setIsOpen(false); }}>
                  Log In
                </Button>
                <Button variant="gradient" onClick={() => { navigate('/auth'); setIsOpen(false); }}>
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
