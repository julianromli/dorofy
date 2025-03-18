
import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface MusicPlayerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface Playlist {
  id: string;
  url: string;
  title: string;
  source: 'spotify' | 'youtube' | 'soundcloud' | 'unknown';
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isOpen, setIsOpen }) => {
  const [url, setUrl] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const savedPlaylists = localStorage.getItem('musicPlaylists');
      return savedPlaylists ? JSON.parse(savedPlaylists) : [];
    } catch (error) {
      console.error('Error loading playlists:', error);
      return [];
    }
  });
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Save playlists to localStorage
    localStorage.setItem('musicPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  const detectSource = (url: string): 'spotify' | 'youtube' | 'soundcloud' | 'unknown' => {
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('soundcloud.com')) return 'soundcloud';
    return 'unknown';
  };

  const getEmbedUrl = (url: string, source: 'spotify' | 'youtube' | 'soundcloud' | 'unknown'): string => {
    switch (source) {
      case 'spotify':
        // Convert Spotify URLs to embed format
        return url.replace('spotify.com', 'spotify.com/embed')
          .replace('/track/', '/track/')
          .replace('/playlist/', '/playlist/');
      
      case 'youtube':
        // Extract video ID from YouTube URLs
        const ytMatch = 
          url.match(/youtube\.com\/watch\?v=([^&]+)/) || 
          url.match(/youtu\.be\/([^?]+)/);
        const videoId = ytMatch ? ytMatch[1] : '';
        return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
      
      case 'soundcloud':
        // SoundCloud requires just the URL for embedding
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
      
      default:
        return '';
    }
  };

  const handleSavePlaylist = () => {
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    const source = detectSource(url);
    if (source === 'unknown') {
      toast.error('Unsupported URL. Please use Spotify, YouTube, or SoundCloud URLs.');
      return;
    }

    const embedUrl = getEmbedUrl(url, source);
    if (!embedUrl) {
      toast.error('Could not process the URL. Please check and try again.');
      return;
    }

    // Create a title based on the URL
    let title = 'Music';
    if (url.includes('spotify.com')) {
      title = 'Spotify Track';
      if (url.includes('/playlist/')) title = 'Spotify Playlist';
      if (url.includes('/album/')) title = 'Spotify Album';
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      title = 'YouTube Video';
      if (url.includes('playlist')) title = 'YouTube Playlist';
    } else if (url.includes('soundcloud.com')) {
      title = 'SoundCloud Track';
      if (url.includes('/sets/')) title = 'SoundCloud Playlist';
    }

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      url: embedUrl,
      title: title,
      source: source
    };

    setPlaylists([...playlists, newPlaylist]);
    setUrl('');
    toast.success('Playlist added successfully');
  };

  const playPlaylist = (id: string) => {
    setCurrentPlaylistId(id);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    
    // This part would be more complex in a real implementation
    // For simplicity, we're just toggling the state without actual control
    // You'd need platform-specific APIs for true control
    toast(`Music ${isPlaying ? 'paused' : 'playing'}`, {
      description: 'Native player controls will handle actual playback'
    });
  };

  const removePlaylist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === currentPlaylistId) {
      setCurrentPlaylistId(null);
      setIsPlaying(false);
    }
    setPlaylists(playlists.filter(playlist => playlist.id !== id));
    toast.success('Playlist removed');
  };

  const getSourceIcon = (source: 'spotify' | 'youtube' | 'soundcloud' | 'unknown') => {
    switch (source) {
      case 'spotify':
        return '🟢';
      case 'youtube':
        return '🔴';
      case 'soundcloud':
        return '🟠';
      default:
        return '🎵';
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white shadow-lg"
        aria-label={isOpen ? "Close music player" : "Open music player"}
      >
        <Music className={`h-5 w-5 ${isOpen ? 'text-primary' : 'text-white'}`} />
      </button>

      {/* Music Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="music-sidebar"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Music className="mr-2 h-5 w-5" /> Music Player
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10"
                  aria-label="Close music player"
                >
                  <X className="h-5 w-5 text-white/70" />
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-white/70 mb-2">Add Playlist</h3>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste Spotify, YouTube, or SoundCloud URL"
                  className="w-full p-2 mb-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                />
                <Button
                  onClick={handleSavePlaylist}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  <Save className="mr-2 h-4 w-4" /> Save Playlist
                </Button>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-sm font-medium text-white/70 mb-3">Your Playlists</h3>
              
              {playlists.length === 0 ? (
                <div className="text-white/50 text-sm p-3 text-center">
                  No playlists added yet
                </div>
              ) : (
                <div className="space-y-3">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className={`playlist-card cursor-pointer hover:bg-white/5 transition-colors ${currentPlaylistId === playlist.id ? 'border-primary/50' : ''}`}
                      onClick={() => playPlaylist(playlist.id)}
                    >
                      <div className="p-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="mr-2">{getSourceIcon(playlist.source)}</span>
                          <span className="text-white truncate">{playlist.title}</span>
                        </div>
                        <button
                          onClick={(e) => removePlaylist(playlist.id, e)}
                          className="text-white/50 hover:text-white/80"
                          aria-label="Remove playlist"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {currentPlaylistId === playlist.id && (
                        <div className="p-2 bg-black/50 border-t border-white/10">
                          <div className="aspect-video mb-2">
                            <iframe
                              ref={iframeRef}
                              src={isPlaying ? playlist.url : ''}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title="Music Player"
                            ></iframe>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                              <button className="player-button">
                                <SkipBack className="h-4 w-4" />
                              </button>
                              <button className="player-button" onClick={togglePlay}>
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </button>
                              <button className="player-button">
                                <SkipForward className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <button className="player-button">
                              <Volume2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 text-xs text-white/40 text-center">
                Controls might vary based on the music platform.
                <br />Some platforms may restrict embed features.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MusicPlayer;
