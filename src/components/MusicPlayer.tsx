import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Save, X, GripVertical } from 'lucide-react';
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
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('musicPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement && isOpen) {
        const sidebar = sidebarRef.current;
        if (sidebar) {
          sidebar.style.transform = "translateX(0)";
          sidebar.style.visibility = "visible";
          sidebar.style.position = "fixed";
          sidebar.style.zIndex = "9999";
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || !currentPlaylistId) return;
    
    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.style.transform = "translateX(-100%)";
      sidebar.style.visibility = "hidden";
    }
  }, [isOpen, currentPlaylistId]);

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
            return `https://www.youtube.com/embed/${videoId}?list=${playlistId}&autoplay=1`;
          }
        }
        
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      
      case 'soundcloud':
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
      
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
    setIsPlaying(!isPlaying);
    
    toast(`Music ${isPlaying ? 'paused' : 'playing'}`, {
      description: 'Native player controls will handle actual playback'
    });
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
    <>
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 left-4 z-50 p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white shadow-lg"
        aria-label={isOpen ? "Minimize music player" : "Open music player"}
      >
        <Music className={`h-5 w-5 ${isOpen ? 'text-primary' : 'text-white'}`} />
      </button>

      <div 
        ref={sidebarRef}
        className={`music-sidebar ${isOpen ? 'music-sidebar-open' : 'music-sidebar-closed'}`}
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Music className="mr-2 h-5 w-5" /> Music Player
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10"
              aria-label="Minimize music player"
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
              {playlists.map((playlist, index) => (
                <div
                  key={playlist.id}
                  className={`playlist-card cursor-pointer hover:bg-white/5 transition-colors ${currentPlaylistId === playlist.id ? 'border-primary/50' : ''} ${draggedItem === playlist.id ? 'dragging' : ''}`}
                  onClick={() => playPlaylist(playlist.id, index)}
                  draggable
                  onDragStart={() => handleDragStart(playlist.id)}
                  onDragOver={(e) => handleDragOver(e, playlist.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-2 flex items-center">
                        <GripVertical className="h-4 w-4 text-white/30 mr-2 cursor-grab" />
                        <span className="playlist-number">{index + 1}</span>
                      </div>
                      <span className="text-white truncate ml-2">{playlist.title}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">{getSourceIcon(playlist.source)}</span>
                      <button
                        onClick={(e) => removePlaylist(playlist.id, e)}
                        className="text-white/50 hover:text-white/80"
                        aria-label="Remove playlist"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
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
                          <button className="player-button" onClick={(e) => { e.stopPropagation(); playPrevious(); }}>
                            <SkipBack className="h-4 w-4" />
                          </button>
                          <button className="player-button" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                          <button className="player-button" onClick={(e) => { e.stopPropagation(); playNext(); }}>
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
      </div>
    </>
  );
};

export default MusicPlayer;
