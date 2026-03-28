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
  const [ipos, setIpos] = useState<IPOListing[]>([]);

  useEffect(() => {
    const fetchIpos = async () => {
      const { data } = await supabase
        .from('ipo_listings')
        .select('*')
        .order('subscription_rate', { ascending: false });
      setIpos(data || []);
    };
    fetchIpos();
  }, []);
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
      </div>
    </div>
  );
};

export default InvestmentCalculator;
