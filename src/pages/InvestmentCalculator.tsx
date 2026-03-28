import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  TrendingUp,
  Wallet,
  Clock,
  PiggyBank,
  BarChart3,
  Target,
  IndianRupee,
  Lightbulb,
  ArrowUpRight
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

interface IPOListing {
  id: string;
  company_name: string;
  sector: string | null;
  price_band_low: number;
  price_band_high: number;
  lot_size: number;
  subscription_rate: number | null;
  issue_size: number | null;
  status: string | null;
}

const InvestmentCalculator = () => {
  const navigate = useNavigate();
  const sampleIpos: IPOListing[] = [
    { id: '1', company_name: 'TechNova AI', sector: 'Technology', price_band_low: 350, price_band_high: 380, lot_size: 40, subscription_rate: 45.2, issue_size: 2500, status: 'open' },
    { id: '2', company_name: 'GreenPower Energy', sector: 'Energy', price_band_low: 120, price_band_high: 140, lot_size: 100, subscription_rate: 32.8, issue_size: 1800, status: 'open' },
    { id: '3', company_name: 'FinStack Digital', sector: 'Fintech', price_band_low: 500, price_band_high: 540, lot_size: 28, subscription_rate: 28.5, issue_size: 3200, status: 'open' },
    { id: '4', company_name: 'MediCare Plus', sector: 'Healthcare', price_band_low: 200, price_band_high: 220, lot_size: 65, subscription_rate: 22.1, issue_size: 1500, status: 'open' },
    { id: '5', company_name: 'AgroSmart Foods', sector: 'FMCG', price_band_low: 80, price_band_high: 95, lot_size: 150, subscription_rate: 18.6, issue_size: 900, status: 'open' },
    { id: '6', company_name: 'CloudBridge Infra', sector: 'Infrastructure', price_band_low: 280, price_band_high: 310, lot_size: 45, subscription_rate: 15.4, issue_size: 4500, status: 'open' },
    { id: '7', company_name: 'EduLearn Pro', sector: 'EdTech', price_band_low: 150, price_band_high: 175, lot_size: 80, subscription_rate: 12.9, issue_size: 1200, status: 'open' },
    { id: '8', company_name: 'AutoDrive Motors', sector: 'Automobile', price_band_low: 600, price_band_high: 650, lot_size: 22, subscription_rate: 11.3, issue_size: 5800, status: 'open' },
    { id: '9', company_name: 'PharmaCure Bio', sector: 'Pharma', price_band_low: 420, price_band_high: 450, lot_size: 33, subscription_rate: 9.7, issue_size: 2200, status: 'open' },
    { id: '10', company_name: 'RetailMax Chain', sector: 'Retail', price_band_low: 90, price_band_high: 105, lot_size: 130, subscription_rate: 8.2, issue_size: 750, status: 'open' },
    { id: '11', company_name: 'SkyNet Telecom', sector: 'Telecom', price_band_low: 320, price_band_high: 350, lot_size: 42, subscription_rate: 7.5, issue_size: 6200, status: 'open' },
    { id: '12', company_name: 'CryptoVault Finance', sector: 'Fintech', price_band_low: 180, price_band_high: 200, lot_size: 70, subscription_rate: 35.0, issue_size: 1600, status: 'open' },
    { id: '13', company_name: 'SolarGrid Tech', sector: 'Energy', price_band_low: 250, price_band_high: 275, lot_size: 55, subscription_rate: 19.3, issue_size: 2800, status: 'open' },
    { id: '14', company_name: 'FoodieExpress', sector: 'Consumer', price_band_low: 110, price_band_high: 130, lot_size: 110, subscription_rate: 14.8, issue_size: 980, status: 'open' },
    { id: '15', company_name: 'DataMesh Analytics', sector: 'Technology', price_band_low: 440, price_band_high: 470, lot_size: 30, subscription_rate: 26.4, issue_size: 3500, status: 'open' },
    { id: '16', company_name: 'HomeFirst Realty', sector: 'Real Estate', price_band_low: 380, price_band_high: 410, lot_size: 36, subscription_rate: 6.1, issue_size: 4100, status: 'open' },
    { id: '17', company_name: 'LogiTrans Cargo', sector: 'Logistics', price_band_low: 160, price_band_high: 185, lot_size: 75, subscription_rate: 10.5, issue_size: 1350, status: 'open' },
    { id: '18', company_name: 'NanoMat Sciences', sector: 'Materials', price_band_low: 700, price_band_high: 750, lot_size: 20, subscription_rate: 42.0, issue_size: 7500, status: 'open' },
    { id: '19', company_name: 'UrbanClap Services', sector: 'Services', price_band_low: 55, price_band_high: 65, lot_size: 200, subscription_rate: 5.3, issue_size: 600, status: 'open' },
    { id: '20', company_name: 'BioGenix Labs', sector: 'Biotech', price_band_low: 520, price_band_high: 560, lot_size: 25, subscription_rate: 30.2, issue_size: 4800, status: 'open' },
  ];

  const [dbIpos, setDbIpos] = useState<IPOListing[]>([]);

  useEffect(() => {
    const fetchIpos = async () => {
      const { data } = await supabase
        .from('ipo_listings')
        .select('*')
        .order('subscription_rate', { ascending: false });
      setDbIpos(data || []);
    };
    fetchIpos();
  }, []);

  const ipos = dbIpos.length >= 20 ? dbIpos : [...dbIpos, ...sampleIpos].slice(0, 20);
  // SIP Calculator State
  const [sipMonthly, setSipMonthly] = useState(5000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  // Lumpsum Calculator State
  const [lumpsum, setLumpsum] = useState(100000);
  const [lumpsumRate, setLumpsumRate] = useState(12);
  const [lumpsumYears, setLumpsumYears] = useState(10);

  // Compound Interest State
  const [principal, setPrincipal] = useState(100000);
  const [ciRate, setCiRate] = useState(8);
  const [ciYears, setCiYears] = useState(5);
  const [compoundFreq, setCompoundFreq] = useState(12);

  // Returns Calculator State
  const [initialValue, setInitialValue] = useState(100000);
  const [finalValue, setFinalValue] = useState(150000);
  const [holdingPeriod, setHoldingPeriod] = useState(3);

  // SIP Calculations
  const calculateSIP = () => {
    const monthlyRate = sipRate / 100 / 12;
    const months = sipYears * 12;
    const futureValue = sipMonthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvested = sipMonthly * months;
    const returns = futureValue - totalInvested;
    return { futureValue, totalInvested, returns };
  };

  // Lumpsum Calculations
  const calculateLumpsum = () => {
    const futureValue = lumpsum * Math.pow(1 + lumpsumRate / 100, lumpsumYears);
    const returns = futureValue - lumpsum;
    return { futureValue, returns };
  };

  // Compound Interest Calculations
  const calculateCI = () => {
    const amount = principal * Math.pow(1 + ciRate / 100 / compoundFreq, compoundFreq * ciYears);
    const interest = amount - principal;
    return { amount, interest };
  };

  // Returns Calculations
  const calculateReturns = () => {
    const absoluteReturn = ((finalValue - initialValue) / initialValue) * 100;
    const cagr = (Math.pow(finalValue / initialValue, 1 / holdingPeriod) - 1) * 100;
    return { absoluteReturn, cagr };
  };

  const sipResult = calculateSIP();
  const lumpsumResult = calculateLumpsum();
  const ciResult = calculateCI();
  const returnsResult = calculateReturns();

  // Generate chart data for SIP
  const sipChartData = Array.from({ length: sipYears + 1 }, (_, i) => {
    const months = i * 12;
    const monthlyRate = sipRate / 100 / 12;
    const invested = sipMonthly * months;
    const value = months > 0 ? sipMonthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate) : 0;
    return {
      year: i,
      invested,
      value: Math.round(value)
    };
  });

  // Generate chart data for lumpsum
  const lumpsumChartData = Array.from({ length: lumpsumYears + 1 }, (_, i) => ({
    year: i,
    invested: lumpsum,
    value: Math.round(lumpsum * Math.pow(1 + lumpsumRate / 100, i))
  }));

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString()}`;
  };

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
            Investment <span className="text-gradient-primary">Calculator</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Plan your financial future with our powerful calculators for SIP, Lumpsum, Compound Interest, and Returns
          </p>
        </motion.div>

        <Tabs defaultValue="sip" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="sip" className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4" />
              <span className="hidden sm:inline">SIP</span>
            </TabsTrigger>
            <TabsTrigger value="lumpsum" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Lumpsum</span>
            </TabsTrigger>
            <TabsTrigger value="compound" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Compound</span>
            </TabsTrigger>
            <TabsTrigger value="returns" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Returns</span>
            </TabsTrigger>
          </TabsList>

          {/* SIP Calculator */}
          <TabsContent value="sip">
            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PiggyBank className="w-5 h-5 text-primary" />
                      SIP Calculator
                    </CardTitle>
                    <CardDescription>Calculate returns on your Systematic Investment Plan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Monthly Investment</Label>
                          <span className="text-primary font-semibold">₹{sipMonthly.toLocaleString()}</span>
                        </div>
                        <Slider
                          value={[sipMonthly]}
                          onValueChange={(v) => setSipMonthly(v[0])}
                          min={500}
                          max={100000}
                          step={500}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Expected Return (% p.a.)</Label>
                          <span className="text-primary font-semibold">{sipRate}%</span>
                        </div>
                        <Slider
                          value={[sipRate]}
                          onValueChange={(v) => setSipRate(v[0])}
                          min={1}
                          max={30}
                          step={0.5}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Time Period (Years)</Label>
                          <span className="text-primary font-semibold">{sipYears} Years</span>
                        </div>
                        <Slider
                          value={[sipYears]}
                          onValueChange={(v) => setSipYears(v[0])}
                          min={1}
                          max={30}
                          step={1}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Invested</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(sipResult.totalInvested)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Est. Returns</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(sipResult.returns)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-lg font-bold text-accent">{formatCurrency(sipResult.futureValue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle>Growth Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={sipChartData}>
                        <defs>
                          <linearGradient id="invested" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="value" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 20%)" />
                        <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" label={{ value: 'Years', position: 'bottom' }} />
                        <YAxis stroke="hsl(215, 20%, 55%)" tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(222, 47%, 8%)',
                            border: '1px solid hsl(222, 47%, 16%)',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="invested" name="Invested" stroke="hsl(45, 93%, 58%)" fillOpacity={1} fill="url(#invested)" />
                        <Area type="monotone" dataKey="value" name="Total Value" stroke="hsl(158, 64%, 52%)" fillOpacity={1} fill="url(#value)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Lumpsum Calculator */}
          <TabsContent value="lumpsum">
            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-accent" />
                      Lumpsum Calculator
                    </CardTitle>
                    <CardDescription>Calculate returns on one-time investment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Investment Amount</Label>
                          <span className="text-accent font-semibold">₹{lumpsum.toLocaleString()}</span>
                        </div>
                        <Slider
                          value={[lumpsum]}
                          onValueChange={(v) => setLumpsum(v[0])}
                          min={10000}
                          max={10000000}
                          step={10000}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Expected Return (% p.a.)</Label>
                          <span className="text-accent font-semibold">{lumpsumRate}%</span>
                        </div>
                        <Slider
                          value={[lumpsumRate]}
                          onValueChange={(v) => setLumpsumRate(v[0])}
                          min={1}
                          max={30}
                          step={0.5}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Time Period (Years)</Label>
                          <span className="text-accent font-semibold">{lumpsumYears} Years</span>
                        </div>
                        <Slider
                          value={[lumpsumYears]}
                          onValueChange={(v) => setLumpsumYears(v[0])}
                          min={1}
                          max={30}
                          step={1}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Invested</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(lumpsum)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Est. Returns</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(lumpsumResult.returns)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-lg font-bold text-accent">{formatCurrency(lumpsumResult.futureValue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle>Growth Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={lumpsumChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 20%)" />
                        <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" />
                        <YAxis stroke="hsl(215, 20%, 55%)" tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(222, 47%, 8%)',
                            border: '1px solid hsl(222, 47%, 16%)',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend />
                        <Bar dataKey="invested" name="Principal" fill="hsl(45, 93%, 58%)" />
                        <Bar dataKey="value" name="Total Value" fill="hsl(158, 64%, 52%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Compound Interest Calculator */}
          <TabsContent value="compound">
            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Compound Interest Calculator
                    </CardTitle>
                    <CardDescription>See the power of compounding</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Principal Amount</Label>
                          <span className="text-primary font-semibold">₹{principal.toLocaleString()}</span>
                        </div>
                        <Slider
                          value={[principal]}
                          onValueChange={(v) => setPrincipal(v[0])}
                          min={1000}
                          max={10000000}
                          step={1000}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Annual Interest Rate (%)</Label>
                          <span className="text-primary font-semibold">{ciRate}%</span>
                        </div>
                        <Slider
                          value={[ciRate]}
                          onValueChange={(v) => setCiRate(v[0])}
                          min={1}
                          max={20}
                          step={0.25}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Time Period (Years)</Label>
                          <span className="text-primary font-semibold">{ciYears} Years</span>
                        </div>
                        <Slider
                          value={[ciYears]}
                          onValueChange={(v) => setCiYears(v[0])}
                          min={1}
                          max={30}
                          step={1}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Compounding Frequency</Label>
                          <span className="text-primary font-semibold">
                            {compoundFreq === 1 ? 'Yearly' : compoundFreq === 4 ? 'Quarterly' : 'Monthly'}
                          </span>
                        </div>
                        <Slider
                          value={[compoundFreq]}
                          onValueChange={(v) => setCompoundFreq(v[0])}
                          min={1}
                          max={12}
                          step={3}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Principal</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(principal)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Interest</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(ciResult.interest)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Maturity</p>
                        <p className="text-lg font-bold text-accent">{formatCurrency(ciResult.amount)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass-card h-full flex flex-col justify-center">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-8">
                      <div className="w-48 h-48 mx-auto rounded-full border-8 border-primary/30 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="text-3xl font-bold text-gradient-primary">{formatCurrency(ciResult.amount)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl bg-secondary/50 border border-border">
                          <IndianRupee className="w-8 h-8 text-accent mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Principal</p>
                          <p className="text-xl font-bold text-foreground">{formatCurrency(principal)}</p>
                        </div>
                        <div className="p-6 rounded-xl bg-primary/10 border border-primary/30">
                          <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Interest Earned</p>
                          <p className="text-xl font-bold text-primary">{formatCurrency(ciResult.interest)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Returns Calculator */}
          <TabsContent value="returns">
            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-accent" />
                      Returns Calculator
                    </CardTitle>
                    <CardDescription>Calculate CAGR and absolute returns</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div>
                        <Label>Initial Investment Value</Label>
                        <Input
                          type="number"
                          value={initialValue}
                          onChange={(e) => setInitialValue(Number(e.target.value))}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Final Investment Value</Label>
                        <Input
                          type="number"
                          value={finalValue}
                          onChange={(e) => setFinalValue(Number(e.target.value))}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Holding Period (Years)</Label>
                          <span className="text-accent font-semibold">{holdingPeriod} Years</span>
                        </div>
                        <Slider
                          value={[holdingPeriod]}
                          onValueChange={(v) => setHoldingPeriod(v[0])}
                          min={1}
                          max={30}
                          step={1}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div className="text-center p-4 rounded-xl bg-secondary/50">
                        <Target className="w-8 h-8 text-accent mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Absolute Return</p>
                        <p className={`text-2xl font-bold ${returnsResult.absoluteReturn >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {returnsResult.absoluteReturn >= 0 ? '+' : ''}{returnsResult.absoluteReturn.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/30">
                        <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">CAGR</p>
                        <p className={`text-2xl font-bold ${returnsResult.cagr >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {returnsResult.cagr >= 0 ? '+' : ''}{returnsResult.cagr.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle>Understanding Returns</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                        <h4 className="font-semibold text-foreground mb-2">Absolute Return</h4>
                        <p className="text-sm text-muted-foreground">
                          The total percentage return on your investment over the entire holding period, 
                          regardless of the time taken. Calculated as: ((Final Value - Initial Value) / Initial Value) × 100
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                        <h4 className="font-semibold text-foreground mb-2">CAGR (Compound Annual Growth Rate)</h4>
                        <p className="text-sm text-muted-foreground">
                          The mean annual growth rate of an investment over a specified time period. 
                          It represents the rate at which an investment would have grown if it had grown at a steady rate every year.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                        <h4 className="font-semibold text-foreground mb-2">Why CAGR Matters</h4>
                        <p className="text-sm text-muted-foreground">
                          CAGR helps compare the performance of different investments with different time periods 
                          by standardizing the return to an annual basis.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dynamic IPO Recommendations based on calculator inputs */}
        {ipos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  Recommended IPOs Based on Your Inputs
                </CardTitle>
                <CardDescription>
                  IPOs matched to your investment capacity of {formatCurrency(sipResult.totalInvested)} (SIP) or {formatCurrency(lumpsum)} (Lumpsum)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const budget = Math.max(sipMonthly * 3, lumpsum * 0.1); // 3 months SIP or 10% lumpsum
                  const targetReturn = Math.max(sipRate, lumpsumRate);

                  const recommendations = ipos
                    .map(ipo => {
                      const lotCost = ipo.price_band_high * ipo.lot_size;
                      const affordableLots = Math.floor(budget / lotCost) || 0;
                      const budgetFit = affordableLots > 0 ? 30 : Math.max(0, 15 - (lotCost - budget) / lotCost * 15);
                      const subScore = Math.min((ipo.subscription_rate || 0) * 8, 35);
                      const sizeScore = ipo.issue_size ? Math.min(ipo.issue_size / 500, 15) : 5;
                      const returnFit = targetReturn > 15 ? (ipo.subscription_rate || 0) > 2 ? 20 : 10 : 15;
                      const totalScore = budgetFit + subScore + sizeScore + returnFit;

                      return {
                        ...ipo,
                        lotCost,
                        affordableLots,
                        score: Math.min(totalScore, 100),
                        tag: totalScore > 65 ? 'Best Match' : totalScore > 45 ? 'Good Fit' : 'Consider',
                        tagColor: totalScore > 65 ? 'text-primary bg-primary/20' : totalScore > 45 ? 'text-accent bg-accent/20' : 'text-muted-foreground bg-secondary',
                      };
                    })
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5);

                  return (
                    <div className="space-y-4">
                      {recommendations.map((ipo, index) => (
                        <div
                          key={ipo.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors gap-3"
                          onClick={() => navigate(`/ipo/${ipo.id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${index < 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                              #{index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{ipo.company_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {ipo.sector} • ₹{ipo.price_band_low}-{ipo.price_band_high} • Lot: {ipo.lot_size}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Min investment: {formatCurrency(ipo.lotCost)} • {ipo.affordableLots > 0 ? `You can apply for ${ipo.affordableLots} lot(s)` : 'Stretch budget needed'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-14 sm:ml-0">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Match</p>
                              <p className="font-bold text-primary">{ipo.score.toFixed(0)}%</p>
                            </div>
                            <Progress value={ipo.score} className="w-16 h-2" />
                            <Badge className={`${ipo.tagColor} border-0 whitespace-nowrap`}>
                              {ipo.tag}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        * Recommendations adapt based on your SIP amount (₹{sipMonthly.toLocaleString()}/mo), lumpsum (₹{lumpsum.toLocaleString()}), and expected return ({targetReturn}%)
                      </p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InvestmentCalculator;
