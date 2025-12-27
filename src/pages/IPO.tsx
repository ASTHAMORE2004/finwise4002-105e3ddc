import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, IndianRupee, Users, ChevronRight, BarChart3, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/landing/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface IPO {
  id: string;
  company_name: string;
  symbol: string;
  logo_url: string | null;
  price_band_low: number;
  price_band_high: number;
  lot_size: number;
  issue_size: number;
  issue_type: string;
  open_date: string;
  close_date: string;
  status: string;
  sector: string;
  description: string;
  subscription_rate: number;
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-accent/20 text-accent',
  open: 'bg-primary/20 text-primary',
  closed: 'bg-muted text-muted-foreground'
};

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const IPO = () => {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchIPOs();
  }, []);

  const fetchIPOs = async () => {
    const { data, error } = await supabase
      .from('ipo_listings')
      .select('*')
      .order('open_date', { ascending: true });
    
    if (!error && data) {
      setIpos(data);
    }
    setLoading(false);
  };

  const filteredIPOs = ipos.filter(ipo => {
    if (activeTab === 'all') return true;
    return ipo.status === activeTab;
  });

  // Chart data preparation
  const sectorData = ipos.reduce((acc, ipo) => {
    const sector = ipo.sector || 'Other';
    const existing = acc.find(item => item.name === sector);
    if (existing) {
      existing.value += 1;
      existing.issueSize += (ipo.issue_size || 0) / 10000000; // Convert to Cr
    } else {
      acc.push({ name: sector, value: 1, issueSize: (ipo.issue_size || 0) / 10000000 });
    }
    return acc;
  }, [] as { name: string; value: number; issueSize: number }[]);

  const subscriptionData = ipos
    .filter(ipo => ipo.subscription_rate > 0)
    .map(ipo => ({
      name: ipo.symbol,
      subscription: ipo.subscription_rate,
      priceHigh: ipo.price_band_high,
    }))
    .slice(0, 6);

  const issueSizeData = ipos.map(ipo => ({
    name: ipo.symbol,
    issueSize: (ipo.issue_size || 0) / 10000000,
    lotSize: ipo.lot_size,
  })).slice(0, 6);

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
            <span className="text-gradient-primary">IPO</span> Listings
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover and apply for the latest Initial Public Offerings in India
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total IPOs', value: ipos.length, icon: TrendingUp },
            { label: 'Open Now', value: ipos.filter(i => i.status === 'open').length, icon: Users },
            { label: 'Upcoming', value: ipos.filter(i => i.status === 'upcoming').length, icon: Calendar },
            { label: 'This Month', value: ipos.filter(i => new Date(i.open_date).getMonth() === new Date().getMonth()).length, icon: IndianRupee }
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

        {/* Charts Section */}
        {ipos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {/* Sector Distribution Pie Chart */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PieChart className="w-5 h-5 text-primary" />
                  Sector Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subscription Rate Bar Chart */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Subscription Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={subscriptionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}x`, 'Subscription']}
                    />
                    <Bar dataKey="subscription" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Issue Size Comparison */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Issue Size (₹ Cr)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={issueSizeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`₹${value.toFixed(0)} Cr`, 'Issue Size']}
                    />
                    <Line type="monotone" dataKey="issueSize" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="all">All IPOs</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-secondary/50 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-secondary/50 rounded w-1/3" />
                    <div className="h-4 bg-secondary/50 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIPOs.map((ipo, index) => (
              <motion.div
                key={ipo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/ipo/${ipo.id}`)}
                className="glass-card rounded-xl p-6 cursor-pointer group hover:border-primary/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-card rounded-full flex items-center justify-center shrink-0">
                    <span className="text-2xl font-bold text-primary">{ipo.symbol.slice(0, 2)}</span>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-display font-semibold group-hover:text-primary transition-colors">
                        {ipo.company_name}
                      </h3>
                      <Badge className={statusColors[ipo.status]}>{ipo.status}</Badge>
                      {ipo.sector && <Badge variant="outline">{ipo.sector}</Badge>}
                    </div>
                    
                    <p className="text-muted-foreground text-sm line-clamp-1">
                      {ipo.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-4 w-4 text-primary" />
                        ₹{ipo.price_band_low} - ₹{ipo.price_band_high}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(ipo.open_date), 'MMM d')} - {format(new Date(ipo.close_date), 'MMM d, yyyy')}
                      </span>
                      <span className="text-muted-foreground">
                        Lot Size: {ipo.lot_size}
                      </span>
                      {ipo.subscription_rate > 0 && (
                        <span className="text-emerald-500 font-medium">
                          {ipo.subscription_rate}x subscribed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {ipo.status === 'open' && (
                      <Button className="btn-primary-gradient">Apply Now</Button>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredIPOs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No IPOs found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPO;
