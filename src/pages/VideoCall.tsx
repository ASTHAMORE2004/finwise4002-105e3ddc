import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users, Copy, Check, Calendar, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/landing/Navbar';
import { TranscriptionPanel } from '@/components/TranscriptionPanel';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

interface VideoSession {
  id: string;
  room_id: string;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  status: string;
  topic: string | null;
}

const VideoCall = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [sessions, setSessions] = useState<VideoSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchSessions();
    }
  }, [user, authLoading]);

  const fetchSessions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('video_sessions')
      .select('*')
      .or(`host_user_id.eq.${user.id},participant_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setSessions(data);
    }
    setLoading(false);
  };

  const generateRoomId = () => {
    return `finwise-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`;
  };

  const createSession = async () => {
    if (!user) return;
    
    const roomId = generateRoomId();
    
    const { data, error } = await supabase
      .from('video_sessions')
      .insert({
        host_user_id: user.id,
        room_id: roomId,
        topic: newTopic || 'Financial Consultation',
        scheduled_at: scheduledTime ? new Date(scheduledTime).toISOString() : null,
        status: scheduledTime ? 'scheduled' : 'active'
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Failed to create session', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Session created!', description: 'Share the room ID to invite others' });
      setSessions(prev => [data, ...prev]);
      setDialogOpen(false);
      setNewTopic('');
      setScheduledTime('');
      
      if (!scheduledTime) {
        startCall(roomId);
      }
    }
  };

  const startCall = async (roomId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setCurrentRoom(roomId);
      setInCall(true);
      
      await supabase
        .from('video_sessions')
        .update({ started_at: new Date().toISOString(), status: 'active' })
        .eq('room_id', roomId);
        
    } catch (error) {
      toast({ title: 'Camera access denied', description: 'Please allow camera and microphone access', variant: 'destructive' });
    }
  };

  const joinCall = async () => {
    if (!joinRoomId.trim()) {
      toast({ title: 'Enter Room ID', description: 'Please enter a valid room ID', variant: 'destructive' });
      return;
    }
    
    await startCall(joinRoomId.trim());
  };

  const endCall = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (currentRoom) {
      await supabase
        .from('video_sessions')
        .update({ ended_at: new Date().toISOString(), status: 'ended' })
        .eq('room_id', currentRoom);
    }
    
    setInCall(false);
    setCurrentRoom(null);
    fetchSessions();
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

  if (inCall) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-screen flex">
          {/* Video Area */}
          <div className={`flex-1 flex flex-col ${showTranscript ? 'lg:w-2/3' : 'w-full'}`}>
            <div className="flex-1 relative bg-secondary/20">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                  <div className="text-center">
                    <VideoOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Camera is off</p>
                  </div>
                </div>
              )}
              
              {/* Room Info */}
              <div className="absolute top-4 left-4 glass-card rounded-lg px-4 py-2 flex items-center gap-3">
                <Badge variant="outline" className="bg-primary/20 text-primary">Live</Badge>
                <span className="text-sm font-mono">{currentRoom}</span>
                <button onClick={copyRoomId} className="hover:text-primary">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Transcript Toggle */}
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="absolute top-4 right-4 glass-card rounded-lg px-3 py-2 hover:bg-primary/20 transition-colors"
              >
                <FileText className="h-5 w-5" />
              </button>
            </div>

            {/* Controls */}
            <div className="p-6 bg-card border-t border-border">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={audioEnabled ? 'outline' : 'destructive'}
                  size="lg"
                  className="rounded-full w-14 h-14"
                  onClick={toggleAudio}
                >
                  {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>
                
                <Button
                  variant={videoEnabled ? 'outline' : 'destructive'}
                  size="lg"
                  className="rounded-full w-14 h-14"
                  onClick={toggleVideo}
                >
                  {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </Button>
                
                <Button
                  variant="destructive"
                  size="lg"
                  className="rounded-full w-14 h-14"
                  onClick={endCall}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* Transcription Panel */}
          {showTranscript && (
            <div className="hidden lg:block w-1/3 border-l border-border p-4">
              <TranscriptionPanel 
                audioStream={streamRef.current} 
                isCallActive={inCall}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient-primary">{t('videoCall.title').split(' ')[0]}</span> {t('videoCall.title').split(' ').slice(1).join(' ')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('videoCall.subtitle')}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t('videoCall.joinCall')}
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Room ID"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  className="bg-secondary/50"
                />
                <Button onClick={joinCall} className="btn-primary-gradient">
                  Join
                </Button>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <div className="glass-card rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-all">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    {t('videoCall.createSession')}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Start a new video call or schedule one for later
                  </p>
                </div>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Create Video Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Topic (Optional)</Label>
                    <Input
                      placeholder="Financial Planning Discussion"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Schedule for Later (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createSession} className="flex-1 btn-primary-gradient">
                      {scheduledTime ? t('videoCall.scheduleSession') : t('videoCall.startNow')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Sessions List */}
          <div>
            <h2 className="text-2xl font-display font-semibold mb-6">Your Sessions</h2>
            
            {sessions.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No video sessions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-card rounded-full flex items-center justify-center">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{session.topic || 'Video Call'}</h3>
                          <p className="text-sm text-muted-foreground font-mono">{session.room_id}</p>
                          {session.scheduled_at && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(session.scheduled_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={
                          session.status === 'active' ? 'bg-primary/20 text-primary' :
                          session.status === 'scheduled' ? 'bg-accent/20 text-accent' :
                          'bg-muted text-muted-foreground'
                        }>
                          {session.status}
                        </Badge>
                        
                        {session.status !== 'ended' && (
                          <Button size="sm" onClick={() => startCall(session.room_id)}>
                            <Phone className="h-4 w-4 mr-2" />
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoCall;
