import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Building2, FileText, Link as LinkIcon, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/landing/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const sectors = [
  'FinTech', 'EdTech', 'HealthTech', 'E-Commerce', 'SaaS', 
  'AI/ML', 'CleanTech', 'AgriTech', 'PropTech', 'Other'
];

const StartupRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startup_name: '',
    symbol: '',
    description: '',
    sector: '',
    funding_goal: '',
    equity_offered: '',
    min_investment: '1000',
    valuation: '',
    website_url: '',
    founded_year: new Date().getFullYear().toString(),
    team_size: '1',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to register your startup', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!formData.startup_name || !formData.symbol || !formData.funding_goal) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('startup_registrations').insert({
      user_id: user.id,
      startup_name: formData.startup_name,
      symbol: formData.symbol.toUpperCase(),
      description: formData.description,
      sector: formData.sector,
      funding_goal: parseFloat(formData.funding_goal),
      equity_offered: formData.equity_offered ? parseFloat(formData.equity_offered) : null,
      min_investment: parseFloat(formData.min_investment),
      valuation: formData.valuation ? parseFloat(formData.valuation) : null,
      website_url: formData.website_url || null,
      founded_year: parseInt(formData.founded_year),
      team_size: parseInt(formData.team_size),
      status: 'pending'
    });

    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Registration submitted!', description: 'Your startup will be reviewed by our team' });
      navigate('/startups');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => navigate('/startups')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Startups
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Register Your <span className="text-gradient-primary">Startup</span>
            </h1>
            <p className="text-muted-foreground">Get funding from student investors</p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startup_name">Startup Name *</Label>
                <Input
                  id="startup_name"
                  placeholder="Your Startup Name"
                  value={formData.startup_name}
                  onChange={(e) => setFormData({...formData, startup_name: e.target.value})}
                  className="bg-secondary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symbol">Trading Symbol *</Label>
                <Input
                  id="symbol"
                  placeholder="e.g., STRP"
                  value={formData.symbol}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase().slice(0, 5)})}
                  className="bg-secondary/50 uppercase"
                  maxLength={5}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your startup, what problem you solve, and your vision..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-secondary/50 min-h-[100px]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Select value={formData.sector} onValueChange={(v) => setFormData({...formData, sector: v})}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="funding_goal">Funding Goal (₹) *</Label>
                <Input
                  id="funding_goal"
                  type="number"
                  placeholder="e.g., 500000"
                  value={formData.funding_goal}
                  onChange={(e) => setFormData({...formData, funding_goal: e.target.value})}
                  className="bg-secondary/50"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="equity_offered">Equity Offered (%)</Label>
                <Input
                  id="equity_offered"
                  type="number"
                  placeholder="e.g., 10"
                  step="0.1"
                  value={formData.equity_offered}
                  onChange={(e) => setFormData({...formData, equity_offered: e.target.value})}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_investment">Min Investment (₹)</Label>
                <Input
                  id="min_investment"
                  type="number"
                  value={formData.min_investment}
                  onChange={(e) => setFormData({...formData, min_investment: e.target.value})}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valuation">Valuation (₹)</Label>
                <Input
                  id="valuation"
                  type="number"
                  placeholder="e.g., 5000000"
                  value={formData.valuation}
                  onChange={(e) => setFormData({...formData, valuation: e.target.value})}
                  className="bg-secondary/50"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  placeholder="https://..."
                  value={formData.website_url}
                  onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="founded_year">Founded Year</Label>
                <Input
                  id="founded_year"
                  type="number"
                  value={formData.founded_year}
                  onChange={(e) => setFormData({...formData, founded_year: e.target.value})}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team_size">Team Size</Label>
                <Input
                  id="team_size"
                  type="number"
                  value={formData.team_size}
                  onChange={(e) => setFormData({...formData, team_size: e.target.value})}
                  className="bg-secondary/50"
                />
              </div>
            </div>

            <Button type="submit" className="w-full btn-primary-gradient h-12" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default StartupRegistration;
