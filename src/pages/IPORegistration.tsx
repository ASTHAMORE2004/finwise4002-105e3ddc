import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Building2, FileText, Calendar, IndianRupee, CheckCircle, AlertCircle, Shield, X, FileCheck, TrendingUp } from 'lucide-react';
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
  'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
  'Real Estate', 'Energy', 'Consumer Goods', 'Infrastructure', 'Other'
];

const issueTypes = ['Book Built', 'Fixed Price'];

interface KYCDocument {
  type: string;
  label: string;
  file: File | null;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  required: boolean;
}

const IPORegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeDocType, setActiveDocType] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    company_name: '',
    symbol: '',
    description: '',
    sector: '',
    price_band_low: '',
    price_band_high: '',
    lot_size: '',
    issue_size: '',
    issue_type: 'Book Built',
    open_date: '',
    close_date: '',
    listing_date: '',
  });

  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([
    { type: 'pan_company', label: 'Company PAN Card', file: null, status: 'pending', required: true },
    { type: 'incorporation', label: 'Certificate of Incorporation', file: null, status: 'pending', required: true },
    { type: 'gst', label: 'GST Registration Certificate', file: null, status: 'pending', required: true },
    { type: 'board_resolution', label: 'Board Resolution for IPO', file: null, status: 'pending', required: true },
    { type: 'drhp', label: 'Draft Red Herring Prospectus (DRHP)', file: null, status: 'pending', required: true },
    { type: 'audited_financials', label: 'Audited Financial Statements (3 years)', file: null, status: 'pending', required: true },
    { type: 'promoter_kyc', label: 'Promoter KYC Documents', file: null, status: 'pending', required: true },
    { type: 'sebi_approval', label: 'SEBI Approval Letter', file: null, status: 'pending', required: false },
  ]);

  const handleFileUpload = (docType: string) => {
    setActiveDocType(docType);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeDocType) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Maximum file size is 10MB', variant: 'destructive' });
        return;
      }
      
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
           formData.company_name && 
           formData.symbol && 
           formData.price_band_low &&
           formData.price_band_high &&
           formData.lot_size &&
           formData.open_date &&
           formData.close_date;
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
      toast({ title: 'Sign in required', description: 'Please sign in to register an IPO', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!canSubmit()) {
      toast({ title: 'Incomplete application', description: 'Please fill all required fields and upload all required documents', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      // Insert the IPO listing
      const { data: ipoData, error: ipoError } = await supabase.from('ipo_listings').insert({
        company_name: formData.company_name,
        symbol: formData.symbol.toUpperCase(),
        description: formData.description,
        sector: formData.sector,
        price_band_low: parseFloat(formData.price_band_low),
        price_band_high: parseFloat(formData.price_band_high),
        lot_size: parseInt(formData.lot_size),
        issue_size: formData.issue_size ? parseFloat(formData.issue_size) : null,
        issue_type: formData.issue_type,
        open_date: formData.open_date,
        close_date: formData.close_date,
        listing_date: formData.listing_date || null,
        status: 'upcoming'
      }).select().single();

      if (ipoError) throw ipoError;

      // Upload KYC documents
      const uploadedDocs = kycDocuments.filter(doc => doc.file);
      for (const doc of uploadedDocs) {
        if (doc.file) {
          const fileExt = doc.file.name.split('.').pop();
          const filePath = `ipo/${user.id}/${doc.type}_${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('kyc-documents')
            .upload(filePath, doc.file);

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('kyc-documents')
              .getPublicUrl(filePath);

            await supabase.from('kyc_documents').insert({
              user_id: user.id,
              document_type: `ipo_${doc.type}`,
              document_url: urlData.publicUrl,
              status: 'pending'
            });
          }
        }
      }

      // Send verification email
      try {
        await supabase.functions.invoke('send-verification-email', {
          body: {
            email: user.email,
            type: 'ipo_registration',
            data: { company_name: formData.company_name, symbol: formData.symbol }
          }
        });
      } catch (emailError) {
        console.log('Email notification failed:', emailError);
      }

      toast({ 
        title: 'IPO Registration Submitted!', 
        description: 'Your IPO application and documents are under review. You will receive an email update soon.' 
      });
      navigate('/ipo');
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
          <Button variant="ghost" onClick={() => navigate('/ipo')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to IPO Listings
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Register <span className="text-gradient-primary">IPO</span>
            </h1>
            <p className="text-muted-foreground">List your company's Initial Public Offering</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Application Progress</span>
              <span className="text-sm font-medium">Step {currentStep} of 2</span>
            </div>
            <Progress value={currentStep * 50} />
          </div>

          {/* Step 1: IPO Details */}
          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    IPO Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name *</Label>
                      <Input
                        id="company_name"
                        placeholder="Company Legal Name"
                        value={formData.company_name}
                        onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                        className="bg-secondary/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="symbol">Stock Symbol *</Label>
                      <Input
                        id="symbol"
                        placeholder="e.g., TECH"
                        value={formData.symbol}
                        onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase().slice(0, 10)})}
                        className="bg-secondary/50 uppercase"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your company, business model, and growth prospects..."
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
                      <Label htmlFor="issue_type">Issue Type</Label>
                      <Select value={formData.issue_type} onValueChange={(v) => setFormData({...formData, issue_type: v})}>
                        <SelectTrigger className="bg-secondary/50">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {issueTypes.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price_band_low">Price Band Low (₹) *</Label>
                      <Input
                        id="price_band_low"
                        type="number"
                        placeholder="e.g., 100"
                        value={formData.price_band_low}
                        onChange={(e) => setFormData({...formData, price_band_low: e.target.value})}
                        className="bg-secondary/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price_band_high">Price Band High (₹) *</Label>
                      <Input
                        id="price_band_high"
                        type="number"
                        placeholder="e.g., 120"
                        value={formData.price_band_high}
                        onChange={(e) => setFormData({...formData, price_band_high: e.target.value})}
                        className="bg-secondary/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="lot_size">Lot Size *</Label>
                      <Input
                        id="lot_size"
                        type="number"
                        placeholder="e.g., 125"
                        value={formData.lot_size}
                        onChange={(e) => setFormData({...formData, lot_size: e.target.value})}
                        className="bg-secondary/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issue_size">Issue Size (₹)</Label>
                      <Input
                        id="issue_size"
                        type="number"
                        placeholder="e.g., 100000000"
                        value={formData.issue_size}
                        onChange={(e) => setFormData({...formData, issue_size: e.target.value})}
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="open_date">Open Date *</Label>
                      <Input
                        id="open_date"
                        type="date"
                        value={formData.open_date}
                        onChange={(e) => setFormData({...formData, open_date: e.target.value})}
                        className="bg-secondary/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="close_date">Close Date *</Label>
                      <Input
                        id="close_date"
                        type="date"
                        value={formData.close_date}
                        onChange={(e) => setFormData({...formData, close_date: e.target.value})}
                        className="bg-secondary/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="listing_date">Listing Date</Label>
                      <Input
                        id="listing_date"
                        type="date"
                        value={formData.listing_date}
                        onChange={(e) => setFormData({...formData, listing_date: e.target.value})}
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    className="w-full btn-primary-gradient h-12"
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.company_name || !formData.symbol || !formData.price_band_low || !formData.price_band_high || !formData.lot_size || !formData.open_date || !formData.close_date}
                  >
                    Continue to KYC Verification
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: KYC Documents */}
          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="glass-card border-border/50 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    KYC & Compliance Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 p-4 rounded-xl bg-secondary/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Required Documents</span>
                      <span className="text-sm text-primary">{getRequiredDocsUploaded()} of {getTotalRequiredDocs()} uploaded</span>
                    </div>
                    <Progress value={(getRequiredDocsUploaded() / getTotalRequiredDocs()) * 100} />
                  </div>

                  <div className="space-y-4">
                    {kycDocuments.map((doc) => (
                      <div
                        key={doc.type}
                        className={`p-4 rounded-xl border transition-all ${
                          doc.status === 'uploaded' 
                            ? 'border-yellow-500/50 bg-yellow-500/5' 
                            : doc.status === 'verified'
                            ? 'border-emerald-500/50 bg-emerald-500/5'
                            : 'border-border/50 bg-secondary/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getStatusColor(doc.status)}`}>
                              {getStatusIcon(doc.status)}
                            </div>
                            <div>
                              <p className="font-medium">
                                {doc.label}
                                {doc.required && <span className="text-red-400 ml-1">*</span>}
                              </p>
                              {doc.file && (
                                <p className="text-sm text-muted-foreground">{doc.file.name}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                            {doc.file ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDocument(doc.type)}
                                className="text-muted-foreground hover:text-red-400"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFileUpload(doc.type)}
                                className="gap-2"
                              >
                                <Upload className="w-4 h-4" />
                                Upload
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-primary">Document Security</p>
                        <p className="text-sm text-muted-foreground">
                          All documents are encrypted and securely stored. Your information is used solely for IPO verification and regulatory compliance.
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
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Details
                </Button>
                <Button
                  className="flex-1 btn-primary-gradient h-12"
                  onClick={handleSubmit}
                  disabled={loading || !canSubmit()}
                >
                  {loading ? 'Submitting...' : 'Submit IPO Application'}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default IPORegistration;
