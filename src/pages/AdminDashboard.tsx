import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, CheckCircle, XCircle, Clock, Building2, TrendingUp, 
  Eye, Mail, AlertTriangle, RefreshCw, Users, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/landing/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface IPOListing {
  id: string;
  company_name: string;
  symbol: string;
  sector: string | null;
  status: string | null;
  price_band_low: number;
  price_band_high: number;
  lot_size: number;
  open_date: string;
  close_date: string;
  created_at: string;
}

interface StartupRegistration {
  id: string;
  startup_name: string;
  symbol: string;
  sector: string | null;
  status: string;
  funding_goal: number;
  valuation: number | null;
  description: string | null;
  created_at: string;
  user_id: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [ipos, setIpos] = useState<IPOListing[]>([]);
  const [startups, setStartups] = useState<StartupRegistration[]>([]);
  
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    type: 'ipo' | 'startup';
    id: string;
    name: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (user) {
      checkAdminRole();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    if (data) {
      setIsAdmin(true);
      fetchData();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    
    const [ipoRes, startupRes] = await Promise.all([
      supabase.from('ipo_listings').select('*').order('created_at', { ascending: false }),
      supabase.from('startup_registrations').select('*').order('created_at', { ascending: false })
    ]);
    
    if (ipoRes.data) setIpos(ipoRes.data);
    if (startupRes.data) setStartups(startupRes.data);
    
    setLoading(false);
  };

  const handleApproveIPO = async (ipo: IPOListing) => {
    setActionLoading(ipo.id);
    
    const { error } = await supabase
      .from('ipo_listings')
      .update({ 
        status: 'live',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', ipo.id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      // Send approval email
      try {
        await supabase.functions.invoke('send-verification-email', {
          body: {
            type: 'ipo_approved',
            companyName: ipo.company_name,
            symbol: ipo.symbol
          }
        });
      } catch (e) {
        console.log('Email failed:', e);
      }
      
      toast({ title: 'IPO Approved', description: `${ipo.company_name} is now live` });
      fetchData();
    }
    
    setActionLoading(null);
  };

  const handleApproveStartup = async (startup: StartupRegistration) => {
    setActionLoading(startup.id);
    
    const { error } = await supabase
      .from('startup_registrations')
      .update({ 
        status: 'approved',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', startup.id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      // Send approval email
      try {
        await supabase.functions.invoke('send-verification-email', {
          body: {
            type: 'startup_approved',
            startupName: startup.startup_name
          }
        });
      } catch (e) {
        console.log('Email failed:', e);
      }
      
      toast({ title: 'Startup Approved', description: `${startup.startup_name} is now approved` });
      fetchData();
    }
    
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    
    setActionLoading(rejectDialog.id);
    
    if (rejectDialog.type === 'ipo') {
      const { error } = await supabase
        .from('ipo_listings')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', rejectDialog.id);
      
      if (!error) {
        try {
          await supabase.functions.invoke('send-verification-email', {
            body: {
              type: 'ipo_rejected',
              companyName: rejectDialog.name,
              reason: rejectionReason
            }
          });
        } catch (e) {
          console.log('Email failed:', e);
        }
        toast({ title: 'IPO Rejected', description: `${rejectDialog.name} has been rejected` });
      }
    } else {
      const { error } = await supabase
        .from('startup_registrations')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', rejectDialog.id);
      
      if (!error) {
        try {
          await supabase.functions.invoke('send-verification-email', {
            body: {
              type: 'startup_rejected',
              startupName: rejectDialog.name,
              reason: rejectionReason
            }
          });
        } catch (e) {
          console.log('Email failed:', e);
        }
        toast({ title: 'Startup Rejected', description: `${rejectDialog.name} has been rejected` });
      }
    }
    
    setRejectDialog(null);
    setRejectionReason('');
    setActionLoading(null);
    fetchData();
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
      case 'upcoming':
        return <Badge className="bg-yellow-500/20 text-yellow-400"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
      case 'live':
        return <Badge className="bg-emerald-500/20 text-emerald-400"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingIpos = ipos.filter(i => i.status === 'upcoming' || i.status === 'pending');
  const pendingStartups = startups.filter(s => s.status === 'pending');

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-4">Please sign in to access the admin dashboard</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin privileges to access this page</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                <Shield className="inline-block w-8 h-8 mr-2 text-primary" />
                Admin <span className="text-gradient-primary">Dashboard</span>
              </h1>
              <p className="text-muted-foreground">Manage IPO and Startup registrations</p>
            </div>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="glass-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-yellow-500/20">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingIpos.length}</p>
                    <p className="text-sm text-muted-foreground">Pending IPOs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingStartups.length}</p>
                    <p className="text-sm text-muted-foreground">Pending Startups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-emerald-500/20">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ipos.filter(i => i.status === 'live').length}</p>
                    <p className="text-sm text-muted-foreground">Live IPOs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{startups.filter(s => s.status === 'approved').length}</p>
                    <p className="text-sm text-muted-foreground">Approved Startups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for IPO and Startups */}
          <Tabs defaultValue="ipos" className="space-y-6">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="ipos" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                IPO Listings ({ipos.length})
              </TabsTrigger>
              <TabsTrigger value="startups" className="gap-2">
                <Building2 className="w-4 h-4" />
                Startups ({startups.length})
              </TabsTrigger>
            </TabsList>

            {/* IPO Tab */}
            <TabsContent value="ipos" className="space-y-4">
              {ipos.length === 0 ? (
                <Card className="glass-card border-border/50">
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No IPO registrations yet</p>
                  </CardContent>
                </Card>
              ) : (
                ipos.map(ipo => (
                  <Card key={ipo.id} className="glass-card border-border/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{ipo.company_name}</h3>
                            <Badge variant="outline">{ipo.symbol}</Badge>
                            {getStatusBadge(ipo.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="block text-xs uppercase">Sector</span>
                              <span className="text-foreground">{ipo.sector || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="block text-xs uppercase">Price Band</span>
                              <span className="text-foreground">₹{ipo.price_band_low} - ₹{ipo.price_band_high}</span>
                            </div>
                            <div>
                              <span className="block text-xs uppercase">Lot Size</span>
                              <span className="text-foreground">{ipo.lot_size}</span>
                            </div>
                            <div>
                              <span className="block text-xs uppercase">Dates</span>
                              <span className="text-foreground">{ipo.open_date} to {ipo.close_date}</span>
                            </div>
                          </div>
                        </div>
                        
                        {(ipo.status === 'upcoming' || ipo.status === 'pending') && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveIPO(ipo)}
                              disabled={actionLoading === ipo.id}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectDialog({ open: true, type: 'ipo', id: ipo.id, name: ipo.company_name })}
                              disabled={actionLoading === ipo.id}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Startups Tab */}
            <TabsContent value="startups" className="space-y-4">
              {startups.length === 0 ? (
                <Card className="glass-card border-border/50">
                  <CardContent className="py-12 text-center">
                    <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No startup registrations yet</p>
                  </CardContent>
                </Card>
              ) : (
                startups.map(startup => (
                  <Card key={startup.id} className="glass-card border-border/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{startup.startup_name}</h3>
                            <Badge variant="outline">{startup.symbol}</Badge>
                            {getStatusBadge(startup.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="block text-xs uppercase">Sector</span>
                              <span className="text-foreground">{startup.sector || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="block text-xs uppercase">Funding Goal</span>
                              <span className="text-foreground">₹{(startup.funding_goal / 100000).toFixed(0)}L</span>
                            </div>
                            <div>
                              <span className="block text-xs uppercase">Valuation</span>
                              <span className="text-foreground">
                                {startup.valuation ? `₹${(startup.valuation / 10000000).toFixed(1)}Cr` : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="block text-xs uppercase">Registered</span>
                              <span className="text-foreground">
                                {new Date(startup.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {startup.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{startup.description}</p>
                          )}
                        </div>
                        
                        {startup.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveStartup(startup)}
                              disabled={actionLoading === startup.id}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectDialog({ open: true, type: 'startup', id: startup.id, name: startup.startup_name })}
                              disabled={actionLoading === startup.id}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectDialog?.type === 'ipo' ? 'IPO' : 'Startup'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are about to reject <strong>{rejectDialog?.name}</strong>. 
              Please provide a reason for rejection.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading === rejectDialog?.id}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
