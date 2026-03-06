import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Brain, TrendingUp, Target, Wallet, PieChart, Shield, Search, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const AI_FEATURES = [
  { icon: TrendingUp, title: "Sentiment Analysis", desc: "NLP-powered bullish/bearish scoring for startups", color: "text-emerald-400" },
  { icon: Target, title: "Risk Profiler", desc: "AI quiz-based personalized investment strategy", color: "text-blue-400" },
  { icon: Wallet, title: "Expense Categorizer", desc: "Auto-categorize spending with savings predictions", color: "text-purple-400" },
  { icon: PieChart, title: "Portfolio Rebalancer", desc: "Optimal allocation suggestions with tax insights", color: "text-orange-400" },
  { icon: Shield, title: "Fraud Detection", desc: "Vision AI anomaly detection on KYC documents", color: "text-red-400" },
  { icon: Search, title: "Smart Search", desc: "Semantic NLU search across startups, IPOs & courses", color: "text-cyan-400" },
];

const AIHubSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">AI-Powered Intelligence</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            12 AI/ML Tools Built In
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From NLP sentiment analysis to computer vision fraud detection — powered by Google Gemini models with serverless edge function architecture
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {AI_FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl border border-border/50 bg-card/50 backdrop-blur hover:border-primary/30 transition-all group cursor-pointer"
              onClick={() => navigate("/ai-hub")}
            >
              <f.icon className={`w-6 h-6 ${f.color} mb-3`} />
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button onClick={() => navigate("/ai-hub")} size="lg" className="gap-2">
            <Sparkles className="w-4 h-4" /> Explore AI Hub <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AIHubSection;
