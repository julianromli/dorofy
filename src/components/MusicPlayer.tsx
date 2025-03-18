import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Save, X, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

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
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
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
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);

  useEffect(() => {
    localStorage.setItem('musicPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    if (isOpen || !currentPlaylistId) return;
    
    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.style.transform = "translateX(-100%)";
      sidebar.style.visibility = "hidden";
    }
  }, [isOpen, currentPlaylistId]);

  // Load YouTube IFrame API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      initializeYouTubePlayer();
    };

    return () => {
      (window as any).onYouTubeIframeAPIReady = undefined;
    };
  }, []);

  const initializeYouTubePlayer = () => {
    if (!iframeRef.current) return;

    const player = new (window as any).YT.Player(iframeRef.current, {
      events: {
        onReady: (event: YT.PlayerEvent) => {
          playerRef.current = event.target;
          playerRef.current.setVolume(volume);
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          if (event.data === (window as any).YT.PlayerState.ENDED) {
            playNext();
          }
        }
      }
    });
  };

  const detectSource = (url: string): 'spotify' | 'youtube' | 'soundcloud' | 'unknown' => {
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('soundcloud.com')) return 'soundcloud';
    return 'unknown';
  };

  const getEmbedUrl = (url: string, source: 'spotify' | 'youtube' | 'soundcloud' | 'unknown'): string => {
    switch (source) {
      case 'spotify':
        return url.replace('spotify.com', 'spotify.com/embed')
          .replace('/track/', '/track/')
          .replace('/playlist/', '/playlist/');
      
      case 'youtube':
        const ytMatch = 
          url.match(/youtube\.com\/watch\?v=([^&]+)/) || 
          url.match(/youtu\.be\/([^?]+)/);
        const videoId = ytMatch ? ytMatch[1] : '';
        
        if (url.includes('playlist?list=') || url.includes('&list=')) {
          const playlistMatch = url.match(/[?&]list=([^&]+)/);
          const playlistId = playlistMatch ? playlistMatch[1] : '';
          if (playlistId) {
            return `https://www.youtube.com/embed/${videoId}?list=${playlistId}&enablejsapi=1`;
          }
        }
        
        return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
      
      case 'soundcloud':
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

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      url: embedUrl,
      title: 'Music',
      source: source
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    setUrl('');
    toast.success('Playlist added successfully');
  };

  const playPlaylist = (id: string, index?: number) => {
    setCurrentPlaylistId(id);
    if (index !== undefined) {
      setCurrentPlaylistIndex(index);
    } else {
      const playlistIndex = playlists.findIndex(p => p.id === id);
      setCurrentPlaylistIndex(playlistIndex >= 0 ? playlistIndex : 0);
    }
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const playNext = () => {
    if (playlists.length === 0) return;
    
    const nextIndex = (currentPlaylistIndex + 1) % playlists.length;
    playPlaylist(playlists[nextIndex].id, nextIndex);
  };

  const playPrevious = () => {
    if (playlists.length === 0) return;
    
    const prevIndex = (currentPlaylistIndex - 1 + playlists.length) % playlists.length;
    playPlaylist(playlists[prevIndex].id, prevIndex);
  };

  const removePlaylist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === currentPlaylistId) {
      const currentIndex = playlists.findIndex(p => p.id === id);
      if (playlists.length > 1) {
        const nextPlaylist = playlists[(currentIndex + 1) % playlists.length];
        playPlaylist(nextPlaylist.id, (currentIndex + 1) % playlists.length);
      } else {
        setCurrentPlaylistId(null);
        setIsPlaying(false);
      }
    }
    
    setPlaylists(playlists.filter(playlist => playlist.id !== id));
    toast.success('Playlist removed');
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === id) return;
    
    const dragIndex = playlists.findIndex(p => p.id === draggedItem);
    const hoverIndex = playlists.findIndex(p => p.id === id);
    
    if (dragIndex === -1 || hoverIndex === -1) return;
    
    const newPlaylists = [...playlists];
    const [removed] = newPlaylists.splice(dragIndex, 1);
    newPlaylists.splice(hoverIndex, 0, removed);
    
    setPlaylists(newPlaylists);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-0 left-0 w-full sm:w-80 bg-white/10 backdrop-blur-lg border-r border-white/10 h-screen z-50"
          ref={sidebarRef}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Music Player</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter music URL..."
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <Button
                  onClick={handleSavePlaylist}
                  size="icon"
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>

              {currentPlaylistId && (
                <div className="space-y-4">
                  <div className="aspect-video w-full bg-black/20 rounded-lg overflow-hidden">
                    <iframe
                      ref={iframeRef}
                      src={playlists.find(p => p.id === currentPlaylistId)?.url}
                      className="w-full h-full"
                      allow="autoplay"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={playPrevious}
                        size="icon"
                        variant="ghost"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <SkipBack className="h-5 w-5" />
                      </Button>

                      <Button
                        onClick={togglePlay}
                        size="icon"
                        className="bg-white/10 hover:bg-white/20 text-white"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>

                      <Button
                        onClick={playNext}
                        size="icon"
                        variant="ghost"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <SkipForward className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="relative">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                        onClick={toggleMute}
                        onMouseEnter={() => setShowVolumeSlider(true)}
                      >
                        {isMuted ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </Button>

                      {showVolumeSlider && (
                        <div 
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-3 bg-white/10 backdrop-blur-lg rounded-lg"
                          onMouseEnter={() => setShowVolumeSlider(true)}
                          onMouseLeave={() => setShowVolumeSlider(false)}
                        >
                          <Slider
                            value={[isMuted ? 0 : volume]}
                            onValueChange={handleVolumeChange}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {playlists.map((playlist, index) => (
                  <div
                    key={playlist.id}
                    onClick={() => playPlaylist(playlist.id, index)}
                    className={`p-3 rounded-lg ${
                      currentPlaylistId === playlist.id
                        ? 'bg-white/20'
                        : 'bg-white/5 hover:bg-white/10'
                    } cursor-pointer transition-colors flex items-center justify-between group`}
                    draggable
                    onDragStart={() => handleDragStart(playlist.id)}
                    onDragOver={(e) => handleDragOver(e, playlist.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getSourceIcon(playlist.source)}</span>
                      <span className="text-white/90">Music {index + 1}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-4 h-4 text-white/40 opacity-0 group-hover:opacity-100 cursor-grab" />
                      <button
                        onClick={(e) => removePlaylist(playlist.id, e)}
                        className="text-white/40 hover:text-white/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MusicPlayer;
