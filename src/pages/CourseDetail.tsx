import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Play, Lock, Check, ArrowLeft, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/landing/Navbar';
import YouTubePlayer from '@/components/YouTubePlayer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  lessons_count: number;
  difficulty: string;
  category: string;
  is_paid: boolean;
  price: number;
  youtube_playlist_url: string | null;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
  youtube_url: string | null;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const fetchCourseData = async () => {
    const [courseRes, lessonsRes] = await Promise.all([
      supabase.from('courses').select('*').eq('id', id).single(),
      supabase.from('lessons').select('*').eq('course_id', id).order('order_index')
    ]);

    if (courseRes.data) setCourse(courseRes.data);
    if (lessonsRes.data) {
      setLessons(lessonsRes.data);
      // Set first lesson as active if it has a YouTube URL
      const firstWithVideo = lessonsRes.data.find(l => l.youtube_url);
      if (firstWithVideo) setActiveLesson(firstWithVideo);
    }
    
    if (user) {
      const [progressData, paymentData] = await Promise.all([
        supabase
          .from('user_course_progress')
          .select('progress_percent')
          .eq('user_id', user.id)
          .eq('course_id', id)
          .single(),
        supabase
          .from('course_payments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', id)
          .eq('payment_status', 'completed')
          .single()
      ]);
      
      if (progressData.data) setProgress(progressData.data.progress_percent || 0);
      if (paymentData.data) setHasPurchased(true);
    }
    
    setLoading(false);
  };

  const handlePurchaseCourse = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!course?.is_paid || course.price === 0) {
      setHasPurchased(true);
      toast({
        title: 'Course unlocked!',
        description: 'You now have access to all lessons'
      });
      return;
    }

    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          courseId: course.id,
          courseName: course.title,
          amount: course.price,
          userId: user.id,
          successUrl: `${window.location.origin}/courses/${course.id}?success=true`,
          cancelUrl: `${window.location.origin}/courses/${course.id}?canceled=true`
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase failed',
        description: 'Unable to process payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setPurchasing(false);
    }
  };

  const handleStartLesson = async (lesson: Lesson) => {
    // Check if lesson is accessible
    const canAccess = lesson.is_free || hasPurchased || !course?.is_paid;
    
    if (!canAccess && !user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to access this lesson',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    if (!canAccess) {
      toast({
        title: 'Purchase required',
        description: 'Please purchase the course to access this lesson',
        variant: 'destructive'
      });
      return;
    }

    // Set active lesson for video playback
    setActiveLesson(lesson);

    toast({
      title: 'Lesson started',
      description: `Now playing: ${lesson.title}`
    });

    // Track lesson completion
    if (user && course) {
      setCompletedLessons(prev => {
        if (prev.includes(lesson.id)) return prev;
        return [...prev, lesson.id];
      });
      const newProgress = Math.round(((completedLessons.length + 1) / lessons.length) * 100);
      setProgress(newProgress);
      
      await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: course.id,
          progress_percent: newProgress,
          lesson_id: lesson.id
        }, { onConflict: 'user_id,course_id' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-secondary/50 rounded w-1/3" />
            <div className="h-6 bg-secondary/50 rounded w-2/3" />
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-secondary/50 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-display">Course not found</h1>
          <Button onClick={() => navigate('/courses')} className="mt-4">
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/courses')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary/20 text-primary">{course.difficulty}</Badge>
                  {course.category && <Badge variant="outline">{course.category}</Badge>}
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  {course.title}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {course.description}
                </p>
              </div>

              <div className="flex items-center gap-6 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {course.duration_hours} hours
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {lessons.length} lessons
                </span>
              </div>

            {/* Video Player Section */}
            {activeLesson?.youtube_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6"
              >
                <div className="glass-card rounded-xl overflow-hidden">
                  <YouTubePlayer
                    videoUrl={activeLesson.youtube_url}
                    title={activeLesson.title}
                    className="aspect-video"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{activeLesson.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{activeLesson.description}</p>
                  </div>
                </div>
              </motion.div>
            )}

              {user && progress > 0 && (
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Lessons List */}
              <div className="space-y-4">
                <h2 className="text-xl font-display font-semibold">Course Content</h2>
                
              {lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const canAccess = lesson.is_free || hasPurchased || !course?.is_paid;
                  const isActive = activeLesson?.id === lesson.id;
                  
                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleStartLesson(lesson)}
                      className={`glass-card rounded-xl p-4 cursor-pointer group hover:border-primary/50 transition-all ${
                        isCompleted ? 'border-primary/30 bg-primary/5' : ''
                      } ${isActive ? 'border-primary ring-2 ring-primary/20' : ''} ${!canAccess ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-primary text-primary-foreground' :
                          canAccess ? 'bg-secondary' : 'bg-muted'
                        }`}>
                          {isCompleted ? (
                            <Check className="h-5 w-5" />
                          ) : canAccess ? (
                            <Play className="h-5 w-5" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium group-hover:text-primary transition-colors">
                              {lesson.title}
                            </h3>
                            {lesson.is_free && (
                              <Badge variant="outline" className="text-xs">Free</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {lesson.description}
                          </p>
                        </div>
                        
                        <span className="text-sm text-muted-foreground">
                          {lesson.duration_minutes} min
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-xl p-6 sticky top-24">
                {/* Course Preview Video */}
                <div className="aspect-video bg-gradient-card rounded-lg mb-6 overflow-hidden">
                  {course.youtube_playlist_url ? (
                    <YouTubePlayer
                      videoUrl={course.youtube_playlist_url}
                      title={`${course.title} - Preview`}
                      className="h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-16 w-16 text-primary/50" />
                    </div>
                  )}
                </div>

                {/* Price and Purchase */}
                {course.is_paid && course.price && course.price > 0 && !hasPurchased && (
                  <div className="mb-4 text-center">
                    <p className="text-3xl font-bold text-foreground">₹{course.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">One-time payment</p>
                  </div>
                )}
                
                {!user ? (
                  <Button 
                    className="w-full btn-primary-gradient h-12"
                    onClick={() => navigate('/auth')}
                  >
                    Sign in to Enroll
                  </Button>
                ) : hasPurchased || !course.is_paid ? (
                  <Button 
                    className="w-full btn-primary-gradient h-12"
                    onClick={() => lessons[0] && handleStartLesson(lessons[0])}
                  >
                    {progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </Button>
                ) : (
                  <Button 
                    className="w-full btn-primary-gradient h-12 gap-2"
                    onClick={handlePurchaseCourse}
                    disabled={purchasing}
                  >
                    {purchasing ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )}
                    {purchasing ? 'Processing...' : 'Buy Now'}
                  </Button>
                )}
                
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{course.duration_hours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lessons</span>
                    <span>{lessons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level</span>
                    <span className="capitalize">{course.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseDetail;
