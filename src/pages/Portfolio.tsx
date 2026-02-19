import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useStockPrices } from "@/hooks/useStockPrices";
import { exportPortfolioToPDF } from "@/utils/pdfExport";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Target,
  Activity,
  Download,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
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
  AreaChart,
  Area
} from "recharts";

interface PortfolioItem {
  id: string;
  investment_type: string;
  investment_name: string;
  symbol: string | null;
  quantity: number;
  buy_price: number;
  current_price: number | null;
  invested_amount: number;
  current_value: number | null;
  sector: string | null;
  purchase_date: string;
  status: string;
}

interface IpoApplication {
  id: string;
  ipo_id: string;
  lots_applied: number;
  bid_price: number;
  amount: number;
  status: string | null;
  created_at: string;
  updated_at: string;
  ipo_listings?: {
    company_name: string;
    symbol: string;
    sector: string | null;
    open_date: string;
    close_date: string;
    listing_date: string | null;
  };
}

const COLORS = ['hsl(158, 64%, 52%)', 'hsl(45, 93%, 58%)', 'hsl(280, 65%, 60%)', 'hsl(200, 70%, 50%)', 'hsl(0, 84%, 60%)'];

const Portfolio = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    investment_type: 'stock',
    investment_name: '',
    symbol: '',
    quantity: '',
    buy_price: '',
    current_price: '',
    sector: ''
  });

  const [ipoApplications, setIpoApplications] = useState<IpoApplication[]>([]);

  // Get stock symbols for real-time prices
  const stockSymbols = portfolio
    .filter(item => item.symbol && item.investment_type === 'stock')
    .map(item => item.symbol as string);
  
  const { prices, loading: pricesLoading, refetch: refetchPrices, lastUpdated } = useStockPrices(stockSymbols);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchPortfolio();
      fetchIpoApplications();
    }
  }, [user, authLoading, navigate]);

  // Subscribe to IPO application changes for real-time updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('ipo-applications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ipo_applications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchIpoApplications();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Update portfolio with real-time prices
  useEffect(() => {
    if (Object.keys(prices).length > 0 && portfolio.length > 0) {
      const updatedPortfolio = portfolio.map(item => {
        if (item.symbol && prices[item.symbol]?.regularMarketPrice) {
          const newPrice = prices[item.symbol].regularMarketPrice;
          return {
            ...item,
            current_price: newPrice,
            current_value: item.quantity * (newPrice || item.buy_price)
          };
        }
        return item;
      });
      setPortfolio(updatedPortfolio);
    }
  }, [prices]);

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from('user_portfolio')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolio(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIpoApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('ipo_applications')
        .select('*, ipo_listings(company_name, symbol, sector, open_date, close_date, listing_date)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIpoApplications((data as any) || []);
    } catch (error) {
      console.error('Error fetching IPO applications:', error);
    }
  };

  const handleAddInvestment = async () => {
    if (!newInvestment.investment_name || !newInvestment.quantity || !newInvestment.buy_price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const quantity = parseFloat(newInvestment.quantity);
    const buyPrice = parseFloat(newInvestment.buy_price);
    const currentPrice = newInvestment.current_price ? parseFloat(newInvestment.current_price) : buyPrice;

    try {
      const { error } = await supabase.from('user_portfolio').insert({
        user_id: user?.id,
        investment_type: newInvestment.investment_type,
        investment_name: newInvestment.investment_name,
        symbol: newInvestment.symbol || null,
        quantity,
        buy_price: buyPrice,
        current_price: currentPrice,
        invested_amount: quantity * buyPrice,
        current_value: quantity * currentPrice,
        sector: newInvestment.sector || null
      });

      if (error) throw error;
      toast.success('Investment added successfully!');
      setIsAddDialogOpen(false);
      setNewInvestment({
        investment_type: 'stock',
        investment_name: '',
        symbol: '',
        quantity: '',
        buy_price: '',
        current_price: '',
        sector: ''
      });
      fetchPortfolio();
    } catch (error) {
      console.error('Error adding investment:', error);
      toast.error('Failed to add investment');
    }
  };

  // Calculate portfolio metrics
  const totalInvested = portfolio.reduce((sum, item) => sum + Number(item.invested_amount), 0);
  const totalCurrentValue = portfolio.reduce((sum, item) => sum + Number(item.current_value || item.invested_amount), 0);
  const totalReturns = totalCurrentValue - totalInvested;
  const returnsPercent = totalInvested > 0 ? ((totalReturns / totalInvested) * 100) : 0;

  // Sector distribution
  const sectorData = portfolio.reduce((acc: { name: string; value: number }[], item) => {
    const sector = item.sector || 'Other';
    const existing = acc.find(s => s.name === sector);
    if (existing) {
      existing.value += Number(item.current_value || item.invested_amount);
    } else {
      acc.push({ name: sector, value: Number(item.current_value || item.invested_amount) });
    }
    return acc;
  }, []);

  // Investment type distribution
  const typeData = portfolio.reduce((acc: { name: string; value: number }[], item) => {
    const type = item.investment_type;
    const existing = acc.find(t => t.name === type);
    if (existing) {
      existing.value += Number(item.current_value || item.invested_amount);
    } else {
      acc.push({ name: type, value: Number(item.current_value || item.invested_amount) });
    }
    return acc;
  }, []);

  // Performance data (mock for chart)
  const performanceData = [
    { month: 'Jan', value: totalInvested * 0.95 },
    { month: 'Feb', value: totalInvested * 0.98 },
    { month: 'Mar', value: totalInvested * 1.02 },
    { month: 'Apr', value: totalInvested * 1.05 },
    { month: 'May', value: totalInvested * 1.03 },
    { month: 'Jun', value: totalCurrentValue }
  ];

  if (authLoading || loading) {
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
          className="flex flex-col md:flex-row md:items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              My <span className="text-gradient-primary">Portfolio</span>
            </h1>
            <p className="text-muted-foreground">Track your investments and performance</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => refetchPrices()}
              disabled={pricesLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${pricesLoading ? 'animate-spin' : ''}`} />
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Refresh'}
            </Button>
            <Button
              variant="outline"
              onClick={() => exportPortfolioToPDF(portfolio, { totalInvested, totalCurrentValue, totalReturns, returnsPercent })}
              disabled={portfolio.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Investment
                </Button>
              </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Add New Investment</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Investment Type</Label>
                  <Select value={newInvestment.investment_type} onValueChange={(v) => setNewInvestment({...newInvestment, investment_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                      <SelectItem value="ipo">IPO</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Name *</Label>
                  <Input
                    value={newInvestment.investment_name}
                    onChange={(e) => setNewInvestment({...newInvestment, investment_name: e.target.value})}
                    placeholder="e.g., Apple Inc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Symbol</Label>
                    <Input
                      value={newInvestment.symbol}
                      onChange={(e) => setNewInvestment({...newInvestment, symbol: e.target.value})}
                      placeholder="e.g., AAPL"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Sector</Label>
                    <Input
                      value={newInvestment.sector}
                      onChange={(e) => setNewInvestment({...newInvestment, sector: e.target.value})}
                      placeholder="e.g., Technology"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={newInvestment.quantity}
                      onChange={(e) => setNewInvestment({...newInvestment, quantity: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Buy Price *</Label>
                    <Input
                      type="number"
                      value={newInvestment.buy_price}
                      onChange={(e) => setNewInvestment({...newInvestment, buy_price: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Current Price</Label>
                    <Input
                      type="number"
                      value={newInvestment.current_price}
                      onChange={(e) => setNewInvestment({...newInvestment, current_price: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={handleAddInvestment} className="w-full mt-4">
                  Add Investment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Invested</p>
                    <p className="text-2xl font-bold text-foreground">₹{totalInvested.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Current Value</p>
                    <p className="text-2xl font-bold text-foreground">₹{totalCurrentValue.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Returns</p>
                    <p className={`text-2xl font-bold ${totalReturns >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {totalReturns >= 0 ? '+' : ''}₹{totalReturns.toLocaleString()}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${totalReturns >= 0 ? 'bg-primary/20' : 'bg-destructive/20'} flex items-center justify-center`}>
                    {totalReturns >= 0 ? <TrendingUp className="w-6 h-6 text-primary" /> : <TrendingDown className="w-6 h-6 text-destructive" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Returns %</p>
                    <p className={`text-2xl font-bold ${returnsPercent >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {returnsPercent >= 0 ? '+' : ''}{returnsPercent.toFixed(2)}%
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${returnsPercent >= 0 ? 'bg-primary/20' : 'bg-destructive/20'} flex items-center justify-center`}>
                    <Activity className="w-6 h-6 text-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Portfolio Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
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
                    <Area type="monotone" dataKey="value" stroke="hsl(158, 64%, 52%)" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sector Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-accent" />
                  Sector Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sectorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(222, 47%, 8%)',
                          border: '1px solid hsl(222, 47%, 16%)',
                          borderRadius: '8px'
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    Add investments to see distribution
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabbed Holdings & IPO Applications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Tabs defaultValue="holdings" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="holdings" className="gap-2">
                <Wallet className="w-4 h-4" /> Holdings
              </TabsTrigger>
              <TabsTrigger value="ipo-applications" className="gap-2">
                <FileText className="w-4 h-4" /> IPO Applications
                {ipoApplications.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{ipoApplications.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="holdings">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolio.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No investments yet. Add your first investment to get started!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Qty</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Avg Price</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Current</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Invested</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Current Value</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">P&L</th>
                          </tr>
                        </thead>
                        <tbody>
                          {portfolio.map((item) => {
                            const pnl = (Number(item.current_value) || 0) - Number(item.invested_amount);
                            const pnlPercent = ((pnl / Number(item.invested_amount)) * 100);
                            return (
                              <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                                <td className="py-4 px-4">
                                  <div>
                                    <p className="font-medium text-foreground">{item.investment_name}</p>
                                    {item.symbol && <p className="text-sm text-muted-foreground">{item.symbol}</p>}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <Badge variant="outline" className="capitalize">{item.investment_type}</Badge>
                                </td>
                                <td className="py-4 px-4 text-right text-foreground">{item.quantity}</td>
                                <td className="py-4 px-4 text-right text-foreground">₹{Number(item.buy_price).toLocaleString()}</td>
                                <td className="py-4 px-4 text-right text-foreground">₹{Number(item.current_price || item.buy_price).toLocaleString()}</td>
                                <td className="py-4 px-4 text-right text-foreground">₹{Number(item.invested_amount).toLocaleString()}</td>
                                <td className="py-4 px-4 text-right text-foreground">₹{Number(item.current_value || item.invested_amount).toLocaleString()}</td>
                                <td className="py-4 px-4 text-right">
                                  <div className={`flex items-center justify-end gap-1 ${pnl >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                    {pnl >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    <span>{pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ipo-applications">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    IPO Application History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ipoApplications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No IPO applications yet.</p>
                      <Button variant="outline" className="mt-4" onClick={() => navigate('/ipo')}>
                        Browse IPOs
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Company</th>
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Lots</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Bid Price</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Amount</th>
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Applied On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ipoApplications.map((app) => {
                            const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
                              pending: { icon: Clock, color: 'text-amber-500', label: 'Pending' },
                              pending_payment: { icon: Clock, color: 'text-amber-400', label: 'Awaiting Payment' },
                              confirmed: { icon: CheckCircle2, color: 'text-primary', label: 'Confirmed' },
                              allotted: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Allotted' },
                              rejected: { icon: XCircle, color: 'text-destructive', label: 'Rejected' },
                              not_allotted: { icon: AlertCircle, color: 'text-muted-foreground', label: 'Not Allotted' },
                              payment_expired: { icon: XCircle, color: 'text-muted-foreground', label: 'Payment Expired' },
                            };
                            const status = statusConfig[app.status || 'pending'] || statusConfig.pending;
                            const StatusIcon = status.icon;
                            return (
                              <tr key={app.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => navigate(`/ipo/${app.ipo_id}`)}>
                                <td className="py-4 px-4">
                                  <div>
                                    <p className="font-medium text-foreground">{app.ipo_listings?.company_name || 'Unknown'}</p>
                                    <p className="text-sm text-muted-foreground">{app.ipo_listings?.symbol}</p>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className={`flex items-center gap-1.5 ${status.color}`}>
                                    <StatusIcon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{status.label}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-right text-foreground">{app.lots_applied}</td>
                                <td className="py-4 px-4 text-right text-foreground">₹{Number(app.bid_price).toLocaleString()}</td>
                                <td className="py-4 px-4 text-right text-foreground">₹{Number(app.amount).toLocaleString()}</td>
                                <td className="py-4 px-4 text-muted-foreground text-sm">
                                  {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Portfolio;
