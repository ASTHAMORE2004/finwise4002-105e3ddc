import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain, TrendingUp, Shield, Search, Wallet, BarChart3, ArrowLeft,
  Sparkles, Target, AlertTriangle, CheckCircle2, XCircle, Loader2,
  ChevronRight, Zap, Eye, PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/landing/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Risk Quiz Questions ───
const RISK_QUESTIONS = [
  { id: "age", question: "What is your age group?", options: ["18-22", "23-27", "28-35", "35+"] },
  { id: "income", question: "Monthly income range?", options: ["< ₹15,000", "₹15,000-30,000", "₹30,000-60,000", "₹60,000+"] },
  { id: "goal", question: "Primary investment goal?", options: ["Emergency Fund", "Wealth Building", "Retirement", "Short-term Gains"] },
  { id: "loss_tolerance", question: "If your investment drops 20%, you would?", options: ["Sell everything", "Sell some", "Hold steady", "Buy more"] },
  { id: "horizon", question: "Investment time horizon?", options: ["< 1 year", "1-3 years", "3-7 years", "7+ years"] },
  { id: "experience", question: "Investment experience?", options: ["None", "Beginner (< 1 year)", "Intermediate (1-3 years)", "Advanced (3+ years)"] },
];

const AIHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sentiment");

  // ─── Sentiment State ───
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [sentimentResult, setSentimentResult] = useState<any>(null);
  const [sentimentStartup, setSentimentStartup] = useState({ startup_name: "", sector: "", description: "", funding_goal: "", valuation: "" });

  // ─── Risk Profiler State ───
  const [riskStep, setRiskStep] = useState(0);
  const [riskAnswers, setRiskAnswers] = useState<Record<string, string>>({});
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskResult, setRiskResult] = useState<any>(null);

  // ─── Expense Categorizer State ───
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseResult, setExpenseResult] = useState<any>(null);
  const [expenseInput, setExpenseInput] = useState("");

  // ─── Portfolio Rebalancer State ───
  const [rebalanceLoading, setRebalanceLoading] = useState(false);
  const [rebalanceResult, setRebalanceResult] = useState<any>(null);

  // ─── Fraud Detection State ───
  const [fraudLoading, setFraudLoading] = useState(false);
  const [fraudResult, setFraudResult] = useState<any>(null);

  // ─── Smart Search State ───
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  // ─── Sentiment Analysis ───
  const runSentiment = async () => {
    if (!sentimentStartup.startup_name) { toast.error("Enter a startup name"); return; }
    setSentimentLoading(true);
    setSentimentResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-sentiment-analysis", { body: { startup: sentimentStartup } });
      if (error) throw error;
      setSentimentResult(data.analysis);
    } catch (e: any) { toast.error(e.message || "Analysis failed"); }
    setSentimentLoading(false);
  };

  // ─── Risk Profiler ───
  const submitRiskProfile = async () => {
    setRiskLoading(true);
    setRiskResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-risk-profiler", { body: { answers: riskAnswers } });
      if (error) throw error;
      setRiskResult(data.profile);
    } catch (e: any) { toast.error(e.message || "Risk assessment failed"); }
    setRiskLoading(false);
  };

  // ─── Expense Categorizer ───
  const categorizeExpenses = async () => {
    const transactions = expenseInput.split("\n").filter(l => l.trim()).map(line => {
      const parts = line.split(",").map(s => s.trim());
      return { name: parts[0] || line, amount: parseFloat(parts[1]) || 0 };
    });
    if (transactions.length === 0) { toast.error("Enter at least one transaction"); return; }
    setExpenseLoading(true);
    setExpenseResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-expense-categorizer", { body: { transactions, mode: "analyze" } });
      if (error) throw error;
      setExpenseResult(data.result);
    } catch (e: any) { toast.error(e.message || "Categorization failed"); }
    setExpenseLoading(false);
  };

  // ─── Portfolio Rebalancer ───
  const runRebalancer = async () => {
    setRebalanceLoading(true);
    setRebalanceResult(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in first"); setRebalanceLoading(false); return; }
      const { data: portfolio } = await supabase.from("user_portfolio").select("*").eq("user_id", user.id);
      if (!portfolio?.length) { toast.error("No portfolio data found"); setRebalanceLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("ai-portfolio-rebalancer", { body: { portfolio } });
      if (error) throw error;
      setRebalanceResult(data.rebalancing);
    } catch (e: any) { toast.error(e.message || "Rebalancing failed"); }
    setRebalanceLoading(false);
  };

  // ─── Fraud Detection ───
  const runFraudDetection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFraudLoading(true);
    setFraudResult(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const { data, error } = await supabase.functions.invoke("ai-fraud-detection", {
          body: { fileBase64: base64, mimeType: file.type, documentType: "identity" },
        });
        if (error) throw error;
        setFraudResult(data.analysis);
        setFraudLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      toast.error(e.message || "Fraud detection failed");
      setFraudLoading(false);
    }
  };

  // ─── Smart Search ───
  const runSearch = async () => {
    if (!searchQuery.trim()) { toast.error("Enter a search query"); return; }
    setSearchLoading(true);
    setSearchResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-smart-search", { body: { query: searchQuery } });
      if (error) throw error;
      setSearchResult(data.searchResults);
    } catch (e: any) { toast.error(e.message || "Search failed"); }
    setSearchLoading(false);
  };

  const sentimentColor = (s: string) => s === "Bullish" ? "text-emerald-400" : s === "Bearish" ? "text-red-400" : "text-yellow-400";
  const riskColor = (s: number) => s < 30 ? "bg-emerald-500" : s < 60 ? "bg-yellow-500" : s < 80 ? "bg-orange-500" : "bg-red-500";

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">AI Intelligence Hub</h1>
            </div>
            <p className="text-muted-foreground text-lg">12 AI-powered tools using NLP, Computer Vision, and Predictive Analytics</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {["Gemini 2.5 Flash", "Gemini 2.5 Pro Vision", "Gemini 3 Flash", "Gemini Flash Lite", "NLP", "Sentiment Analysis", "Computer Vision", "OCR", "Anomaly Detection", "Semantic Search"].map(t => (
                <Badge key={t} variant="outline" className="text-xs border-primary/30 text-primary">{t}</Badge>
              ))}
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-1 h-auto bg-muted/50 p-1">
              <TabsTrigger value="sentiment" className="text-xs gap-1"><TrendingUp className="w-3 h-3" />Sentiment</TabsTrigger>
              <TabsTrigger value="risk" className="text-xs gap-1"><Target className="w-3 h-3" />Risk Profile</TabsTrigger>
              <TabsTrigger value="expense" className="text-xs gap-1"><Wallet className="w-3 h-3" />Expenses</TabsTrigger>
              <TabsTrigger value="rebalance" className="text-xs gap-1"><PieChart className="w-3 h-3" />Rebalancer</TabsTrigger>
              <TabsTrigger value="fraud" className="text-xs gap-1"><Shield className="w-3 h-3" />Fraud Detect</TabsTrigger>
              <TabsTrigger value="search" className="text-xs gap-1"><Search className="w-3 h-3" />Smart Search</TabsTrigger>
            </TabsList>

            {/* ─── SENTIMENT ANALYSIS ─── */}
            <TabsContent value="sentiment">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> AI Sentiment Analysis</CardTitle>
                  <p className="text-sm text-muted-foreground">NLP-powered sentiment scoring with confidence levels and multi-factor analysis</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Startup Name" value={sentimentStartup.startup_name} onChange={e => setSentimentStartup(p => ({ ...p, startup_name: e.target.value }))} />
                    <Input placeholder="Sector (e.g. Fintech)" value={sentimentStartup.sector} onChange={e => setSentimentStartup(p => ({ ...p, sector: e.target.value }))} />
                    <Input placeholder="Funding Goal (₹)" value={sentimentStartup.funding_goal} onChange={e => setSentimentStartup(p => ({ ...p, funding_goal: e.target.value }))} />
                    <Input placeholder="Valuation (₹)" value={sentimentStartup.valuation} onChange={e => setSentimentStartup(p => ({ ...p, valuation: e.target.value }))} />
                  </div>
                  <Input placeholder="Brief description..." value={sentimentStartup.description} onChange={e => setSentimentStartup(p => ({ ...p, description: e.target.value }))} />
                  <Button onClick={runSentiment} disabled={sentimentLoading} className="w-full">
                    {sentimentLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing Sentiment...</> : <><Sparkles className="w-4 h-4 mr-2" />Run Sentiment Analysis</>}
                  </Button>
                  {sentimentResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-sm text-muted-foreground">Overall Sentiment</p>
                          <p className={`text-2xl font-bold ${sentimentColor(sentimentResult.overall_sentiment)}`}>{sentimentResult.overall_sentiment}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Confidence</p>
                          <p className="text-2xl font-bold text-foreground">{sentimentResult.confidence}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Risk Level</p>
                          <Badge variant={sentimentResult.risk_level === "Low" ? "default" : "destructive"}>{sentimentResult.risk_level}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{sentimentResult.summary}</p>
                      {sentimentResult.factors?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Analysis Factors:</p>
                          {sentimentResult.factors.map((f: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                              <span className="flex items-center gap-2">
                                {f.sentiment === "positive" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : f.sentiment === "negative" ? <XCircle className="w-4 h-4 text-red-400" /> : <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                                {f.factor}
                              </span>
                              <span className="text-muted-foreground">Weight: {f.weight}/10</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {sentimentResult.recommendation && <p className="text-sm p-3 rounded bg-primary/10 text-primary">💡 {sentimentResult.recommendation}</p>}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── RISK PROFILER ─── */}
            <TabsContent value="risk">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> AI Risk Profiler</CardTitle>
                  <p className="text-sm text-muted-foreground">Personalized investment risk assessment with AI-generated strategy recommendations</p>
                </CardHeader>
                <CardContent>
                  {!riskResult ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Progress value={(riskStep / RISK_QUESTIONS.length) * 100} className="flex-1" />
                        <span className="text-sm text-muted-foreground">{riskStep}/{RISK_QUESTIONS.length}</span>
                      </div>
                      {riskStep < RISK_QUESTIONS.length ? (
                        <motion.div key={riskStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                          <p className="text-lg font-medium mb-4">{RISK_QUESTIONS[riskStep].question}</p>
                          <RadioGroup value={riskAnswers[RISK_QUESTIONS[riskStep].id] || ""} onValueChange={v => {
                            setRiskAnswers(p => ({ ...p, [RISK_QUESTIONS[riskStep].id]: v }));
                            setTimeout(() => setRiskStep(s => s + 1), 300);
                          }}>
                            {RISK_QUESTIONS[riskStep].options.map(o => (
                              <div key={o} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                <RadioGroupItem value={o} id={o} />
                                <Label htmlFor={o} className="cursor-pointer flex-1">{o}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                          {riskStep > 0 && <Button variant="ghost" onClick={() => setRiskStep(s => s - 1)} className="mt-4">← Back</Button>}
                        </motion.div>
                      ) : (
                        <div className="text-center space-y-4">
                          <p className="text-lg">Quiz complete! Ready for AI analysis.</p>
                          <Button onClick={submitRiskProfile} disabled={riskLoading} size="lg">
                            {riskLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing...</> : <><Brain className="w-4 h-4 mr-2" />Generate Risk Profile</>}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="text-center p-6 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Your Risk Score</p>
                        <p className="text-5xl font-bold text-foreground mt-2">{riskResult.risk_score}<span className="text-lg text-muted-foreground">/100</span></p>
                        <Badge className="mt-2" variant={riskResult.risk_category === "Conservative" ? "secondary" : "default"}>{riskResult.risk_category}</Badge>
                        <div className="w-full mt-4"><Progress value={riskResult.risk_score} className={`h-3 ${riskColor(riskResult.risk_score)}`} /></div>
                      </div>
                      <p className="text-sm text-muted-foreground">{riskResult.summary}</p>
                      {riskResult.ideal_allocation && (
                        <div className="grid grid-cols-4 gap-3">
                          {Object.entries(riskResult.ideal_allocation).map(([k, v]) => (
                            <div key={k} className="text-center p-3 rounded-lg bg-muted/30">
                              <p className="text-2xl font-bold text-primary">{String(v)}%</p>
                              <p className="text-xs text-muted-foreground capitalize">{k}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {riskResult.advice?.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-sm">Personalized Tips:</p>
                          {riskResult.advice.map((a: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-2 text-sm rounded bg-muted/30">
                              <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              <span>{a}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button variant="outline" onClick={() => { setRiskResult(null); setRiskStep(0); setRiskAnswers({}); }}>Retake Quiz</Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── EXPENSE CATEGORIZER ─── */}
            <TabsContent value="expense">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> AI Expense Categorizer</CardTitle>
                  <p className="text-sm text-muted-foreground">NLP-based auto-categorization with spending pattern analysis and savings forecasts</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Enter transactions (one per line: name, amount)</Label>
                    <textarea
                      className="w-full mt-2 p-3 rounded-lg bg-muted/50 border border-border text-sm min-h-[120px] text-foreground placeholder:text-muted-foreground"
                      placeholder={"Swiggy Order, -450\nMetro Recharge, -500\nSalary Credit, 45000\nNetflix, -199\nAmazon, -1200"}
                      value={expenseInput}
                      onChange={e => setExpenseInput(e.target.value)}
                    />
                  </div>
                  <Button onClick={categorizeExpenses} disabled={expenseLoading} className="w-full">
                    {expenseLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing Spending...</> : <><BarChart3 className="w-4 h-4 mr-2" />Analyze & Categorize</>}
                  </Button>
                  {expenseResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-4">
                      {expenseResult.spending_score !== undefined && (
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                          <div>
                            <p className="text-sm text-muted-foreground">Spending Score</p>
                            <p className="text-2xl font-bold">{expenseResult.spending_score}/100</p>
                          </div>
                          {expenseResult.monthly_forecast && (
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Forecast</p>
                              <p className="text-2xl font-bold">₹{expenseResult.monthly_forecast?.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {expenseResult.insights?.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-sm">Insights:</p>
                          {expenseResult.insights.map((i: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 p-2 text-sm rounded bg-primary/10">
                              <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" /><span>{i}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {expenseResult.top_savings_opportunities?.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-sm">Savings Opportunities:</p>
                          {expenseResult.top_savings_opportunities.map((o: any, idx: number) => (
                            <div key={idx} className="p-3 rounded bg-emerald-500/10 text-sm">
                              <p className="font-medium text-emerald-400">{o.category} — Save ₹{o.potential_saving}</p>
                              <p className="text-muted-foreground mt-1">{o.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── PORTFOLIO REBALANCER ─── */}
            <TabsContent value="rebalance">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><PieChart className="w-5 h-5 text-primary" /> AI Portfolio Rebalancer</CardTitle>
                  <p className="text-sm text-muted-foreground">Analyzes current portfolio allocation and suggests optimal rebalancing with tax implications</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={runRebalancer} disabled={rebalanceLoading} className="w-full" size="lg">
                    {rebalanceLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing Portfolio...</> : <><Brain className="w-4 h-4 mr-2" />Analyze My Portfolio</>}
                  </Button>
                  {rebalanceResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">Health Score</p>
                          <p className="text-3xl font-bold text-primary">{rebalanceResult.health_score}/100</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">Diversification</p>
                          <p className="text-3xl font-bold text-primary">{rebalanceResult.diversification_score}/100</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{rebalanceResult.summary}</p>
                      {rebalanceResult.rebalancing_actions?.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-sm">Recommended Actions:</p>
                          {rebalanceResult.rebalancing_actions.map((a: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded bg-muted/30 text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant={a.action === "buy" ? "default" : a.action === "sell" ? "destructive" : "secondary"} className="uppercase text-xs">{a.action}</Badge>
                                <span className="font-medium">{a.asset}</span>
                              </div>
                              <span className="text-muted-foreground">{a.current_weight}% → {a.target_weight}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {rebalanceResult.tax_implications?.length > 0 && (
                        <div className="p-3 rounded bg-yellow-500/10">
                          <p className="font-medium text-sm text-yellow-400 mb-2">⚠️ Tax Implications:</p>
                          {rebalanceResult.tax_implications.map((t: string, i: number) => (
                            <p key={i} className="text-sm text-muted-foreground">• {t}</p>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── FRAUD DETECTION ─── */}
            <TabsContent value="fraud">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> AI Fraud Detection</CardTitle>
                  <p className="text-sm text-muted-foreground">Computer Vision-based anomaly detection for KYC documents — detects tampering and forgery</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Upload a KYC document (Aadhaar, PAN, etc.) for fraud analysis</p>
                    <label className="cursor-pointer">
                      <Button asChild disabled={fraudLoading}>
                        <span>{fraudLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing Document...</> : <><Shield className="w-4 h-4 mr-2" />Upload & Scan</>}</span>
                      </Button>
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={runFraudDetection} />
                    </label>
                  </div>
                  {fraudResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className={`p-4 rounded-lg ${fraudResult.is_suspicious ? "bg-red-500/10 border border-red-500/30" : "bg-emerald-500/10 border border-emerald-500/30"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {fraudResult.is_suspicious ? <AlertTriangle className="w-6 h-6 text-red-400" /> : <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                            <span className="font-bold text-lg">{fraudResult.is_suspicious ? "Suspicious Document" : "Document Appears Legitimate"}</span>
                          </div>
                          <Badge variant={fraudResult.fraud_score > 50 ? "destructive" : "default"}>Score: {fraudResult.fraud_score}/100</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded bg-muted/30 text-center">
                          <p className="text-sm text-muted-foreground">Quality</p>
                          <p className="font-bold">{fraudResult.document_quality}</p>
                        </div>
                        <div className="p-3 rounded bg-muted/30 text-center">
                          <p className="text-sm text-muted-foreground">Confidence</p>
                          <p className="font-bold">{fraudResult.confidence}%</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{fraudResult.summary}</p>
                      {fraudResult.anomalies?.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-sm">Detected Anomalies:</p>
                          {fraudResult.anomalies.map((a: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                              <span>{a.description}</span>
                              <Badge variant={a.severity === "critical" ? "destructive" : "secondary"}>{a.severity}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                      {fraudResult.verification_checks?.length > 0 && (
                        <div className="space-y-1">
                          <p className="font-medium text-sm">Verification Checks:</p>
                          {fraudResult.verification_checks.map((c: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              {c.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                              <span>{c.check}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── SMART SEARCH ─── */}
            <TabsContent value="search">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Search className="w-5 h-5 text-primary" /> AI Smart Search</CardTitle>
                  <p className="text-sm text-muted-foreground">Semantic search with NLU — understands intent like "cheap fintech startups under 50 lakhs"</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Try: 'beginner investing courses' or 'fintech startups raising under 50 lakhs'"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && runSearch()}
                      className="flex-1"
                    />
                    <Button onClick={runSearch} disabled={searchLoading}>
                      {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  {searchResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <p className="text-sm text-muted-foreground">Understood as: <em>"{searchResult.query_interpretation}"</em></p>
                      {searchResult.did_you_mean && <p className="text-sm text-primary">Did you mean: "{searchResult.did_you_mean}"?</p>}
                      <p className="text-sm text-muted-foreground">{searchResult.total_matches} results found</p>
                      {searchResult.results?.map((r: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => {
                          if (r.type === "startup") navigate(`/startups`);
                          else if (r.type === "ipo") navigate(`/ipo`);
                          else if (r.type === "course") navigate(`/courses`);
                        }}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">{r.type}</Badge>
                              <span className="font-medium">{r.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{r.match_reason}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/20 text-primary">{r.relevance_score}%</Badge>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
};

export default AIHub;
