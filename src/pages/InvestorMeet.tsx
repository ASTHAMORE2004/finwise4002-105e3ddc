import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Presentation, Calendar, MessageSquareText, FileText, Video, 
  Users, ArrowRight, Sparkles, Upload, Loader2, BookOpen,
  Target, Shield, TrendingUp, BrainCircuit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/landing/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface StartupData {
  id: string;
  startup_name: string;
  description: string | null;
  sector: string | null;
  funding_goal: number;
  equity_offered: number | null;
  valuation: number | null;
  team_size: number | null;
  founded_year: number | null;
  status: string;
}

interface InvestorQuestion {
  category: string;
  question: string;
  tip: string;
}

const InvestorMeet = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [startups, setStartups] = useState<StartupData[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<StartupData | null>(null);
  const [aiQuestions, setAiQuestions] = useState<InvestorQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [demoPitchScript, setDemoPitchScript] = useState('');
  const [pitchLoading, setPitchLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchStartups();
    }
  }, [user, authLoading]);

  const fetchStartups = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('startup_registrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setStartups(data);
    if (data && data.length > 0) setSelectedStartup(data[0]);
    setLoading(false);
  };

  const generateInvestorQuestions = async () => {
    if (!selectedStartup) return;
    setQuestionsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-investor-prep', {
        body: { 
          type: 'questions',
          startup: {
            name: selectedStartup.startup_name,
            description: selectedStartup.description,
            sector: selectedStartup.sector,
            funding_goal: selectedStartup.funding_goal,
            equity_offered: selectedStartup.equity_offered,
            valuation: selectedStartup.valuation,
            team_size: selectedStartup.team_size,
          }
        }
      });
      if (error) throw error;
      setAiQuestions(data?.questions || []);
    } catch (err: any) {
      toast({ title: 'Failed to generate questions', description: err.message, variant: 'destructive' });
    }
    setQuestionsLoading(false);
  };

  const generateDemoPitch = async () => {
    if (!selectedStartup) return;
    setPitchLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-investor-prep', {
        body: { 
          type: 'pitch',
          startup: {
            name: selectedStartup.startup_name,
            description: selectedStartup.description,
            sector: selectedStartup.sector,
            funding_goal: selectedStartup.funding_goal,
            equity_offered: selectedStartup.equity_offered,
            valuation: selectedStartup.valuation,
            team_size: selectedStartup.team_size,
            founded_year: selectedStartup.founded_year,
          }
        }
      });
      if (error) throw error;
      setDemoPitchScript(data?.pitchScript || '');
    } catch (err: any) {
      toast({ title: 'Failed to generate pitch', description: err.message, variant: 'destructive' });
    }
    setPitchLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Presentation,
      title: 'Give a Demo Pitch',
      description: 'Practice your pitch with AI-generated scripts and real-time transcription',
      gradient: 'from-amber-500 to-orange-600',
      bgGlow: 'bg-amber-500/20',
      action: 'pitch',
    },
    {
      icon: Calendar,
      title: 'Schedule Investor Call',
      description: 'Book video meetings with investors and showcase your startup dashboard',
      gradient: 'from-blue-500 to-indigo-600',
      bgGlow: 'bg-blue-500/20',
      action: 'schedule',
    },
    {
      icon: BrainCircuit,
      title: 'Prepare for Questions',
      description: 'AI generates likely investor questions based on your startup profile',
      gradient: 'from-violet-500 to-purple-600',
      bgGlow: 'bg-violet-500/20',
      action: 'questions',
    },
    {
      icon: FileText,
      title: 'Extract & Autofill from Documents',
      description: 'Upload KYC/PDF documents to auto-extract info for registration forms',
      gradient: 'from-emerald-500 to-teal-600',
      bgGlow: 'bg-emerald-500/20',
      action: 'extract',
    },
    {
      icon: Target,
      title: 'Investor Dashboard & Bidding',
      description: 'View real-time investor interest and bidding activity on your startup',
      gradient: 'from-rose-500 to-pink-600',
      bgGlow: 'bg-rose-500/20',
      action: 'dashboard',
    },
    {
      icon: Shield,
      title: 'Due Diligence Checklist',
      description: 'Track all required documents and compliance for investor readiness',
      gradient: 'from-cyan-500 to-sky-600',
      bgGlow: 'bg-cyan-500/20',
      action: 'checklist',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">Investor Relations Hub</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient-primary">Investor</span> Meet
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Prepare, pitch, and connect with investors — all from one place. AI-powered tools to make your startup investor-ready.
            </p>
          </div>

          {/* Startup Selector */}
          {startups.length > 0 && (
            <div className="mb-8">
              <div className="glass-card rounded-xl p-4 flex items-center gap-4 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Active Startup:</span>
                {startups.map((s) => (
                  <Button
                    key={s.id}
                    variant={selectedStartup?.id === s.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStartup(s)}
                    className={selectedStartup?.id === s.id ? 'btn-primary-gradient' : ''}
                  >
                    {s.startup_name}
                    <Badge variant="outline" className="ml-2 text-xs">{s.status}</Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {startups.length === 0 && (
            <Card className="glass-card mb-8 border-primary/30">
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Register Your Startup First</h3>
                <p className="text-muted-foreground mb-4">You need a registered startup to access investor meet features.</p>
                <Button onClick={() => navigate('/startups/register')} className="btn-primary-gradient">
                  Register Startup <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group cursor-pointer relative"
              >
                <div className={`absolute inset-0 ${feature.bgGlow} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <Card className="relative glass-card h-full border-border/50 hover:border-primary/50 transition-all duration-300 group-hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content Tabs */}
          {selectedStartup && (
            <Tabs defaultValue="pitch" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
                <TabsTrigger value="pitch">Demo Pitch</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="questions">Q&A Prep</TabsTrigger>
                <TabsTrigger value="extract">Doc Extract</TabsTrigger>
              </TabsList>

              {/* Demo Pitch Tab */}
              <TabsContent value="pitch">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Presentation className="h-5 w-5 text-primary" />
                      Demo Pitch Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="glass-card rounded-xl p-4 bg-secondary/30">
                      <p className="text-sm text-muted-foreground mb-2">
                        Generating pitch for: <span className="text-foreground font-medium">{selectedStartup.startup_name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sector: {selectedStartup.sector || 'N/A'} • Funding Goal: ₹{selectedStartup.funding_goal?.toLocaleString()} • 
                        Valuation: ₹{selectedStartup.valuation?.toLocaleString() || 'N/A'}
                      </p>
                    </div>

                    <Button 
                      onClick={generateDemoPitch} 
                      disabled={pitchLoading}
                      className="btn-primary-gradient"
                    >
                      {pitchLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4 mr-2" />Generate Pitch Script</>}
                    </Button>

                    {demoPitchScript && (
                      <div className="space-y-4">
                        <div className="glass-card rounded-xl p-6 bg-secondary/20 whitespace-pre-wrap text-sm leading-relaxed">
                          {demoPitchScript}
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" onClick={() => navigator.clipboard.writeText(demoPitchScript)}>
                            Copy Script
                          </Button>
                          <Button onClick={() => navigate('/video-call')} className="btn-primary-gradient">
                            <Video className="h-4 w-4 mr-2" />
                            Practice with Video Call
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Schedule Investor Call
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                      Schedule a video meeting to pitch your startup to investors. They'll see your startup dashboard, bidding info, and metrics during the call.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="glass-card border-border/50 hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate('/video-call')}>
                        <CardContent className="p-6 text-center">
                          <Video className="h-10 w-10 text-primary mx-auto mb-3" />
                          <h4 className="font-semibold mb-1">Start Instant Call</h4>
                          <p className="text-sm text-muted-foreground">Jump into a video call now</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border-border/50 hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate('/video-call')}>
                        <CardContent className="p-6 text-center">
                          <Calendar className="h-10 w-10 text-primary mx-auto mb-3" />
                          <h4 className="font-semibold mb-1">Schedule for Later</h4>
                          <p className="text-sm text-muted-foreground">Pick a date & time</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Investor Dashboard Preview */}
                    <div className="glass-card rounded-xl p-6 bg-secondary/20">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Startup Dashboard Preview
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-lg bg-secondary/30">
                          <p className="text-2xl font-bold text-primary">₹{selectedStartup.funding_goal?.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Funding Goal</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-secondary/30">
                          <p className="text-2xl font-bold text-primary">{selectedStartup.equity_offered || 0}%</p>
                          <p className="text-xs text-muted-foreground">Equity Offered</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-secondary/30">
                          <p className="text-2xl font-bold text-primary">{selectedStartup.team_size || 1}</p>
                          <p className="text-xs text-muted-foreground">Team Size</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Questions Tab */}
              <TabsContent value="questions">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BrainCircuit className="h-5 w-5 text-primary" />
                      AI Investor Question Prep
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                      Get AI-generated investor questions tailored to <span className="text-foreground font-medium">{selectedStartup.startup_name}</span>'s profile. Practice answering to ace your pitch.
                    </p>

                    <Button 
                      onClick={generateInvestorQuestions} 
                      disabled={questionsLoading}
                      className="btn-primary-gradient"
                    >
                      {questionsLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" />Generate Questions</>}
                    </Button>

                    {aiQuestions.length > 0 && (
                      <div className="space-y-4">
                        {aiQuestions.map((q, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card rounded-xl p-4"
                          >
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="shrink-0 mt-0.5">{q.category}</Badge>
                              <div>
                                <p className="font-medium mb-2">{q.question}</p>
                                <p className="text-sm text-muted-foreground">💡 Tip: {q.tip}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Document Extract Tab */}
              <TabsContent value="extract">
                <DocumentExtractor />
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>
    </div>
  );
};

/* ─── Document Extractor Component ─── */
const DocumentExtractor = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string> | null>(null);
  const [targetForm, setTargetForm] = useState<'startup' | 'ipo'>('startup');
  const navigate = useNavigate();

  const handleExtract = async () => {
    if (!file) return;
    setExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const mimeType = file.type || 'application/pdf';

      const { data, error } = await supabase.functions.invoke('ai-pdf-extract', {
        body: { fileBase64: base64, mimeType, targetForm }
      });
      if (error) throw error;
      setExtractedData(data?.extractedFields || {});
      toast({ title: 'Data extracted successfully!', description: 'Review the fields and proceed to autofill.' });
    } catch (err: any) {
      toast({ title: 'Extraction failed', description: err.message, variant: 'destructive' });
    }
    setExtracting(false);
  };

  const handleAutofill = () => {
    if (!extractedData) return;
    const params = new URLSearchParams();
    Object.entries(extractedData).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    navigate(targetForm === 'startup' ? `/startups/register?${params.toString()}` : `/ipo/register?${params.toString()}`);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          PDF / KYC Document Extractor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Upload KYC documents (Aadhaar, PAN, incorporation cert, etc.) and AI will extract key data to autofill your registration forms.
        </p>

        <div className="flex gap-3">
          <Button 
            variant={targetForm === 'startup' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTargetForm('startup')}
            className={targetForm === 'startup' ? 'btn-primary-gradient' : ''}
          >
            Startup Registration
          </Button>
          <Button 
            variant={targetForm === 'ipo' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTargetForm('ipo')}
            className={targetForm === 'ipo' ? 'btn-primary-gradient' : ''}
          >
            IPO Registration
          </Button>
        </div>

        <div className="glass-card rounded-xl p-8 border-dashed border-2 border-border/50 text-center">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            id="doc-extract-input"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="doc-extract-input" className="cursor-pointer">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">{file ? file.name : 'Click to upload document'}</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — max 10MB</p>
          </label>
        </div>

        <Button 
          onClick={handleExtract} 
          disabled={!file || extracting}
          className="btn-primary-gradient w-full"
        >
          {extracting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Extracting...</> : <><Sparkles className="h-4 w-4 mr-2" />Extract Data with AI</>}
        </Button>

        {extractedData && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h4 className="font-semibold">Extracted Fields:</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(extractedData).map(([key, value]) => (
                <div key={key} className="glass-card rounded-lg p-3">
                  <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="font-medium text-sm">{value || '—'}</p>
                </div>
              ))}
            </div>
            <Button onClick={handleAutofill} className="btn-primary-gradient">
              <ArrowRight className="h-4 w-4 mr-2" />
              Autofill {targetForm === 'startup' ? 'Startup' : 'IPO'} Registration
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestorMeet;
