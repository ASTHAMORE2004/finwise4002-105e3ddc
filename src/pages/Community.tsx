import { motion } from "framer-motion";
import { ArrowLeft, Users, Trophy, Target, Star, ArrowRight, Flame, Medal, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/landing/Navbar";

const Community = () => {
  const navigate = useNavigate();

  const challenges = [
    {
      title: "No-Spend Weekend",
      description: "Don't spend any money for the entire weekend",
      participants: 2340,
      daysLeft: 3,
      reward: "₹100 Cashback",
      progress: 65,
    },
    {
      title: "Save ₹5000 This Month",
      description: "Reach your monthly savings goal",
      participants: 5621,
      daysLeft: 8,
      reward: "Gold Badge",
      progress: 80,
    },
    {
      title: "Track 30 Days",
      description: "Log expenses for 30 consecutive days",
      participants: 1892,
      daysLeft: 15,
      reward: "Premium Trial",
      progress: 40,
    },
  ];

  const leaderboard = [
    { name: "Priya S.", savings: 45000, streak: 28, badge: "gold" },
    { name: "Rahul M.", savings: 38500, streak: 21, badge: "gold" },
    { name: "Anita K.", savings: 32000, streak: 35, badge: "silver" },
    { name: "Vikash P.", savings: 28000, streak: 14, badge: "silver" },
    { name: "Sneha R.", savings: 25500, streak: 19, badge: "bronze" },
  ];

  const badges = [
    { name: "First Saver", icon: Star, unlocked: true },
    { name: "Week Streak", icon: Flame, unlocked: true },
    { name: "Budget Master", icon: Target, unlocked: true },
    { name: "Top 10%", icon: Trophy, unlocked: false },
    { name: "Champion", icon: Crown, unlocked: false },
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
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Community <span className="text-gradient-primary">Challenges</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Join thousands of savers. Compete in challenges, earn rewards, and build better financial habits together.
            </p>
          </motion.div>

          {/* Active Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Active Challenges</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {challenges.map((challenge, index) => (
                <Card key={challenge.title} className="glass-card border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {challenge.daysLeft} days left
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {challenge.participants.toLocaleString()} participants
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground">{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-foreground">{challenge.reward}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Top Savers This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div key={user.name} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                      <span className="font-bold text-lg w-6 text-muted-foreground">#{index + 1}</span>
                      <Avatar>
                        <AvatarFallback className={`
                          ${user.badge === 'gold' ? 'bg-yellow-500/20 text-yellow-500' : ''}
                          ${user.badge === 'silver' ? 'bg-gray-400/20 text-gray-400' : ''}
                          ${user.badge === 'bronze' ? 'bg-orange-600/20 text-orange-600' : ''}
                        `}>
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.streak} day streak 🔥</p>
                      </div>
                      <span className="font-semibold text-primary">₹{user.savings.toLocaleString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Your Badges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="w-5 h-5 text-primary" />
                    Your Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    {badges.map((badge) => (
                      <div
                        key={badge.name}
                        className={`flex flex-col items-center p-4 rounded-xl transition-colors ${
                          badge.unlocked
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-secondary/50 border border-border/50 opacity-50"
                        }`}
                      >
                        <badge.icon className={`w-8 h-8 mb-2 ${badge.unlocked ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-xs text-center text-muted-foreground">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-6 text-center">
                    Complete more challenges to unlock badges!
                  </p>
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
              Join the Community
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default Community;