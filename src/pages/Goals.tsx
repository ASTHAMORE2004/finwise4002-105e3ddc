import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, Trash2, Edit, TrendingUp, Calendar, IndianRupee, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface Goal {
  id: string;
  name: string;
  description: string | null;
  category: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  status: string;
  created_at: string;
}

const CATEGORIES = [
  { value: "savings", label: "💰 Savings" },
  { value: "vacation", label: "✈️ Vacation" },
  { value: "education", label: "🎓 Education" },
  { value: "home", label: "🏠 Home" },
  { value: "vehicle", label: "🚗 Vehicle" },
  { value: "retirement", label: "🌴 Retirement" },
  { value: "emergency", label: "🛡️ Emergency Fund" },
  { value: "investment", label: "📈 Investment" },
  { value: "other", label: "🎯 Other" },
];

const Goals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "savings",
    target_amount: "",
    current_amount: "0",
    deadline: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadGoals();
  }, [user]);

  const loadGoals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("financial_goals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load goals");
    else setGoals(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: "", description: "", category: "savings", target_amount: "", current_amount: "0", deadline: "" });
    setEditing(null);
  };

  const openEdit = (g: Goal) => {
    setEditing(g);
    setForm({
      name: g.name,
      description: g.description || "",
      category: g.category,
      target_amount: String(g.target_amount),
      current_amount: String(g.current_amount),
      deadline: g.deadline || "",
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.name.trim() || !form.target_amount) {
      toast.error("Name and target amount are required");
      return;
    }
    const target = parseFloat(form.target_amount);
    const current = parseFloat(form.current_amount) || 0;
    if (target <= 0) { toast.error("Target must be positive"); return; }
    if (current < 0) { toast.error("Current amount cannot be negative"); return; }

    const payload = {
      user_id: user.id,
      name: form.name.trim().slice(0, 100),
      description: form.description.trim().slice(0, 500) || null,
      category: form.category,
      target_amount: target,
      current_amount: current,
      deadline: form.deadline || null,
      status: current >= target ? "completed" : "active",
    };

    if (editing) {
      const { error } = await supabase.from("financial_goals").update(payload).eq("id", editing.id);
      if (error) toast.error("Failed to update goal");
      else { toast.success("Goal updated!"); setOpen(false); resetForm(); loadGoals(); }
    } else {
      const { error } = await supabase.from("financial_goals").insert(payload);
      if (error) toast.error("Failed to create goal");
      else { toast.success("Goal created!"); setOpen(false); resetForm(); loadGoals(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    const { error } = await supabase.from("financial_goals").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Goal deleted"); loadGoals(); }
  };

  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const completedCount = goals.filter(g => g.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-7 h-7 text-primary" />
                <h1 className="text-3xl font-bold">Financial Goals</h1>
              </div>
              <p className="text-muted-foreground">Plan, track, and achieve your money milestones</p>
            </div>
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2"><Plus className="w-4 h-4" /> New Goal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Goal" : "Create Goal"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Goal Name *</Label>
                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Goa vacation 2026" maxLength={100} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Target Amount (₹) *</Label>
                      <Input type="number" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} min="1" />
                    </div>
                    <div>
                      <Label>Current Saved (₹)</Label>
                      <Input type="number" value={form.current_amount} onChange={e => setForm({ ...form, current_amount: e.target.value })} min="0" />
                    </div>
                  </div>
                  <div>
                    <Label>Deadline</Label>
                    <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={500} rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit}>{editing ? "Update" : "Create"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><IndianRupee className="w-8 h-8 text-primary" /><div><div className="text-2xl font-bold">₹{totalTarget.toLocaleString()}</div><div className="text-sm text-muted-foreground">Total Target</div></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingUp className="w-8 h-8 text-emerald-500" /><div><div className="text-2xl font-bold">₹{totalSaved.toLocaleString()}</div><div className="text-sm text-muted-foreground">Total Saved</div></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Trophy className="w-8 h-8 text-amber-500" /><div><div className="text-2xl font-bold">{completedCount}/{goals.length}</div><div className="text-sm text-muted-foreground">Completed</div></div></div></CardContent></Card>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        ) : goals.length === 0 ? (
          <Card><CardContent className="py-16 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">Create your first financial goal to start tracking progress</p>
            <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Create Goal</Button>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g, i) => {
              const pct = Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100);
              const cat = CATEGORIES.find(c => c.value === g.category);
              const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000) : null;
              return (
                <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{g.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">{cat?.label}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(g)}><Edit className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(g.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">₹{Number(g.current_amount).toLocaleString()} of ₹{Number(g.target_amount).toLocaleString()}</span>
                          <span className="font-semibold">{pct.toFixed(0)}%</span>
                        </div>
                        <Progress value={pct} />
                      </div>
                      {daysLeft !== null && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className={daysLeft < 0 ? "text-destructive" : daysLeft < 30 ? "text-amber-500" : "text-muted-foreground"}>
                            {daysLeft < 0 ? `Overdue by ${-daysLeft}d` : `${daysLeft} days left`}
                          </span>
                        </div>
                      )}
                      {g.status === "completed" && <Badge className="bg-emerald-500">🎉 Completed</Badge>}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Goals;
