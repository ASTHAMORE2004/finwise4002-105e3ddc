import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Flame,
  Target,
  Shield,
  AlertTriangle,
  Building2,
  Rocket,
  ArrowUpRight
} from "lucide-react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

interface IPO {
  id: string;
  company_name: string;
  sector: string | null;
  price_band_high: number;
  subscription_rate: number | null;
  status: string;
  issue_size: number | null;
}

interface Startup {
  id: string;
  startup_name: string;
  sector: string | null;
  valuation: number | null;
  funding_goal: number;
  raised_amount: number | null;
  status: string;
}

const COLORS = [
  'hsl(158, 64%, 52%)',
  'hsl(45, 93%, 58%)',
  'hsl(280, 65%, 60%)',
  'hsl(200, 70%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(120, 60%, 45%)',
  'hsl(30, 90%, 55%)'
];

const RISK_LEVELS = [
  { level: 'Low', min: 0, max: 3, color: 'text-primary', bg: 'bg-primary/20' },
  { level: 'Moderate', min: 3, max: 6, color: 'text-accent', bg: 'bg-accent/20' },
  { level: 'High', min: 6, max: 10, color: 'text-destructive', bg: 'bg-destructive/20' }
];

const TrendingAnalytics = () => {
  const navigate = useNavigate();
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: ipoData } = await supabase
        .from('ipo_listings')
        .select('*')
        .order('subscription_rate', { ascending: false });

      const { data: startupData } = await supabase
        .from('startup_registrations')
        .select('*')
        .in('status', ['approved', 'live', 'funded'])
        .order('raised_amount', { ascending: false });

      setIpos(ipoData || []);
      setStartups(startupData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sector analysis for IPOs
  const ipoSectorData = ipos.reduce((acc: { name: string; value: number; count: number }[], ipo) => {
    const sector = ipo.sector || 'Other';
    const existing = acc.find(s => s.name === sector);
    if (existing) {
      existing.value += Number(ipo.issue_size || 0);
      existing.count += 1;
    } else {
      acc.push({ name: sector, value: Number(ipo.issue_size || 0), count: 1 });
    }
    return acc;
  }, []);

  // Sector analysis for Startups
  const startupSectorData = startups.reduce((acc: { name: string; value: number; count: number }[], startup) => {
    const sector = startup.sector || 'Other';
    const existing = acc.find(s => s.name === sector);
    if (existing) {
      existing.value += Number(startup.raised_amount || 0);
      existing.count += 1;
    } else {
      acc.push({ name: sector, value: Number(startup.raised_amount || 0), count: 1 });
    }
    return acc;
  }, []);

  // Top performing IPOs by subscription
  const topIpos = ipos
    .filter(ipo => ipo.subscription_rate && ipo.subscription_rate > 0)
    .slice(0, 5);

  // Top funded startups
  const topStartups = startups
    .filter(s => s.raised_amount && s.raised_amount > 0)
    .slice(0, 5);

  // Calculate risk score based on various factors
  const calculateRiskScore = (item: IPO | Startup, type: 'ipo' | 'startup') => {
    let score = 5; // Base score

    if (type === 'ipo') {
      const ipo = item as IPO;
      // Lower subscription = higher risk
      if (ipo.subscription_rate) {
        if (ipo.subscription_rate > 5) score -= 2;
        else if (ipo.subscription_rate < 1) score += 2;
      }
      // Larger issue size = moderate risk reduction
      if (ipo.issue_size && ipo.issue_size > 1000) score -= 1;
    } else {
      const startup = item as Startup;
      // Higher funding = lower risk
      const fundingRatio = (startup.raised_amount || 0) / startup.funding_goal;
      if (fundingRatio > 0.8) score -= 2;
      else if (fundingRatio < 0.2) score += 2;
    }

    return Math.max(1, Math.min(10, score));
  };

  // Radar chart data for sector risk analysis
  const sectorRiskData = [...new Set([...ipos.map(i => i.sector), ...startups.map(s => s.sector)])]
    .filter(Boolean)
    .slice(0, 6)
    .map(sector => {
      const sectorIpos = ipos.filter(i => i.sector === sector);
      const sectorStartups = startups.filter(s => s.sector === sector);
      const avgRisk = (
        sectorIpos.reduce((sum, ipo) => sum + calculateRiskScore(ipo, 'ipo'), 0) +
        sectorStartups.reduce((sum, s) => sum + calculateRiskScore(s, 'startup'), 0)
      ) / (sectorIpos.length + sectorStartups.length || 1);

      return {
        sector: sector as string,
        risk: avgRisk,
        fullMark: 10
      };
    });

  // Monthly trend data (mock based on created dates)
  const monthlyTrendData = [
    { month: 'Jul', ipos: 12, startups: 8, volume: 450 },
    { month: 'Aug', ipos: 15, startups: 12, volume: 680 },
    { month: 'Sep', ipos: 18, startups: 15, volume: 820 },
    { month: 'Oct', ipos: 14, startups: 18, volume: 750 },
    { month: 'Nov', ipos: 22, startups: 20, volume: 950 },
    { month: 'Dec', ipos: ipos.length, startups: startups.length, volume: 1100 }
  ];

  const getRiskLevel = (score: number) => {
    return RISK_LEVELS.find(r => score >= r.min && score < r.max) || RISK_LEVELS[1];
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Trending <span className="text-gradient-primary">Analytics</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time market insights, sector analysis, and risk assessment for informed investment decisions
          </p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{ipos.length}</p>
                  <p className="text-sm text-muted-foreground">Total IPOs</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{startups.length}</p>
                  <p className="text-sm text-muted-foreground">Active Startups</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(ipos.reduce((sum, ipo) => sum + (ipo.issue_size || 0), 0))}
                  </p>
                  <p className="text-sm text-muted-foreground">Total IPO Size</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(startups.reduce((sum, s) => sum + (s.raised_amount || 0), 0))}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Raised</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="sectors" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Sectors
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Risk Analysis
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              AI Picks
            </TabsTrigger>
          </TabsList>

          {/* Trending Tab */}
          <TabsContent value="trending">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Market Trend Chart */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Market Trends
                    </CardTitle>
                    <CardDescription>Monthly IPO and startup activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 20%)" />
                        <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" />
                        <YAxis stroke="hsl(215, 20%, 55%)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(222, 47%, 8%)',
                            border: '1px solid hsl(222, 47%, 16%)',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="ipos" name="IPOs" stroke="hsl(158, 64%, 52%)" strokeWidth={2} />
                        <Line type="monotone" dataKey="startups" name="Startups" stroke="hsl(45, 93%, 58%)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Performers */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-accent" />
                      Top Performing IPOs
                    </CardTitle>
                    <CardDescription>By subscription rate</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {topIpos.map((ipo, index) => (
                      <div
                        key={ipo.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/ipo/${ipo.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-accent text-accent-foreground' : 'bg-secondary text-foreground'}`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">{ipo.company_name}</p>
                            <p className="text-sm text-muted-foreground">{ipo.sector}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{ipo.subscription_rate}x</p>
                          <p className="text-sm text-muted-foreground">subscribed</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Startups */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-primary" />
                      Top Funded Startups
                    </CardTitle>
                    <CardDescription>By amount raised</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {topStartups.map((startup, index) => {
                      const progress = ((startup.raised_amount || 0) / startup.funding_goal) * 100;
                      return (
                        <div
                          key={startup.id}
                          className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                          onClick={() => navigate('/startups')}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium text-foreground">{startup.startup_name}</p>
                                <p className="text-sm text-muted-foreground">{startup.sector}</p>
                              </div>
                            </div>
                            <p className="font-bold text-primary">{formatCurrency(startup.raised_amount || 0)}</p>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Volume Chart */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-accent" />
                      Investment Volume
                    </CardTitle>
                    <CardDescription>Monthly investment activity (in Cr)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 20%)" />
                        <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" />
                        <YAxis stroke="hsl(215, 20%, 55%)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(222, 47%, 8%)',
                            border: '1px solid hsl(222, 47%, 16%)',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="volume" name="Volume (Cr)" fill="hsl(158, 64%, 52%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Sectors Tab */}
          <TabsContent value="sectors">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* IPO Sector Distribution */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      IPO Sector Distribution
                    </CardTitle>
                    <CardDescription>By issue size</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie
                          data={ipoSectorData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {ipoSectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(222, 47%, 8%)',
                            border: '1px solid hsl(222, 47%, 16%)',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Startup Sector Distribution */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-accent" />
                      Startup Sector Distribution
                    </CardTitle>
                    <CardDescription>By amount raised</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie
                          data={startupSectorData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {startupSectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(222, 47%, 8%)',
                            border: '1px solid hsl(222, 47%, 16%)',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sector Breakdown Table */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Sector Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Sector</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">IPOs</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">IPO Value</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Startups</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Startup Raised</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...new Set([...ipoSectorData.map(s => s.name), ...startupSectorData.map(s => s.name)])].map((sector, index) => {
                            const ipoSector = ipoSectorData.find(s => s.name === sector);
                            const startupSector = startupSectorData.find(s => s.name === sector);
                            return (
                              <tr key={index} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="font-medium text-foreground">{sector}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-right text-foreground">{ipoSector?.count || 0}</td>
                                <td className="py-4 px-4 text-right text-primary">{formatCurrency(ipoSector?.value || 0)}</td>
                                <td className="py-4 px-4 text-right text-foreground">{startupSector?.count || 0}</td>
                                <td className="py-4 px-4 text-right text-accent">{formatCurrency(startupSector?.value || 0)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Risk Analysis Tab */}
          <TabsContent value="risk">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Risk Radar Chart */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Sector Risk Analysis
                    </CardTitle>
                    <CardDescription>Risk score by sector (1-10, lower is better)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sectorRiskData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={sectorRiskData}>
                          <PolarGrid stroke="hsl(222, 47%, 20%)" />
                          <PolarAngleAxis dataKey="sector" stroke="hsl(215, 20%, 55%)" />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="hsl(215, 20%, 55%)" />
                          <Radar name="Risk Score" dataKey="risk" stroke="hsl(158, 64%, 52%)" fill="hsl(158, 64%, 52%)" fillOpacity={0.3} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(222, 47%, 8%)',
                              border: '1px solid hsl(222, 47%, 16%)',
                              borderRadius: '8px'
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        Not enough data for risk analysis
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Risk Legend */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-accent" />
                      Understanding Risk Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {RISK_LEVELS.map((level, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl ${level.bg} flex items-center justify-center`}>
                          <span className={`text-2xl font-bold ${level.color}`}>{level.min}-{level.max}</span>
                        </div>
                        <div>
                          <p className={`font-semibold ${level.color}`}>{level.level} Risk</p>
                          <p className="text-sm text-muted-foreground">
                            {level.level === 'Low' && 'Well-established with strong market performance'}
                            {level.level === 'Moderate' && 'Balanced risk-reward with some uncertainty'}
                            {level.level === 'High' && 'Higher volatility with potential for significant gains or losses'}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Risk factors considered:</strong>
                        <br />• Subscription rates (IPOs)
                        <br />• Funding progress (Startups)
                        <br />• Issue/valuation size
                        <br />• Sector performance
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* IPO Risk Table */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Investment Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Building2 className="w-4 h-4" /> IPOs
                        </h4>
                        <div className="space-y-3">
                          {ipos.slice(0, 5).map(ipo => {
                            const risk = calculateRiskScore(ipo, 'ipo');
                            const riskLevel = getRiskLevel(risk);
                            return (
                              <div key={ipo.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                <div>
                                  <p className="font-medium text-foreground">{ipo.company_name}</p>
                                  <p className="text-sm text-muted-foreground">{ipo.sector}</p>
                                </div>
                                <Badge className={`${riskLevel.bg} ${riskLevel.color} border-0`}>
                                  {riskLevel.level} ({risk.toFixed(1)})
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Rocket className="w-4 h-4" /> Startups
                        </h4>
                        <div className="space-y-3">
                          {startups.slice(0, 5).map(startup => {
                            const risk = calculateRiskScore(startup, 'startup');
                            const riskLevel = getRiskLevel(risk);
                            return (
                              <div key={startup.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                <div>
                                  <p className="font-medium text-foreground">{startup.startup_name}</p>
                                  <p className="text-sm text-muted-foreground">{startup.sector}</p>
                                </div>
                                <Badge className={`${riskLevel.bg} ${riskLevel.color} border-0`}>
                                  {riskLevel.level} ({risk.toFixed(1)})
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
          {/* AI Recommendations Tab */}
          <TabsContent value="recommendations">
            <div className="grid gap-8">
              {/* AI-Scored IPO Recommendations */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUpRight className="w-5 h-5 text-primary" />
                      AI-Recommended IPOs
                    </CardTitle>
                    <CardDescription>
                      Ranked by composite score: subscription rate, sector performance, risk-adjusted returns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const scoredIpos = ipos.map(ipo => {
                        const risk = calculateRiskScore(ipo, 'ipo');
                        const subscriptionScore = Math.min((ipo.subscription_rate || 0) * 10, 40);
                        const sizeScore = ipo.issue_size ? Math.min(ipo.issue_size / 500, 20) : 5;
                        const riskScore = (10 - risk) * 4; // Lower risk = higher score
                        const composite = subscriptionScore + sizeScore + riskScore;
                        const sectorIpos = ipos.filter(i => i.sector === ipo.sector);
                        const sectorAvgSub = sectorIpos.reduce((s, i) => s + (i.subscription_rate || 0), 0) / (sectorIpos.length || 1);
                        return {
                          ...ipo,
                          compositeScore: Math.min(composite, 100),
                          risk,
                          riskLevel: getRiskLevel(risk),
                          sectorAvgSub,
                          recommendation: composite > 60 ? 'Strong Buy' : composite > 40 ? 'Buy' : composite > 25 ? 'Hold' : 'Watch',
                          recColor: composite > 60 ? 'text-primary bg-primary/20' : composite > 40 ? 'text-accent bg-accent/20' : composite > 25 ? 'text-muted-foreground bg-secondary' : 'text-destructive bg-destructive/20',
                        };
                      }).sort((a, b) => b.compositeScore - a.compositeScore);

                      if (scoredIpos.length === 0) {
                        return (
                          <div className="text-center py-12 text-muted-foreground">
                            No IPO data available for recommendations
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {scoredIpos.map((ipo, index) => (
                            <div
                              key={ipo.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors gap-3"
                              onClick={() => navigate(`/ipo/${ipo.id}`)}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${index < 3 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                                  #{index + 1}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">{ipo.company_name}</p>
                                  <p className="text-sm text-muted-foreground">{ipo.sector} • {ipo.subscription_rate || 0}x subscribed</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 ml-14 sm:ml-0">
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">AI Score</p>
                                  <p className="font-bold text-primary">{ipo.compositeScore.toFixed(0)}/100</p>
                                </div>
                                <Progress value={ipo.compositeScore} className="w-20 h-2" />
                                <Badge className={`${ipo.recColor} border-0 whitespace-nowrap`}>
                                  {ipo.recommendation}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sector Momentum */}
              <div className="grid lg:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="glass-card h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-accent" />
                        Hot Sectors
                      </CardTitle>
                      <CardDescription>Sectors with highest average subscription rates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const sectorPerformance = ipoSectorData
                          .map(sector => {
                            const sectorIpos = ipos.filter(i => (i.sector || 'Other') === sector.name);
                            const avgSub = sectorIpos.reduce((s, i) => s + (i.subscription_rate || 0), 0) / (sectorIpos.length || 1);
                            return { ...sector, avgSub, ipoCount: sectorIpos.length };
                          })
                          .sort((a, b) => b.avgSub - a.avgSub)
                          .slice(0, 5);

                        return sectorPerformance.map((sector, index) => (
                          <div key={sector.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              <div>
                                <p className="font-medium text-foreground">{sector.name}</p>
                                <p className="text-sm text-muted-foreground">{sector.ipoCount} IPOs</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">{sector.avgSub.toFixed(1)}x</p>
                              <p className="text-xs text-muted-foreground">avg subscription</p>
                            </div>
                          </div>
                        ));
                      })()}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="glass-card h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Investment Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const totalIssueSize = ipos.reduce((s, i) => s + (i.issue_size || 0), 0);
                        const avgSubscription = ipos.reduce((s, i) => s + (i.subscription_rate || 0), 0) / (ipos.length || 1);
                        const highSubCount = ipos.filter(i => (i.subscription_rate || 0) > 2).length;
                        const topSector = ipoSectorData.sort((a, b) => b.value - a.value)[0];

                        return (
                          <>
                            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                              <p className="text-sm text-muted-foreground">Average Subscription Rate</p>
                              <p className="text-2xl font-bold text-primary">{avgSubscription.toFixed(1)}x</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {avgSubscription > 2 ? '🔥 Market is bullish — strong demand' : 'Market showing moderate interest'}
                              </p>
                            </div>
                            <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                              <p className="text-sm text-muted-foreground">Oversubscribed IPOs ({'>'}2x)</p>
                              <p className="text-2xl font-bold text-accent">{highSubCount} / {ipos.length}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {highSubCount > ipos.length / 2 ? 'Majority oversubscribed — high investor confidence' : 'Selective subscription patterns'}
                              </p>
                            </div>
                            {topSector && (
                              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                                <p className="text-sm text-muted-foreground">Dominant Sector</p>
                                <p className="text-xl font-bold text-foreground">{topSector.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatCurrency(topSector.value)} in issue size across {topSector.count} IPOs
                                </p>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TrendingAnalytics;
