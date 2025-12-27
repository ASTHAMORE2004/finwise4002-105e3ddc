import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Building2, FileText, Link as LinkIcon, DollarSign, CheckCircle, AlertCircle, Shield, X, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/landing/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const sectors = [
  'FinTech', 'EdTech', 'HealthTech', 'E-Commerce', 'SaaS', 
  'AI/ML', 'CleanTech', 'AgriTech', 'PropTech', 'Other'
];

interface KYCDocument {
  type: string;
  label: string;
  file: File | null;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  required: boolean;
}

const StartupRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeDocType, setActiveDocType] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    startup_name: '',
    symbol: '',
    description: '',
    sector: '',
    funding_goal: '',
    equity_offered: '',
    min_investment: '1000',
    valuation: '',
    website_url: '',
    founded_year: new Date().getFullYear().toString(),
    team_size: '1',
  });

  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([
    { type: 'aadhaar', label: 'Aadhaar Card', file: null, status: 'pending', required: true },
    { type: 'pan', label: 'PAN Card', file: null, status: 'pending', required: true },
    { type: 'gst', label: 'GST Certificate', file: null, status: 'pending', required: false },
    { type: 'incorporation', label: 'Certificate of Incorporation', file: null, status: 'pending', required: true },
    { type: 'pitch_deck', label: 'Pitch Deck (PDF)', file: null, status: 'pending', required: true },
  ]);

  const handleFileUpload = (docType: string) => {
    setActiveDocType(docType);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeDocType) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Maximum file size is 5MB', variant: 'destructive' });
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: 'Invalid file type', description: 'Please upload PDF, JPG, or PNG files', variant: 'destructive' });
        return;
      }

      setKycDocuments(docs => 
        docs.map(doc => 
          doc.type === activeDocType 
            ? { ...doc, file, status: 'uploaded' as const }
            : doc
        )
      );
      toast({ title: 'Document uploaded', description: `${file.name} uploaded successfully` });
    }
    setActiveDocType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeDocument = (docType: string) => {
    setKycDocuments(docs =>
      docs.map(doc =>
        doc.type === docType
          ? { ...doc, file: null, status: 'pending' as const }
          : doc
      )
    );
  };

  const getRequiredDocsUploaded = () => {
    return kycDocuments.filter(doc => doc.required && doc.status === 'uploaded').length;
  };

  const getTotalRequiredDocs = () => {
    return kycDocuments.filter(doc => doc.required).length;
  };

  const canSubmit = () => {
    return getRequiredDocsUploaded() === getTotalRequiredDocs() && 
           formData.startup_name && 
           formData.symbol && 
           formData.funding_goal;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'bg-yellow-500/20 text-yellow-400';
      case 'verified': return 'bg-emerald-500/20 text-emerald-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded': return <FileCheck className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to register your startup', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!canSubmit()) {
      toast({ title: 'Incomplete application', description: 'Please fill all required fields and upload all required documents', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      // First, insert the startup registration
      const { data: startupData, error: startupError } = await supabase.from('startup_registrations').insert({
        user_id: user.id,
        startup_name: formData.startup_name,
        symbol: formData.symbol.toUpperCase(),
        description: formData.description,
        sector: formData.sector,
        funding_goal: parseFloat(formData.funding_goal),
        equity_offered: formData.equity_offered ? parseFloat(formData.equity_offered) : null,
        min_investment: parseFloat(formData.min_investment),
        valuation: formData.valuation ? parseFloat(formData.valuation) : null,
        website_url: formData.website_url || null,
        founded_year: parseInt(formData.founded_year),
        team_size: parseInt(formData.team_size),
        status: 'pending'
      }).select().single();

      if (startupError) throw startupError;

      // Upload KYC documents to storage
      const uploadedDocs = kycDocuments.filter(doc => doc.file);
      for (const doc of uploadedDocs) {
        if (doc.file) {
          const fileExt = doc.file.name.split('.').pop();
          const filePath = `${user.id}/${doc.type}_${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('kyc-documents')
            .upload(filePath, doc.file);

          if (!uploadError) {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('kyc-documents')
              .getPublicUrl(filePath);

            // Insert KYC document record
            await supabase.from('kyc_documents').insert({
              user_id: user.id,
              document_type: doc.type,
              document_url: urlData.publicUrl,
              status: 'pending'
            });
          }
        }
      }

      toast({ 
        title: 'Application submitted!', 
        description: 'Your startup and KYC documents are under review. You will receive an email update soon.' 
      });
      navigate('/startups');
    } catch (error: any) {
      toast({ title: 'Submission failed', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
      />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => navigate('/startups')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Startups
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Register Your <span className="text-gradient-primary">Startup</span>
            </h1>
            <p className="text-muted-foreground">Get funding from student investors</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Application Progress</span>
              <span className="text-sm font-medium">Step {currentStep} of 2</span>
            </div>
            <Progress value={currentStep * 50} />
          </div>

          {/* Step 1: Company Details */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Company Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="startup_name">Startup Name *</Label>
                      <Input
                        id="startup_name"
                        placeholder="Your Startup Name"
                        value={formData.startup_name}
                        onChange={(e) => setFormData({...formData, startup_name: e.target.value})}
                        className="bg-secondary/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="symbol">Trading Symbol *</Label>
                      <Input
                        id="symbol"
                        placeholder="e.g., STRP"
                        value={formData.symbol}
                        onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase().slice(0, 5)})}
                        className="bg-secondary/50 uppercase"
                        maxLength={5}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your startup, what problem you solve, and your vision..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="bg-secondary/50 min-h-[100px]"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sector">Sector</Label>
                      <Select value={formData.sector} onValueChange={(v) => setFormData({...formData, sector: v})}>
                        <SelectTrigger className="bg-secondary/50">
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="funding_goal">Funding Goal (₹) *</Label>
                      <Input
                        id="funding_goal"
                        type="number"
                        placeholder="e.g., 500000"
                        value={formData.funding_goal}
                        onChange={(e) => setFormData({...formData, funding_goal: e.target.value})}
                        className="bg-secondary/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="equity_offered">Equity Offered (%)</Label>
                      <Input
                        id="equity_offered"
                        type="number"
                        placeholder="e.g., 10"
                        step="0.1"
                        value={formData.equity_offered}
                        onChange={(e) => setFormData({...formData, equity_offered: e.target.value})}
                        className="bg-secondary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min_investment">Min Investment (₹)</Label>
                      <Input
                        id="min_investment"
                        type="number"
                        value={formData.min_investment}
                        onChange={(e) => setFormData({...formData, min_investment: e.target.value})}
                        className="bg-secondary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valuation">Valuation (₹)</Label>
                      <Input
                        id="valuation"
                        type="number"
                        placeholder="e.g., 5000000"
                        value={formData.valuation}
                        onChange={(e) => setFormData({...formData, valuation: e.target.value})}
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="website_url">Website URL</Label>
                      <Input
                        id="website_url"
                        placeholder="https://..."
                        value={formData.website_url}
                        onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                        className="bg-secondary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="founded_year">Founded Year</Label>
                      <Input
                        id="founded_year"
                        type="number"
                        value={formData.founded_year}
                        onChange={(e) => setFormData({...formData, founded_year: e.target.value})}
                        className="bg-secondary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team_size">Team Size</Label>
                      <Input
                        id="team_size"
                        type="number"
                        value={formData.team_size}
                        onChange={(e) => setFormData({...formData, team_size: e.target.value})}
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    className="w-full btn-primary-gradient h-12"
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.startup_name || !formData.symbol || !formData.funding_goal}
                  >
                    Continue to KYC Verification
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: KYC Documents */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="glass-card border-border/50 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    KYC Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* KYC Progress */}
                  <div className="mb-6 p-4 rounded-xl bg-secondary/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Required Documents</span>
                      <span className="text-sm text-primary">{getRequiredDocsUploaded()} of {getTotalRequiredDocs()} uploaded</span>
                    </div>
                    <Progress value={(getRequiredDocsUploaded() / getTotalRequiredDocs()) * 100} />
                  </div>

                  {/* Document Upload Cards */}
                  <div className="space-y-4">
                    {kycDocuments.map((doc) => (
                      <div
                        key={doc.type}
                        className={`p-4 rounded-xl border transition-all ${
                          doc.status === 'uploaded' 
                            ? 'bg-primary/5 border-primary/30' 
                            : 'bg-secondary/30 border-border/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              doc.status === 'uploaded' ? 'bg-primary/20' : 'bg-secondary'
                            }`}>
                              {getStatusIcon(doc.status)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground flex items-center gap-2">
                                {doc.label}
                                {doc.required && <span className="text-destructive">*</span>}
                              </p>
                              {doc.file && (
                                <p className="text-xs text-muted-foreground">{doc.file.name}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                            {doc.status === 'uploaded' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDocument(doc.type)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFileUpload(doc.type)}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Info Box */}
                  <div className="mt-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Secure Document Handling</p>
                        <p className="text-xs text-muted-foreground">
                          Your documents are encrypted and stored securely. They will only be used for verification purposes and will not be shared with third parties.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12"
                  onClick={() => setCurrentStep(1)}
                >
                  Back to Details
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="flex-1 btn-primary-gradient h-12" 
                  disabled={loading || !canSubmit()}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StartupRegistration;
