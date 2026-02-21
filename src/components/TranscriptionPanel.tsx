import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Mic, MicOff, Download, Copy, Check, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface TranscriptEntry {
  id: string;
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface TranscriptionPanelProps {
  audioStream: MediaStream | null;
  isCallActive: boolean;
}

export function TranscriptionPanel({ audioStream, isCallActive }: TranscriptionPanelProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [interimText, setInterimText] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for browser support
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          setTranscripts(prev => [...prev, {
            id: `${Date.now()}-${i}`,
            text: text.trim(),
            timestamp: new Date(),
            isFinal: true,
          }]);
          setInterimText('');
        } else {
          interim += text;
        }
      }
      
      if (interim) {
        setInterimText(interim);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast({
          title: 'Microphone access denied',
          description: 'Please allow microphone access for transcription',
          variant: 'destructive',
        });
      }
      setIsTranscribing(false);
    };

    recognition.onend = () => {
      if (isTranscribing && isCallActive) {
        // Restart recognition if it ends unexpectedly
        try {
          recognition.start();
        } catch (e) {
          console.warn('Could not restart recognition');
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isCallActive, isTranscribing, toast]);

  useEffect(() => {
    // Auto-scroll to bottom when new transcripts arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts, interimText]);

  const toggleTranscription = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Not supported',
        description: 'Speech recognition is not supported in your browser. Try Chrome or Edge.',
        variant: 'destructive',
      });
      return;
    }

    if (isTranscribing) {
      recognitionRef.current.stop();
      setIsTranscribing(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsTranscribing(true);
        toast({
          title: 'Transcription started',
          description: 'Speech-to-text is now active',
        });
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  };

  const copyTranscript = () => {
    const fullText = transcripts.map(t => t.text).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!', description: 'Transcript copied to clipboard' });
  };

  const downloadTranscript = () => {
    const fullText = transcripts.map(t => 
      `[${t.timestamp.toLocaleTimeString()}] ${t.text}`
    ).join('\n');
    
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'Downloaded!', description: 'Transcript saved to file' });
  };

  const generateSummary = async () => {
    if (transcripts.length === 0) return;
    setSummaryLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const fullText = transcripts.map(t => t.text).join('\n');
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-meeting-summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ transcript: fullText, meetingType: "investor-startup" }),
        }
      );
      if (!resp.ok) throw new Error((await resp.json()).error || "Summary failed");
      const data = await resp.json();
      setAiSummary(data.summary);
    } catch (error: any) {
      toast({ title: 'Summary Failed', description: error.message, variant: 'destructive' });
    } finally {
      setSummaryLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-xl p-4 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Live Transcript
        </h3>
        <div className="flex items-center gap-2">
          {transcripts.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copyTranscript}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={generateSummary}
                disabled={summaryLoading || transcripts.length === 0}
                title="AI Summary"
              >
                {summaryLoading ? <Sparkles className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={downloadTranscript}
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant={isTranscribing ? 'destructive' : 'default'}
            size="sm"
            onClick={toggleTranscription}
            disabled={!isCallActive}
            className={isTranscribing ? '' : 'btn-primary-gradient'}
          >
            {isTranscribing ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        {transcripts.length === 0 && !interimText ? (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No transcript yet</p>
            <p className="text-xs mt-1">Start transcription to see live captions</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {transcripts.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary/50 rounded-lg p-3"
                >
                  <p className="text-sm">{entry.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(entry.timestamp)}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {interimText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-primary/10 border border-primary/20 rounded-lg p-3"
              >
                <p className="text-sm text-muted-foreground italic">{interimText}...</p>
              </motion.div>
            )}
          </div>
        )}
      </ScrollArea>

      {aiSummary && (
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg max-h-48 overflow-y-auto">
          <h4 className="text-xs font-semibold text-primary flex items-center gap-1 mb-2">
            <Brain className="w-3 h-3" /> AI Meeting Summary
          </h4>
          <div className="prose prose-sm prose-invert max-w-none text-xs">
            <ReactMarkdown>{aiSummary}</ReactMarkdown>
          </div>
        </div>
      )}

      {isTranscribing && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-primary">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Listening...
        </div>
      )}
    </motion.div>
  );
}

// SpeechRecognition is available globally through lib.dom.d.ts
