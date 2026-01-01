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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Eye,
  Bell,
  BellOff,
  Trash2,
  TrendingUp,
  Building2,
  Rocket,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface WatchlistItem {
  id: string;
  item_type: string;
  item_id: string;
  price_alert_low: number | null;
  price_alert_high: number | null;
  alert_enabled: boolean;
  notes: string | null;
  created_at: string;
  item_details?: {
    name: string;
    sector: string | null;
    price?: number;
    status?: string;
  };
}

interface PriceAlert {
  id: string;
  item_type: string;
  item_name: string;
  alert_type: string;
  target_price: number;
  is_triggered: boolean;
  triggered_at: string | null;
  is_read: boolean;
}

const Watchlist = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [ipos, setIpos] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'ipo' | 'startup'>('ipo');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [alertLow, setAlertLow] = useState('');
  const [alertHigh, setAlertHigh] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      // Fetch watchlist
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('user_watchlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (watchlistError) throw watchlistError;

      // Fetch IPOs
      const { data: ipoData } = await supabase
        .from('ipo_listings')
        .select('id, company_name, sector, price_band_high, status');

      // Fetch Startups
      const { data: startupData } = await supabase
        .from('startup_registrations')
        .select('id, startup_name, sector, valuation, status')
        .in('status', ['approved', 'live']);

      // Fetch alerts
      const { data: alertsData } = await supabase
        .from('price_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      setIpos(ipoData || []);
      setStartups(startupData || []);
      setAlerts(alertsData || []);

      // Enrich watchlist with item details
      const enrichedWatchlist = (watchlistData || []).map(item => {
        let itemDetails;
        if (item.item_type === 'ipo') {
          const ipo = ipoData?.find(i => i.id === item.item_id);
          itemDetails = ipo ? {
            name: ipo.company_name,
            sector: ipo.sector,
            price: ipo.price_band_high,
            status: ipo.status
          } : undefined;
        } else {
          const startup = startupData?.find(s => s.id === item.item_id);
          itemDetails = startup ? {
            name: startup.startup_name,
            sector: startup.sector,
            price: startup.valuation,
            status: startup.status
          } : undefined;
        }
        return { ...item, item_details: itemDetails };
      });

      setWatchlist(enrichedWatchlist);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!selectedItemId) {
      toast.error('Please select an item');
      return;
    }

    try {
      const { error } = await supabase.from('user_watchlist').insert({
        user_id: user?.id,
        item_type: selectedType,
        item_id: selectedItemId,
        price_alert_low: alertLow ? parseFloat(alertLow) : null,
        price_alert_high: alertHigh ? parseFloat(alertHigh) : null,
        alert_enabled: !!(alertLow || alertHigh)
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('This item is already in your watchlist');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Added to watchlist!');
      setIsAddDialogOpen(false);
      setSelectedItemId('');
      setAlertLow('');
      setAlertHigh('');
      fetchData();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error('Failed to add to watchlist');
    }
  };

  const handleRemoveFromWatchlist = async (id: string) => {
    try {
      const { error } = await supabase.from('user_watchlist').delete().eq('id', id);
      if (error) throw error;
      toast.success('Removed from watchlist');
      fetchData();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Failed to remove');
    }
  };

  const handleToggleAlert = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('user_watchlist')
        .update({ alert_enabled: !currentValue })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentValue ? 'Alerts disabled' : 'Alerts enabled');
      fetchData();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const ipoWatchlist = watchlist.filter(w => w.item_type === 'ipo');
  const startupWatchlist = watchlist.filter(w => w.item_type === 'startup');
  const unreadAlerts = alerts.filter(a => !a.is_read);

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
              My <span className="text-gradient-primary">Watchlist</span>
            </h1>
            <p className="text-muted-foreground">Track IPOs and startups with price alerts</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="mt-4 md:mt-0">
                <Plus className="w-4 h-4 mr-2" />
                Add to Watchlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Add to Watchlist</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as 'ipo' | 'startup')}>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="ipo">IPO</TabsTrigger>
                    <TabsTrigger value="startup">Startup</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ipo" className="mt-4">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {ipos.map(ipo => (
                        <div
                          key={ipo.id}
                          onClick={() => setSelectedItemId(ipo.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedItemId === ipo.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <p className="font-medium text-foreground">{ipo.company_name}</p>
                          <p className="text-sm text-muted-foreground">{ipo.sector} • ₹{ipo.price_band_high}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="startup" className="mt-4">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {startups.map(startup => (
                        <div
                          key={startup.id}
                          onClick={() => setSelectedItemId(startup.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedItemId === startup.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <p className="font-medium text-foreground">{startup.startup_name}</p>
                          <p className="text-sm text-muted-foreground">{startup.sector}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Alert if price below</Label>
                    <Input
                      type="number"
                      value={alertLow}
                      onChange={(e) => setAlertLow(e.target.value)}
                      placeholder="e.g., 100"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Alert if price above</Label>
                    <Input
                      type="number"
                      value={alertHigh}
                      onChange={(e) => setAlertHigh(e.target.value)}
                      placeholder="e.g., 500"
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button onClick={handleAddToWatchlist} className="w-full mt-4">
                  Add to Watchlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{watchlist.length}</p>
                <p className="text-sm text-muted-foreground">Total Watching</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{ipoWatchlist.length}</p>
                <p className="text-sm text-muted-foreground">IPOs</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{startupWatchlist.length}</p>
                <p className="text-sm text-muted-foreground">Startups</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{unreadAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Unread Alerts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Watchlist Content */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({watchlist.length})</TabsTrigger>
            <TabsTrigger value="ipo">IPOs ({ipoWatchlist.length})</TabsTrigger>
            <TabsTrigger value="startup">Startups ({startupWatchlist.length})</TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <WatchlistGrid
              items={watchlist}
              onRemove={handleRemoveFromWatchlist}
              onToggleAlert={handleToggleAlert}
              navigate={navigate}
            />
          </TabsContent>

          <TabsContent value="ipo">
            <WatchlistGrid
              items={ipoWatchlist}
              onRemove={handleRemoveFromWatchlist}
              onToggleAlert={handleToggleAlert}
              navigate={navigate}
            />
          </TabsContent>

          <TabsContent value="startup">
            <WatchlistGrid
              items={startupWatchlist}
              onRemove={handleRemoveFromWatchlist}
              onToggleAlert={handleToggleAlert}
              navigate={navigate}
            />
          </TabsContent>

          <TabsContent value="alerts">
            <div className="grid gap-4">
              {alerts.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No price alerts yet. Add alerts when adding items to your watchlist.</p>
                  </CardContent>
                </Card>
              ) : (
                alerts.map(alert => (
                  <motion.div key={alert.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className={`glass-card ${!alert.is_read ? 'border-primary' : ''}`}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg ${alert.is_triggered ? 'bg-primary/20' : 'bg-secondary/50'} flex items-center justify-center`}>
                            {alert.is_triggered ? (
                              <AlertCircle className="w-5 h-5 text-primary" />
                            ) : (
                              <Bell className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{alert.item_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Alert: Price {alert.alert_type} ₹{alert.target_price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={alert.is_triggered ? 'default' : 'secondary'}>
                          {alert.is_triggered ? 'Triggered' : 'Pending'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const WatchlistGrid = ({
  items,
  onRemove,
  onToggleAlert,
  navigate
}: {
  items: WatchlistItem[];
  onRemove: (id: string) => void;
  onToggleAlert: (id: string, current: boolean) => void;
  navigate: (path: string) => void;
}) => {
  if (items.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-12 text-center text-muted-foreground">
          <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Your watchlist is empty. Start adding IPOs and startups to track them.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="glass-card hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${item.item_type === 'ipo' ? 'bg-accent/20' : 'bg-primary/20'} flex items-center justify-center`}>
                    {item.item_type === 'ipo' ? (
                      <Building2 className="w-5 h-5 text-accent" />
                    ) : (
                      <Rocket className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.item_details?.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground capitalize">{item.item_type}</p>
                  </div>
                </div>
                <Badge variant={item.item_details?.status === 'open' || item.item_details?.status === 'live' ? 'default' : 'secondary'}>
                  {item.item_details?.status || 'N/A'}
                </Badge>
              </div>

              {item.item_details?.sector && (
                <p className="text-sm text-muted-foreground mb-3">{item.item_details.sector}</p>
              )}

              {item.item_details?.price && (
                <p className="text-lg font-bold text-foreground mb-4">
                  ₹{Number(item.item_details.price).toLocaleString()}
                </p>
              )}

              {(item.price_alert_low || item.price_alert_high) && (
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  {item.price_alert_low && <span className="text-destructive">↓₹{item.price_alert_low}</span>}
                  {item.price_alert_high && <span className="text-primary">↑₹{item.price_alert_high}</span>}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.alert_enabled}
                    onCheckedChange={() => onToggleAlert(item.id, item.alert_enabled)}
                  />
                  <span className="text-sm text-muted-foreground">Alerts</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(item.item_type === 'ipo' ? `/ipo/${item.item_id}` : `/startups`)}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default Watchlist;
