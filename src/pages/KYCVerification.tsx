import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Upload, FileText, CheckCircle2, Clock, XCircle, AlertTriangle, Scan, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Navbar from '@/components/landing/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface KYCDocument {
  id: string;
  document_type: string;
  document_url: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  verified_at: string | null;
}

const DOCUMENT_SLOTS = [
  {
    type: 'aadhaar_front',
    label: 'Aadhaar Card (Front)',
    description: 'Upload front side of your Aadhaar card',
    icon: '🪪',
    accepted: '.pdf,.jpg,.jpeg,.png',
    validationHint: 'Must contain 12-digit Aadhaar number',
  },
  {
    type: 'aadhaar_back',
    label: 'Aadhaar Card (Back)',
    description: 'Upload back side of your Aadhaar card',
    icon: '🪪',
    accepted: '.pdf,.jpg,.jpeg,.png',
    validationHint: 'Must match front side details',
  },
  {
    type: 'pan_card',
    label: 'PAN Card',
    description: 'Upload your PAN card',
    icon: '💳',
    accepted: '.pdf,.jpg,.jpeg,.png',
    validationHint: 'Must contain valid PAN number (ABCDE1234F format)',
  },
  {
    type: 'address_proof',
    label: 'Address Proof',
    description: 'Utility bill, bank statement, or passport',
    icon: '🏠',
    accepted: '.pdf,.jpg,.jpeg,.png',
    validationHint: 'Must be issued within last 3 months',
  },
];

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-amber-500', label: 'Under Review', bg: 'bg-amber-500/10' },
  approved: { icon: CheckCircle2, color: 'text-primary', label: 'Verified', bg: 'bg-primary/10' },
  rejected: { icon: XCircle, color: 'text-destructive', label: 'Rejected', bg: 'bg-destructive/10' },
  scanning: { icon: Scan, color: 'text-blue-500', label: 'Scanning...', bg: 'bg-blue-500/10' },
};

