import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Presentation, Calendar, BrainCircuit, FileText, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Presentation,
    title: "Demo Pitch with Transcript",
    description: "AI-generated pitch scripts and real-time transcription for practice sessions.",
  },
  {
    icon: Calendar,
    title: "Schedule Investor Calls",
    description: "Book video meetings and let investors view your startup dashboard live.",
  },
  {
    icon: BrainCircuit,
    title: "AI Question Prep",
    description: "Get tailored investor questions based on your startup's profile and metrics.",
  },
  {
    icon: FileText,
    title: "PDF Extract & Autofill",
    description: "Upload KYC documents to auto-extract data and autofill registration forms.",
  },
];

const InvestorMeetSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
          >
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Investor Relations</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
          >
            Your <span className="text-gradient-primary">Investor Meet</span> Hub
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground"
          >
            Prepare, pitch, and connect with investors. AI-powered tools to make your startup investor-ready.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button size="lg" onClick={() => navigate('/investor-meet')} className="btn-primary-gradient">
            Enter Investor Meet <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default InvestorMeetSection;
