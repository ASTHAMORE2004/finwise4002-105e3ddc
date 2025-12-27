import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Play, Clock, Star, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/landing/Navbar";

const FinancialLiteracy = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Budgeting Basics",
      lessons: 8,
      duration: "45 mins",
      progress: 100,
      completed: true,
      topics: ["50/30/20 Rule", "Tracking Expenses", "Emergency Fund"],
    },
    {
      title: "Saving Strategies",
      lessons: 6,
      duration: "35 mins",
      progress: 60,
      completed: false,
      topics: ["Goal Setting", "Automation", "High-Yield Accounts"],
    },
    {
      title: "Investment Fundamentals",
      lessons: 10,
      duration: "1 hour",
      progress: 20,
      completed: false,
      topics: ["Stocks vs Bonds", "Mutual Funds", "Risk Management"],
    },
    {
      title: "Credit & Debt Management",
      lessons: 7,
      duration: "40 mins",
      progress: 0,
      completed: false,
      topics: ["Credit Score", "Debt Payoff", "Good vs Bad Debt"],
    },
    {
      title: "Tax Planning",
      lessons: 5,
      duration: "30 mins",
      progress: 0,
      completed: false,
      topics: ["Tax Deductions", "80C Investments", "Filing Returns"],
    },
  ];

  const featuredVideo = {
    title: "The Power of Compound Interest",
    duration: "12:34",
    views: "45K",
    thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=340&fit=crop",
  };

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
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Financial <span className="text-gradient-primary">Literacy</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Master money management with bite-sized lessons designed for Gen-Z. Learn at your pace, track your progress.
            </p>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Card className="glass-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Your Learning Journey</h3>
                    <p className="text-muted-foreground">1 of 5 modules completed</p>
                  </div>
                  <div className="flex-1 max-w-md w-full">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="text-foreground">20%</span>
                    </div>
                    <Progress value={20} className="h-3" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-foreground">150 XP earned</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Featured Video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Featured Lesson</h2>
            <Card className="glass-card border-border/50 overflow-hidden group cursor-pointer" onClick={() => navigate('/courses')}>
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-video md:aspect-auto">
                  <img
                    src={featuredVideo.thumbnail}
                    alt={featuredVideo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-primary-foreground ml-1" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 flex flex-col justify-center">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                    {featuredVideo.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Learn how compound interest can turn small savings into significant wealth over time.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {featuredVideo.duration}
                    </span>
                    <span>{featuredVideo.views} views</span>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>

          {/* Learning Modules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Learning Modules</h2>
            <div className="space-y-4">
              {modules.map((module, index) => (
                <Card
                  key={module.title}
                  className={`glass-card border-border/50 hover:border-primary/50 transition-colors cursor-pointer ${
                    module.completed ? "bg-primary/5" : ""
                  }`}
                  onClick={() => navigate('/courses')}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          module.completed ? "bg-emerald-500" : "bg-primary/10"
                        }`}>
                          {module.completed ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <span className="font-bold text-primary">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{module.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {module.lessons} lessons • {module.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {module.topics.map((topic) => (
                          <span
                            key={topic}
                            className="px-2 py-1 rounded-full bg-secondary text-xs text-muted-foreground"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                      <div className="w-full md:w-32">
                        <Progress value={module.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          {module.progress}% complete
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Button
              onClick={() => navigate("/courses")}
              className="btn-primary-gradient px-8 py-6 text-lg"
            >
              Start Learning Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default FinancialLiteracy;