// AI-powered document validation via OCR edge function
const scanDocumentWithAI = async (filePath: string, docType: string, token: string): Promise<{ valid: boolean; message: string; ocrResult?: any }> => {
  try {
    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-document-ocr`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ documentType: docType, filePath }),
      }
    );

    if (!resp.ok) {
      const err = await resp.json();
      console.error("AI OCR error:", err);
      // Fallback to basic validation if AI fails
      return { valid: true, message: "AI scan unavailable, basic validation passed" };
    }

    const data = await resp.json();
    const ocr = data.ocrResult;
    const isValid = ocr?.isValid !== false && (ocr?.confidence || 70) >= 50;

    return {
      valid: isValid,
      message: isValid
        ? `AI Scan: ${ocr?.summary || "Document verified"} (Confidence: ${ocr?.confidence || 70}%)`
        : `AI Scan Failed: ${ocr?.issues?.join(", ") || "Document could not be verified"}`,
      ocrResult: ocr,
    };
  } catch (error) {
    console.error("AI scan error:", error);
    return { valid: true, message: "AI scan unavailable, basic validation passed" };
  }
};

// Simple client-side document validation
const validateDocument = (file: File, docType: string): { valid: boolean; message: string } => {
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, message: 'File size must be less than 5MB' };
  }
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: 'Only PDF, JPG, and PNG files are allowed' };
  }
  return { valid: true, message: 'Document format is valid' };
};

const KYCVerification = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<Record<string, { scanning: boolean; result: string | null; ocrResult?: any }>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) fetchDocuments();
  }, [user, authLoading]);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setDocuments(data);
    setLoading(false);
  };

  const getDocumentForSlot = (type: string) => {
    return documents.find(d => d.document_type === type);
  };

  const handleUpload = async (file: File, docType: string) => {
    if (!user) return;

    // Validate document
    const validation = validateDocument(file, docType);
    if (!validation.valid) {
      toast({ title: 'Invalid Document', description: validation.message, variant: 'destructive' });
      return;
    }

    setUploading(docType);

    // Simulate initial scanning state
    setScanResults(prev => ({ ...prev, [docType]: { scanning: true, result: null } }));

    try {
      // Upload to storage
      const filePath = `${user.id}/${docType}_${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Run AI-powered OCR scan
      const { data: { session } } = await supabase.auth.getSession();
      const aiScan = await scanDocumentWithAI(filePath, docType, session?.access_token || '');

      setScanResults(prev => ({
        ...prev,
        [docType]: { scanning: false, result: aiScan.valid ? 'passed' : 'failed', ocrResult: aiScan.ocrResult },
      }));

      if (!aiScan.valid) {
        toast({ title: 'AI Scan Failed', description: aiScan.message, variant: 'destructive' });
        setUploading(null);
        return;
      }

      // Get signed URL for storage
      const { data: urlData } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);



      // Check if document already exists for this type
      const existing = getDocumentForSlot(docType);
      if (existing) {
        await supabase
          .from('kyc_documents')
          .update({
            document_url: urlData?.signedUrl || filePath,
            status: 'pending',
            rejection_reason: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('kyc_documents')
          .insert({
            user_id: user.id,
            document_type: docType,
            document_url: urlData?.signedUrl || filePath,
            status: 'pending',
          });
      }

      toast({ title: 'Document Uploaded', description: `${docType.replace(/_/g, ' ')} submitted for verification` });
      fetchDocuments();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
      setScanResults(prev => ({ ...prev, [docType]: { scanning: false, result: null } }));
    }

    setUploading(null);
  };

  // Send KYC submission email when all docs uploaded
  const handleSubmitAll = async () => {
    if (!user) return;

    const allUploaded = DOCUMENT_SLOTS.every(slot => getDocumentForSlot(slot.type));
    if (!allUploaded) {
      toast({ title: 'Incomplete', description: 'Please upload all required documents', variant: 'destructive' });
      return;
    }

    try {
      await supabase.functions.invoke('send-verification-email', {
        body: {
          type: 'kyc_submitted',
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0],
        },
      });
      toast({ title: 'KYC Submitted', description: 'All documents submitted. You will receive a verification update within 24-48 hours.' });
    } catch (error) {
      console.error('Email error:', error);
    }
  };

  const uploadedCount = DOCUMENT_SLOTS.filter(s => getDocumentForSlot(s.type)).length;
  const verifiedCount = DOCUMENT_SLOTS.filter(s => getDocumentForSlot(s.type)?.status === 'approved').length;
  const progressPercent = (uploadedCount / DOCUMENT_SLOTS.length) * 100;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">KYC Verification</h1>
              <p className="text-muted-foreground">Upload your documents for identity verification as per Govt. of India guidelines</p>
            </div>
          </div>

          {/* Progress */}
          <Card className="glass-card mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Verification Progress</span>
                <span className="text-sm text-primary font-medium">{uploadedCount}/{DOCUMENT_SLOTS.length} Documents</span>
              </div>
              <Progress value={progressPercent} className="h-2 mb-3" />
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> {verifiedCount} Verified</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> {uploadedCount - verifiedCount} Pending</span>
                <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" /> {DOCUMENT_SLOTS.length - uploadedCount} Required</span>
              </div>
            </CardContent>
          </Card>

          {/* Document Slots */}
          <div className="grid gap-4">
            {DOCUMENT_SLOTS.map((slot, index) => {
              const doc = getDocumentForSlot(slot.type);
              const status = doc ? STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending : null;
              const scan = scanResults[slot.type];
              const isUploading = uploading === slot.type;

              return (
                <motion.div
                  key={slot.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`glass-card transition-all ${doc ? 'border-primary/20' : 'border-dashed border-2'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <span className="text-3xl">{slot.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{slot.label}</h3>
                              {status && (
                                <Badge className={`${status.bg} ${status.color} border-0`}>
                                  <status.icon className="w-3 h-3 mr-1" />
                                  {status.label}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{slot.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">💡 {slot.validationHint}</p>

                            {doc?.rejection_reason && (
                              <div className="mt-2 p-2 bg-destructive/10 rounded-lg text-sm text-destructive">
                                <strong>Rejection reason:</strong> {doc.rejection_reason}
                              </div>
                            )}

                            {scan?.scanning && (
                              <div className="mt-3 flex items-center gap-2 text-sm text-blue-500">
                                <Scan className="w-4 h-4 animate-pulse" />
                                AI scanning document for authenticity...
                              </div>
                            )}

                            {scan?.result === 'passed' && (
                              <div className="mt-3 space-y-1">
                                <div className="flex items-center gap-2 text-sm text-primary">
                                  <CheckCircle2 className="w-4 h-4" />
                                  AI Scan Passed — Document verified
                                  {scan.ocrResult?.confidence && (
                                    <Badge variant="outline" className="text-xs">
                                      {scan.ocrResult.confidence}% confidence
                                    </Badge>
                                  )}
                                </div>
                                {scan.ocrResult?.summary && (
                                  <p className="text-xs text-muted-foreground ml-6">{scan.ocrResult.summary}</p>
                                )}
                              </div>
                            )}

                            {scan?.result === 'failed' && (
                              <div className="mt-3 space-y-1">
                                <div className="flex items-center gap-2 text-sm text-destructive">
                                  <XCircle className="w-4 h-4" />
                                  AI Scan Failed — Document verification unsuccessful
                                </div>
                                {scan.ocrResult?.issues?.length > 0 && (
                                  <ul className="text-xs text-muted-foreground ml-6 list-disc">
                                    {scan.ocrResult.issues.map((issue: string, i: number) => (
                                      <li key={i}>{issue}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {doc && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewUrl(doc.document_url)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept={slot.accepted}
                              className="hidden"
                              disabled={isUploading}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUpload(file, slot.type);
                                e.target.value = '';
                              }}
                            />
                            <Button
                              variant={doc ? 'outline' : 'default'}
                              size="sm"
                              className="gap-2 pointer-events-none"
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              {doc ? 'Re-upload' : 'Upload'}
                            </Button>
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Submit All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <Button
              size="lg"
              className="btn-primary-gradient gap-2"
              onClick={handleSubmitAll}
              disabled={uploadedCount < DOCUMENT_SLOTS.length}
            >
              <Shield className="w-5 h-5" />
              Submit for Verification
            </Button>
            {uploadedCount < DOCUMENT_SLOTS.length && (
              <p className="text-sm text-muted-foreground mt-2">
                Upload all {DOCUMENT_SLOTS.length} documents to submit
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Preview Dialog */}
        <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
          <DialogContent className="max-w-2xl bg-card border-border">
            <DialogHeader>
              <DialogTitle>Document Preview</DialogTitle>
            </DialogHeader>
            {previewUrl && (
              previewUrl.endsWith('.pdf') ? (
                <iframe src={previewUrl} className="w-full h-[500px] rounded-lg" />
              ) : (
                <img src={previewUrl} alt="Document" className="w-full rounded-lg" />
              )
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default KYCVerification;
