import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Star, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface Feedback {
  id: string;
  category: string;
  subject: string;
  message: string;
  rating: number | null;
  status: string;
  admin_response: string | null;
  created_at: string;
  responded_at: string | null;
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "bug", label: "🐛 Bug Report" },
  { value: "feature", label: "💡 Feature Request" },
  { value: "ui", label: "🎨 UI/UX" },
  { value: "performance", label: "⚡ Performance" },
  { value: "content", label: "📚 Content" },
  { value: "other", label: "💬 Other" },
];

const FeedbackPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: "general", subject: "", message: "", rating: 0 });

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("user_feedback").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Failed to load feedback");
    else setItems(data || []);
    setLoading(false);
  };

  const submit = async () => {
    if (!user) return;
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Subject and message are required"); return;
    }
    if (form.subject.length > 200 || form.message.length > 2000) {
      toast.error("Content too long"); return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("user_feedback").insert({
      user_id: user.id,
      category: form.category,
      subject: form.subject.trim(),
      message: form.message.trim(),
      rating: form.rating || null,
    });
    setSubmitting(false);
    if (error) toast.error("Failed to submit");
    else {
      toast.success("Feedback submitted! Thank you.");
      setForm({ category: "general", subject: "", message: "", rating: 0 });
      load();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold">Feedback</h1>
          </div>
          <p className="text-muted-foreground">Help us improve — share bugs, ideas, or general thoughts</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Submit Feedback</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject *</Label>
                <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} maxLength={200} placeholder="Short summary" />
              </div>
              <div>
                <Label>Message *</Label>
                <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} maxLength={2000} rows={6} placeholder="Describe in detail…" />
                <p className="text-xs text-muted-foreground mt-1">{form.message.length}/2000</p>
              </div>
              <div>
                <Label>Rate your experience</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setForm({ ...form, rating: n })} type="button">
                      <Star className={`w-6 h-6 ${n <= form.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={submit} disabled={submitting} className="w-full gap-2">
                <Send className="w-4 h-4" /> {submitting ? "Sending…" : "Submit Feedback"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Your Feedback History</CardTitle></CardHeader>
            <CardContent>
              {loading ? <p className="text-muted-foreground text-center py-8">Loading…</p>
              : items.length === 0 ? <p className="text-muted-foreground text-center py-8">No feedback submitted yet</p>
              : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {items.map(f => (
                    <div key={f.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-semibold text-sm">{f.subject}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{CATEGORIES.find(c => c.value === f.category)?.label}</Badge>
                            <Badge className={`text-xs ${f.status === "resolved" ? "bg-emerald-500" : f.status === "in_review" ? "bg-amber-500" : ""}`}>
                              {f.status === "resolved" ? <><CheckCircle className="w-3 h-3 mr-1" />Resolved</> : <><Clock className="w-3 h-3 mr-1" />{f.status}</>}
                            </Badge>
                          </div>
                        </div>
                        {f.rating && <div className="flex">{Array.from({ length: f.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</div>}
                      </div>
                      <p className="text-sm text-muted-foreground">{f.message}</p>
                      {f.admin_response && (
                        <div className="bg-primary/5 border-l-2 border-primary p-2 rounded text-sm">
                          <p className="font-medium text-xs text-primary mb-1">Team Response:</p>
                          {f.admin_response}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FeedbackPage;
