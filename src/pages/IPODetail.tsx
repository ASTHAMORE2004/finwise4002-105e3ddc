import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, IndianRupee, TrendingUp, Building, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Navbar from '@/components/landing/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface IPO {
  id: string;
  company_name: string;
  symbol: string;
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

const IPODetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [ipo, setIPO] = useState<IPO | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [lots, setLots] = useState(1);
  const [bidPrice, setBidPrice] = useState(0);
  const [upiId, setUpiId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (id) fetchIPOData();
  }, [id]);

  const fetchIPOData = async () => {
    const { data, error } = await supabase
      .from('ipo_listings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) {
      setIPO(data);
      setBidPrice(data.price_band_high);
    }
    
    if (user) {
      const { data: application } = await supabase
        .from('ipo_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('ipo_id', id)
        .single();
      
      if (application) setHasApplied(true);
    }
    
    setLoading(false);
  };

  const handleApply = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to apply for IPO', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!ipo) return;

    if (!upiId || !upiId.includes('@')) {
      toast({ title: 'Invalid UPI ID', description: 'Please enter a valid UPI ID', variant: 'destructive' });
      return;
    }

    setApplying(true);
    
    const amount = lots * ipo.lot_size * bidPrice;
    
    const { error } = await supabase
      .from('ipo_applications')
      .insert({
        user_id: user.id,
        ipo_id: ipo.id,
        lots_applied: lots,
        bid_price: bidPrice,
        amount: amount,
        upi_id: upiId,
        status: 'pending'
      });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already applied', description: 'You have already applied for this IPO', variant: 'destructive' });
      } else {
        toast({ title: 'Application failed', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Application submitted!', description: `Your application for ${lots} lot(s) has been submitted` });
      setHasApplied(true);
      setDialogOpen(false);
    }
    
    setApplying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 animate-pulse">
          <div className="h-10 bg-secondary/50 rounded w-1/3 mb-4" />
          <div className="h-6 bg-secondary/50 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!ipo) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-display">IPO not found</h1>
          <Button onClick={() => navigate('/ipo')} className="mt-4">Back to IPOs</Button>
        </div>
      </div>
    );
  }

  const minAmount = ipo.lot_size * ipo.price_band_high;
  const totalAmount = lots * ipo.lot_size * bidPrice;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => navigate('/ipo')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to IPOs
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-card rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-3xl font-bold text-primary">{ipo.symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-display font-bold">{ipo.company_name}</h1>
                    <Badge className={ipo.status === 'open' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}>
                      {ipo.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-lg">{ipo.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Price Band', value: `₹${ipo.price_band_low} - ₹${ipo.price_band_high}`, icon: IndianRupee },
                  { label: 'Lot Size', value: `${ipo.lot_size} shares`, icon: TrendingUp },
                  { label: 'Issue Size', value: `₹${ipo.issue_size} Cr`, icon: Building },
                  { label: 'Sector', value: ipo.sector || 'N/A', icon: FileText }
                ].map((item, i) => (
                  <div key={i} className="glass-card rounded-xl p-4">
                    <item.icon className="h-5 w-5 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="glass-card rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-display font-semibold">IPO Timeline</h2>
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Bidding Period</p>
                    <p className="text-muted-foreground">
                      {format(new Date(ipo.open_date), 'MMMM d, yyyy')} - {format(new Date(ipo.close_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-display font-semibold mb-4">Key Information</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between p-3 bg-secondary/30 rounded-lg">
                    <span className="text-muted-foreground">Issue Type</span>
                    <span>{ipo.issue_type}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-secondary/30 rounded-lg">
                    <span className="text-muted-foreground">Min Investment</span>
                    <span>₹{minAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-secondary/30 rounded-lg">
                    <span className="text-muted-foreground">Subscription</span>
                    <span>{ipo.subscription_rate}x</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="glass-card rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-display font-semibold mb-4">Apply for IPO</h2>
                
                {ipo.status !== 'open' ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {ipo.status === 'upcoming' ? 'IPO opens soon' : 'IPO is closed'}
                    </p>
                  </div>
                ) : hasApplied ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-primary font-semibold">Application Submitted!</p>
                    <p className="text-sm text-muted-foreground mt-2">You have already applied for this IPO</p>
                  </div>
                ) : (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full btn-primary-gradient h-12">Apply Now</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle>Apply for {ipo.company_name} IPO</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Number of Lots</Label>
                          <Input
                            type="number"
                            min={1}
                            max={13}
                            value={lots}
                            onChange={(e) => setLots(Math.min(13, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="bg-secondary/50"
                          />
                          <p className="text-xs text-muted-foreground">Max 13 lots for retail investors</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Bid Price (₹)</Label>
                          <Input
                            type="number"
                            min={ipo.price_band_low}
                            max={ipo.price_band_high}
                            value={bidPrice}
                            onChange={(e) => setBidPrice(parseFloat(e.target.value) || ipo.price_band_high)}
                            className="bg-secondary/50"
                          />
                          <p className="text-xs text-muted-foreground">
                            Price band: ₹{ipo.price_band_low} - ₹{ipo.price_band_high}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>UPI ID</Label>
                          <Input
                            placeholder="yourname@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="bg-secondary/50"
                          />
                        </div>

                        <div className="p-4 bg-secondary/30 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="text-muted-foreground">Shares</span>
                            <span>{lots * ipo.lot_size}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold">
                            <span>Total Amount</span>
                            <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
                          </div>
                        </div>

                        <Button 
                          className="w-full btn-primary-gradient" 
                          onClick={handleApply}
                          disabled={applying}
                        >
                          {applying ? 'Submitting...' : 'Confirm Application'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IPODetail;
