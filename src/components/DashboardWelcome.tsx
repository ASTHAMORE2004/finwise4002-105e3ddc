import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  ShieldCheck,
  ShieldAlert,
  Eye,
  FileText,
  Sparkles,
  ArrowRight,
  Sunrise,
  Sun,
  Moon,
  TrendingUp,
} from "lucide-react";

interface Summary {
  fullName: string;
  goalsCount: number;
  goalsProgressPct: number;
  topGoal: { name: string; pct: number; deadline: string | null } | null;
  kycStatus: "verified" | "pending" | "rejected" | "missing";
  watchlistCount: number;
  ipoApplicationsCount: number;
  pendingIpoCount: number;
  hasInvestments: boolean;
}

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", icon: Sunrise };
  if (h < 18) return { text: "Good afternoon", icon: Sun };
  return { text: "Good evening", icon: Moon };
};

const DashboardWelcome = ({ hasInvestments }: { hasInvestments: boolean }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const load = async () => {
      const [profileRes, goalsRes, kycRes, watchlistRes, ipoRes] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
        supabase.from("financial_goals").select("name,target_amount,current_amount,deadline,status").eq("user_id", user.id).eq("status", "active"),
        supabase.from("kyc_documents").select("status").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("user_watchlist").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("ipo_applications").select("status", { count: "exact" }).eq("user_id", user.id),
      ]);

      const goals = goalsRes.data || [];
      const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount || 0), 0);
      const totalCurrent = goals.reduce((s, g) => s + Number(g.current_amount || 0), 0);
      const goalsProgressPct = totalTarget > 0 ? Math.min(100, (totalCurrent / totalTarget) * 100) : 0;

      const topGoal = goals
        .map(g => ({
          name: g.name,
          pct: g.target_amount ? (Number(g.current_amount) / Number(g.target_amount)) * 100 : 0,
          deadline: g.deadline,
        }))
        .sort((a, b) => b.pct - a.pct)[0] || null;

      const kycRaw = kycRes.data?.status as string | undefined;
      const kycStatus: Summary["kycStatus"] =
        kycRaw === "approved" || kycRaw === "verified" ? "verified"
        : kycRaw === "rejected" ? "rejected"
        : kycRaw ? "pending" : "missing";

      const ipoApps = ipoRes.data || [];
      const pendingIpoCount = ipoApps.filter(a => ["pending", "pending_payment"].includes(a.status || "")).length;

      if (!mounted) return;
      setSummary({
        fullName: profileRes.data?.full_name || user.email?.split("@")[0] || "Investor",
        goalsCount: goals.length,
        goalsProgressPct,
        topGoal,
        kycStatus,
        watchlistCount: watchlistRes.count || 0,
        ipoApplicationsCount: ipoApps.length,
        pendingIpoCount,
        hasInvestments,
      });
    };

    load();
    return () => { mounted = false; };
  }, [user, hasInvestments]);

  if (!summary) return null;

  const { text: greetText, icon: GreetIcon } = greeting();
  const firstName = summary.fullName.split(" ")[0];

  // Build smart suggestions based on user state
  const suggestions: { label: string; href: string; tone: "primary" | "accent" | "warning" }[] = [];
  if (summary.kycStatus === "missing") suggestions.push({ label: "Complete KYC to unlock investing", href: "/kyc", tone: "warning" });
  else if (summary.kycStatus === "rejected") suggestions.push({ label: "Re-submit your KYC documents", href: "/kyc", tone: "warning" });
  if (summary.goalsCount === 0) suggestions.push({ label: "Set your first financial goal", href: "/goals", tone: "primary" });
  if (!summary.hasInvestments) suggestions.push({ label: "Add your first investment", href: "/portfolio", tone: "primary" });
  if (summary.watchlistCount === 0) suggestions.push({ label: "Build a watchlist of IPOs to track", href: "/ipo", tone: "accent" });
  if (summary.pendingIpoCount > 0) suggestions.push({ label: `You have ${summary.pendingIpoCount} pending IPO application(s)`, href: "/portfolio", tone: "warning" });
  if (suggestions.length === 0) suggestions.push({ label: "Explore AI-powered analytics", href: "/ai-hub", tone: "primary" });

  const kycBadge = {
    verified: { label: "KYC Verified", icon: ShieldCheck, cls: "bg-primary/10 text-primary border-primary/30" },
    pending: { label: "KYC Pending", icon: ShieldAlert, cls: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
    rejected: { label: "KYC Rejected", icon: ShieldAlert, cls: "bg-destructive/10 text-destructive border-destructive/30" },
    missing: { label: "KYC Required", icon: ShieldAlert, cls: "bg-muted text-muted-foreground border-border" },
  }[summary.kycStatus];

  const KycIcon = kycBadge.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="glass-card border-primary/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <CardContent className="p-6 relative">
          {/* Greeting row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <GreetIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
                  {greetText}, <span className="text-gradient-primary">{firstName}</span> 👋
                </h2>
                <p className="text-sm text-muted-foreground">
                  Here's a snapshot of your financial journey today.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={kycBadge.cls}>
                <KycIcon className="w-3 h-3 mr-1" />
                {kycBadge.label}
              </Badge>
            </div>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <button
              onClick={() => navigate("/goals")}
              className="text-left p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors border border-border/50"
            >
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Target className="w-3 h-3" /> Active Goals
              </div>
              <div className="text-xl font-bold text-foreground">{summary.goalsCount}</div>
              {summary.goalsCount > 0 && (
                <div className="mt-2">
                  <Progress value={summary.goalsProgressPct} className="h-1" />
                  <div className="text-[10px] text-muted-foreground mt-1">{summary.goalsProgressPct.toFixed(0)}% of total target</div>
                </div>
              )}
            </button>

            <button
              onClick={() => navigate("/watchlist")}
              className="text-left p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors border border-border/50"
            >
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Eye className="w-3 h-3" /> Watchlist
              </div>
              <div className="text-xl font-bold text-foreground">{summary.watchlistCount}</div>
              <div className="text-[10px] text-muted-foreground mt-1">items tracked</div>
            </button>

            <button
              onClick={() => navigate("/ipo")}
              className="text-left p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors border border-border/50"
            >
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <FileText className="w-3 h-3" /> IPO Applications
              </div>
              <div className="text-xl font-bold text-foreground">{summary.ipoApplicationsCount}</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {summary.pendingIpoCount > 0 ? `${summary.pendingIpoCount} pending` : "all settled"}
              </div>
            </button>

            <button
              onClick={() => navigate("/analytics")}
              className="text-left p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors border border-border/50"
            >
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingUp className="w-3 h-3" /> Market
              </div>
              <div className="text-xl font-bold text-foreground">IBEX</div>
              <div className="text-[10px] text-muted-foreground mt-1">view live trends</div>
            </button>
          </div>

          {/* Top goal highlight */}
          {summary.topGoal && (
            <div className="mb-5 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{summary.topGoal.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {summary.topGoal.deadline ? `by ${new Date(summary.topGoal.deadline).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : "no deadline"}
                </span>
              </div>
              <Progress value={Math.min(100, summary.topGoal.pct)} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">{summary.topGoal.pct.toFixed(1)}% complete</div>
            </div>
          )}

          {/* Smart suggestions */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Suggested next steps</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((s) => (
                <Button
                  key={s.label}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(s.href)}
                  className={`gap-1 ${
                    s.tone === "warning" ? "border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                    : s.tone === "accent" ? "border-accent/40 hover:bg-accent/10"
                    : "border-primary/40 hover:bg-primary/10"
                  }`}
                >
                  {s.label}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardWelcome;
