import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YouTubePlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

const extractVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

const YouTubePlayer = ({ videoUrl, title, className = '' }: YouTubePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className={`bg-gradient-card rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground p-4">
          <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Video not available</p>
        </div>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div 
        className={`bg-gradient-card rounded-lg flex items-center justify-center cursor-pointer group relative overflow-hidden ${className}`}
        onClick={() => setIsPlaying(true)}
      >
        {/* YouTube Thumbnail */}
        <img
          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
          alt={title || 'Video thumbnail'}
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          onError={(e) => {
            // Fallback to lower quality thumbnail
            e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
        
        {/* Play Button */}
        <div className="relative z-10 w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
          <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
        </div>

        {/* Title Overlay */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-sm font-medium line-clamp-2">{title}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title || 'YouTube video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full absolute inset-0"
      />
    </div>
  );
};

export default YouTubePlayer;
