import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Save, Mail, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface Prefs {
  price_alerts: boolean;
  lesson_reminders: boolean;
  investment_updates: boolean;
  goal_reminders: boolean;
  feedback_responses: boolean;
  marketing_emails: boolean;
  delivery_channel: string;
  reminder_frequency: string;
}

const DEFAULTS: Prefs = {
  price_alerts: true,
  lesson_reminders: true,
  investment_updates: true,
  goal_reminders: true,
  feedback_responses: true,
  marketing_emails: false,
  delivery_channel: "in_app",
  reminder_frequency: "weekly",
};

const TOGGLES: { key: keyof Prefs; label: string; desc: string }[] = [
  { key: "price_alerts", label: "Price Alerts", desc: "Notify me when watchlist items hit my target price" },
  { key: "investment_updates", label: "Investment Updates", desc: "Portfolio performance, IPO subscription updates, dividends" },
  { key: "lesson_reminders", label: "Lesson Reminders", desc: "Continue your learning streak — daily/weekly nudges" },
  { key: "goal_reminders", label: "Goal Reminders", desc: "Stay on track with your financial goals" },
  { key: "feedback_responses", label: "Feedback Responses", desc: "Get notified when our team replies to your feedback" },
  { key: "marketing_emails", label: "Marketing Emails", desc: "Product news, promotions, and offers" },
];

const NotificationSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("notification_preferences").select("*").eq("user_id", user!.id).maybeSingle();
    if (data) setPrefs({
      price_alerts: data.price_alerts,
      lesson_reminders: data.lesson_reminders,
      investment_updates: data.investment_updates,
      goal_reminders: data.goal_reminders,
      feedback_responses: data.feedback_responses,
      marketing_emails: data.marketing_emails,
      delivery_channel: data.delivery_channel,
      reminder_frequency: data.reminder_frequency,
    });
    setLoading(false);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { data: existing } = await supabase.from("notification_preferences").select("id").eq("user_id", user.id).maybeSingle();
    const payload = { ...prefs, user_id: user.id };
    const { error } = existing
      ? await supabase.from("notification_preferences").update(payload).eq("user_id", user.id)
      : await supabase.from("notification_preferences").insert(payload);
    setSaving(false);
    if (error) toast.error("Failed to save");
    else toast.success("Preferences saved!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold">Notification Preferences</h1>
          </div>
          <p className="text-muted-foreground">Control what alerts you receive and how</p>
        </motion.div>

        <Card className="mb-6">
          <CardHeader><CardTitle>Delivery Channel</CardTitle><CardDescription>How would you like to receive notifications?</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Channel</Label>
              <Select value={prefs.delivery_channel} onValueChange={v => setPrefs({ ...prefs, delivery_channel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_app"><Monitor className="w-4 h-4 inline mr-2" />In-App Only</SelectItem>
                  <SelectItem value="email"><Mail className="w-4 h-4 inline mr-2" />Email</SelectItem>
                  <SelectItem value="both"><Smartphone className="w-4 h-4 inline mr-2" />In-App + Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reminder Frequency</Label>
              <Select value={prefs.reminder_frequency} onValueChange={v => setPrefs({ ...prefs, reminder_frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Notification Types</CardTitle><CardDescription>Choose which notifications to receive</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {TOGGLES.map(t => (
              <div key={t.key} className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
                <div className="flex-1">
                  <Label className="text-base font-medium">{t.label}</Label>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
                <Switch checked={prefs[t.key] as boolean} onCheckedChange={v => setPrefs({ ...prefs, [t.key]: v })} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Button onClick={save} disabled={saving} size="lg" className="w-full gap-2">
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Preferences"}
        </Button>
      </div>
      <Footer />
    </div>
  );
};

export default NotificationSettings;
