import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";
import { 
  ArrowUpCircle, 
  PiggyBank, 
  BookOpen, 
  BarChart3, 
  Users, 
  Shield 
} from "lucide-react";

const features = [
  {
    icon: ArrowUpCircle,
    title: "Round-Up Investing",
    description: "Every purchase rounds up to the nearest ₹10. The spare change automatically invests in your portfolio. Coffee for ₹48? Invest ₹2 instantly.",
    accent: false,
    path: "/save-while-spend",
  },
  {
    icon: PiggyBank,
    title: "Save While You Spend",
    description: "Set spending thresholds and auto-save the difference. Partner cashbacks convert to investments. Your money works while you live.",
    accent: true,
    path: "/save-while-spend",
  },
  {
    icon: BookOpen,
    title: "Financial Literacy",
    description: "Bite-sized lessons on budgeting, credit scores, SIPs & taxes. Earn badges, complete quizzes, and get AI-powered personalized tips.",
    accent: false,
    path: "/financial-literacy",
  },
  {
    icon: BarChart3,
    title: "Smart Expense Tracker",
    description: "Categorize spending automatically. Set goals like 'Save ₹500 for a trip in 2 months'. Beautiful dashboards show your save vs spend ratio.",
    accent: false,
    path: "/expense-tracker",
  },
  {
    icon: Users,
    title: "Community Challenges",
    description: "Join peer challenges like 'Save ₹1000 in 30 days'. Climb leaderboards, share tips, and celebrate wins with fellow students.",
    accent: true,
    path: "/community",
  },
  {
    icon: Shield,
    title: "Secure & Regulated",
    description: "Bank-grade encryption protects your data. Invest in SEBI-regulated mutual funds, digital gold, and government bonds.",
    accent: false,
    path: "/auth",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" data-tour="features" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
          >
            <span className="text-sm text-primary font-medium">Powerful Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
          >
            Everything You Need to
            <br />
            <span className="text-gradient-primary">Build Wealth Early</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground"
          >
            From micro-investing to financial education, FinWise gives you all the tools
            to transform how you think about money.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} path={feature.path} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
