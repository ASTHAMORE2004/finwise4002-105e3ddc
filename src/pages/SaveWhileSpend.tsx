import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, PiggyBank, CreditCard, TrendingUp, ArrowRight, Percent, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/landing/Navbar";

const SaveWhileSpend = () => {
  const navigate = useNavigate();
  const [monthlySpend, setMonthlySpend] = useState(5000);
  const [savingsPercent, setSavingsPercent] = useState([10]);

  const calculatedSavings = (monthlySpend * savingsPercent[0]) / 100;
  const yearlySavings = calculatedSavings * 12;

  const features = [
    {
      icon: PiggyBank,
      title: "Round-Up Savings",
      description: "Automatically round up purchases to the nearest ₹10 and save the difference",
    },
    {
      icon: Percent,
      title: "Cashback to Savings",
      description: "Direct all cashback earnings into your savings pot automatically",
    },
    {
      icon: Target,
      title: "Goal-Based Saving",
      description: "Set savings goals and track your progress with visual milestones",
    },
    {
      icon: Zap,
      title: "Smart Triggers",
      description: "Create custom rules to save when specific conditions are met",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <PiggyBank className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Save While You <span className="text-gradient-primary">Spend</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Turn every transaction into a savings opportunity. Our smart automation helps you build wealth without changing your lifestyle.
            </p>
          </motion.div>

          {/* Savings Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Savings Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Monthly Spending (₹)</Label>
                  <Input
                    type="number"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(Number(e.target.value))}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Auto-Save Percentage: {savingsPercent[0]}%</Label>
                  <Slider
                    value={savingsPercent}
                    onValueChange={setSavingsPercent}
                    max={30}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Monthly Savings</p>
                    <p className="text-2xl font-bold text-primary">₹{calculatedSavings.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <p className="text-sm text-muted-foreground mb-1">Yearly Savings</p>
                    <p className="text-2xl font-bold text-accent">₹{yearlySavings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="glass-card border-border/50 h-full hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Button
              onClick={() => navigate("/auth")}
              className="btn-primary-gradient px-8 py-6 text-lg"
            >
              Start Saving Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default SaveWhileSpend;