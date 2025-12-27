import { motion } from "framer-motion";
import { ArrowLeft, Users, Trophy, Target, Star, ArrowRight, Flame, Medal, Crown, TrendingUp, BookOpen, Zap, Gift, Coins, PiggyBank, GraduationCap, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/landing/Navbar";

const Community = () => {
  const navigate = useNavigate();

  const savingChallenges = [
    {
      title: "No-Spend Weekend",
      description: "Don't spend any money for the entire weekend. Save everything!",
      participants: 2340,
      daysLeft: 3,
      reward: "₹100 Cashback",
      progress: 65,
      difficulty: "Easy",
      category: "saving",
    },
    {
      title: "Save ₹5000 This Month",
      description: "Reach your monthly savings goal and beat your peers",
      participants: 5621,
      daysLeft: 8,
      reward: "Gold Badge + ₹50",
      progress: 80,
      difficulty: "Medium",
      category: "saving",
    },
    {
      title: "Coffee-Free Week",
      description: "Skip the café coffee and save ₹500+ this week",
      participants: 1892,
      daysLeft: 5,
      reward: "Silver Badge",
      progress: 40,
      difficulty: "Easy",
      category: "saving",
    },
  ];

  const investingChallenges = [
    {
      title: "First IPO Application",
      description: "Apply to your first IPO and learn the process",
      participants: 890,
      daysLeft: 15,
      reward: "Investor Badge + ₹200",
      progress: 0,
      difficulty: "Beginner",
      category: "investing",
    },
    {
      title: "Invest ₹1000 in SIP",
      description: "Start your first SIP with just ₹1000 and watch it grow",
      participants: 3200,
      daysLeft: 30,
      reward: "SIP Starter Badge",
      progress: 20,
      difficulty: "Easy",
      category: "investing",
    },
    {
      title: "Diversify Portfolio",
      description: "Invest in at least 3 different sectors",
      participants: 450,
      daysLeft: 20,
      reward: "₹500 + Pro Badge",
      progress: 33,
      difficulty: "Advanced",
      category: "investing",
    },
  ];

  const learningChallenges = [
    {
      title: "Complete Financial Basics",
      description: "Finish the budgeting & saving module (8 lessons)",
      participants: 4500,
      daysLeft: 7,
      reward: "100 XP + Certificate",
      progress: 60,
      difficulty: "Beginner",
      category: "learning",
    },
    {
      title: "Watch 5 IPO Videos",
      description: "Learn how IPOs work through our curated content",
      participants: 2100,
      daysLeft: 10,
      reward: "IPO Expert Badge",
      progress: 40,
      difficulty: "Easy",
      category: "learning",
    },
    {
      title: "Tax Planning Quiz",
      description: "Score 80%+ in the tax planning assessment",
      participants: 780,
      daysLeft: 14,
      reward: "₹150 + Tax Pro Badge",
      progress: 0,
      difficulty: "Medium",
      category: "learning",
    },
  ];

  const leaderboard = [
    { name: "Priya S.", college: "IIT Delhi", savings: 45000, streak: 28, badge: "gold", invested: 25000 },
    { name: "Rahul M.", college: "NIT Trichy", savings: 38500, streak: 21, badge: "gold", invested: 18000 },
    { name: "Anita K.", college: "BITS Pilani", savings: 32000, streak: 35, badge: "silver", invested: 22000 },
    { name: "Vikash P.", college: "DTU", savings: 28000, streak: 14, badge: "silver", invested: 15000 },
    { name: "Sneha R.", college: "VIT Vellore", savings: 25500, streak: 19, badge: "bronze", invested: 12000 },
  ];

  const badges = [
    { name: "First Saver", icon: Star, unlocked: true },
    { name: "Week Streak", icon: Flame, unlocked: true },
    { name: "Budget Master", icon: Target, unlocked: true },
    { name: "Investor", icon: TrendingUp, unlocked: false },
    { name: "Champion", icon: Crown, unlocked: false },
  ];

  const peerStories = [
    {
      name: "Aditya K.",
      college: "SRCC, Delhi",
      story: "Started with ₹500/month, now investing ₹5000! FinWise helped me understand markets.",
      savings: "₹45,000 saved",
      avatar: "A",
    },
    {
      name: "Meera P.",
      college: "Christ University",
      story: "Applied to 3 IPOs this year. Got allotment in 1 and made 40% returns on listing day!",
      savings: "₹12,000 profit",
      avatar: "M",
    },
    {
      name: "Rohan S.",
      college: "NMIMS Mumbai",
      story: "The community challenges motivated me to save ₹50k in 6 months. Best decision ever!",
      savings: "₹50,000 saved",
      avatar: "R",
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
      case 'Beginner':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-primary/20 text-primary';
    }
  };

  const ChallengeCard = ({ challenge }: { challenge: typeof savingChallenges[0] }) => (
    <Card className="glass-card border-border/50 hover:border-primary/50 transition-all cursor-pointer group">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </span>
          <span className="text-xs text-muted-foreground">
            {challenge.daysLeft} days left
          </span>
        </div>
        <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
          {challenge.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground">{challenge.progress}%</span>
          </div>
          <Progress value={challenge.progress} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-foreground">{challenge.reward}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            {challenge.participants.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
              Join thousands of student investors. Compete in challenges, earn rewards, and build better financial habits together.
            </p>
          </motion.div>

          {/* Stats Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { label: 'Active Members', value: '25K+', icon: Users, color: 'text-primary' },
              { label: 'Challenges Completed', value: '150K', icon: Trophy, color: 'text-yellow-500' },
              { label: 'Total Saved', value: '₹2.5Cr', icon: PiggyBank, color: 'text-emerald-500' },
              { label: 'Rewards Given', value: '₹50L+', icon: Gift, color: 'text-pink-500' },
            ].map((stat, i) => (
              <Card key={stat.label} className="glass-card border-border/50 text-center">
                <CardContent className="pt-4 pb-4">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Challenge Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Tabs defaultValue="saving" className="w-full">
              <TabsList className="bg-secondary/50 mb-6">
                <TabsTrigger value="saving" className="gap-2">
                  <PiggyBank className="w-4 h-4" />
                  Saving
                </TabsTrigger>
                <TabsTrigger value="investing" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Investing
                </TabsTrigger>
                <TabsTrigger value="learning" className="gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Learning
                </TabsTrigger>
              </TabsList>

              <TabsContent value="saving">
                <div className="grid md:grid-cols-3 gap-6">
                  {savingChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.title} challenge={challenge} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="investing">
                <div className="grid md:grid-cols-3 gap-6">
                  {investingChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.title} challenge={challenge} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="learning">
                <div className="grid md:grid-cols-3 gap-6">
                  {learningChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.title} challenge={challenge} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Peer Success Stories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Peer Success Stories
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {peerStories.map((story, index) => (
                <Card key={story.name} className="glass-card border-border/50 hover:border-primary/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                          {story.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{story.name}</p>
                        <p className="text-xs text-muted-foreground">{story.college}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 italic">"{story.story}"</p>
                    <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                      <Coins className="w-4 h-4" />
                      {story.savings}
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
                    Top Student Investors
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
                        <p className="text-xs text-muted-foreground">{user.college} • {user.streak} day streak 🔥</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">₹{user.savings.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">₹{user.invested.toLocaleString()} invested</p>
                      </div>
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
                    Your Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4 mb-6">
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
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-secondary/30">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">3</p>
                      <p className="text-xs text-muted-foreground">Badges Earned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">7</p>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">150</p>
                      <p className="text-xs text-muted-foreground">XP Earned</p>
                    </div>
                  </div>
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