import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, Target, TrendingUp, Plus, Globe, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/landing/Navbar';
import { supabase } from '@/integrations/supabase/client';

interface Startup {
  id: string;
  startup_name: string;
  symbol: string;
  description: string | null;
  sector: string | null;
  funding_goal: number;
  raised_amount: number | null;
  equity_offered: number | null;
  min_investment: number | null;
  valuation: number | null;
  founded_year: number | null;
  team_size: number | null;
  status: string;
  logo_url: string | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  approved: 'bg-accent/20 text-accent',
  live: 'bg-primary/20 text-primary',
  funded: 'bg-emerald-500/20 text-emerald-400'
};

const Startups = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    const { data, error } = await supabase
      .from('startup_registrations')
      .select('*')
      .in('status', ['approved', 'live', 'funded'])
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setStartups(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="text-gradient-primary">Student Startups</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Invest in the next generation of innovators. Support student entrepreneurs and earn equity.
          </p>
          <Button onClick={() => navigate('/startups/register')} className="btn-primary-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Register Your Startup
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Startups', value: startups.filter(s => s.status === 'live').length, icon: Building2 },
            { label: 'Total Raised', value: `₹${(startups.reduce((a, s) => a + (s.raised_amount || 0), 0) / 100000).toFixed(1)}L`, icon: TrendingUp },
            { label: 'Investors', value: '500+', icon: Users },
            { label: 'Funded', value: startups.filter(s => s.status === 'funded').length, icon: Target }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-4 text-center"
            >
              <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-secondary/50 rounded-full mb-4" />
                <div className="h-6 bg-secondary/50 rounded w-2/3 mb-2" />
                <div className="h-4 bg-secondary/50 rounded w-full" />
              </div>
            ))}
          </div>
        ) : startups.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">No Startups Yet</h2>
            <p className="text-muted-foreground mb-4">Be the first to register your startup!</p>
            <Button onClick={() => navigate('/startups/register')} className="btn-primary-gradient">
              Register Now
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map((startup, index) => {
              const progress = ((startup.raised_amount || 0) / startup.funding_goal) * 100;
              
              return (
                <motion.div
                  key={startup.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/startups/${startup.id}`)}
                  className="glass-card rounded-xl p-6 cursor-pointer group hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-card rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-primary">{startup.symbol.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold truncate group-hover:text-primary transition-colors">
                          {startup.startup_name}
                        </h3>
                        <Badge className={statusColors[startup.status]}>{startup.status}</Badge>
                      </div>
                      {startup.sector && (
                        <Badge variant="outline" className="text-xs">{startup.sector}</Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {startup.description || 'No description provided'}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-medium">{Math.min(100, progress).toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(100, progress)} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-primary font-medium">
                        ₹{((startup.raised_amount || 0) / 100000).toFixed(1)}L raised
                      </span>
                      <span className="text-muted-foreground">
                        of ₹{(startup.funding_goal / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                    {startup.equity_offered && (
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {startup.equity_offered}% equity
                      </span>
                    )}
                    {startup.team_size && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {startup.team_size} team
                      </span>
                    )}
                    {startup.founded_year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {startup.founded_year}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Startups;
