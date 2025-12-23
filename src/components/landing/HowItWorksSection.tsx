import { motion } from "framer-motion";
import { ShoppingCart, ArrowRightCircle, TrendingUp, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ShoppingCart,
    title: "Link Your UPI",
    description: "Connect your UPI or bank account securely. We track your transactions to find investment opportunities.",
  },
  {
    number: "02",
    icon: ArrowRightCircle,
    title: "Round-Up & Save",
    description: "Every purchase gets rounded up. Spent ₹87? We invest ₹13 for you. It adds up faster than you think.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Auto-Invest",
    description: "Your spare change flows into diversified portfolios — mutual funds, digital gold, or government bonds.",
  },
  {
    number: "04",
    icon: Trophy,
    title: "Watch It Grow",
    description: "Track your portfolio, complete challenges, learn finance, and watch your wealth grow over time.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 relative bg-gradient-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
          >
            <span className="text-sm text-accent font-medium">Simple Process</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
          >
            Start Investing in
            <br />
            <span className="text-gradient-accent">4 Easy Steps</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground"
          >
            No complex setup. No minimum amounts. Just link, spend, and let your money grow.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-full h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="text-center">
                {/* Number */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="inline-flex items-center justify-center w-32 h-32 rounded-full glass-card mb-6 relative"
                >
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <step.icon className="w-12 h-12 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-display font-bold text-foreground text-sm border border-border">
                    {step.number}
                  </span>
                </motion.div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
