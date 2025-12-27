import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, PieChart, TrendingDown, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/landing/Navbar";

const ExpenseTracker = () => {
  const navigate = useNavigate();
  const [budget] = useState(25000);
  const [spent] = useState(18500);

  const categories = [
    { name: "Food & Dining", spent: 5200, budget: 6000, color: "bg-emerald-500" },
    { name: "Transportation", spent: 3100, budget: 4000, color: "bg-blue-500" },
    { name: "Entertainment", spent: 2800, budget: 3000, color: "bg-purple-500" },
    { name: "Shopping", spent: 4200, budget: 5000, color: "bg-orange-500" },
    { name: "Bills & Utilities", spent: 3200, budget: 4000, color: "bg-red-500" },
  ];

  const recentTransactions = [
    { name: "Swiggy Order", amount: -450, category: "Food", date: "Today" },
    { name: "Metro Recharge", amount: -500, category: "Transport", date: "Today" },
    { name: "Salary Credit", amount: 45000, category: "Income", date: "Yesterday" },
    { name: "Amazon Purchase", amount: -1200, category: "Shopping", date: "Yesterday" },
    { name: "Netflix", amount: -199, category: "Entertainment", date: "2 days ago" },
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
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Smart <span className="text-gradient-primary">Expense Tracker</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Track every rupee, understand your spending patterns, and take control of your finances.
            </p>
          </motion.div>

          {/* Overview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Monthly Budget</span>
                    <PieChart className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">₹{budget.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">Set for December</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Spent</span>
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">₹{spent.toLocaleString()}</p>
                  <Progress value={(spent / budget) * 100} className="mt-2" />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-500">₹{(budget - spent).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">Keep it up!</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{category.name}</span>
                        <span className="text-muted-foreground">
                          ₹{category.spent.toLocaleString()} / ₹{category.budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${category.color} transition-all`}
                          style={{ width: `${(category.spent / category.budget) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium text-foreground">{transaction.name}</p>
                        <p className="text-xs text-muted-foreground">{transaction.category} • {transaction.date}</p>
                      </div>
                      <span className={`font-semibold ${transaction.amount > 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                        {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <Button
              onClick={() => navigate("/auth")}
              className="btn-primary-gradient px-8 py-6 text-lg"
            >
              Start Tracking Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default ExpenseTracker;