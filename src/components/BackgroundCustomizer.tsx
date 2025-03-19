import React, { useState, useRef, useEffect } from 'react';
import { Image, Video, Upload, Link, X, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface BackgroundCustomizerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface BackgroundData {
  type: 'image' | 'video' | 'youtube';
  url: string;
  id: string;
}

const BackgroundCustomizer: React.FC<BackgroundCustomizerProps> = ({ isOpen, setIsOpen }) => {
  const [url, setUrl] = useState('');
  const [backgrounds, setBackgrounds] = useState<BackgroundData[]>(() => {
    try {
      const savedBackgrounds = localStorage.getItem('backgroundData');
      return savedBackgrounds ? JSON.parse(savedBackgrounds) : [];
    } catch (error) {
      console.error('Error loading backgrounds:', error);
      return [];
    }
  });
  const [activeBackgroundId, setActiveBackgroundId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('activeBackgroundId');
    } catch (error) {
      return null;
    }
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Save backgrounds to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('backgroundData', JSON.stringify(backgrounds));
    
    // Dispatch a custom event for the same tab to detect changes
    window.dispatchEvent(new Event('backgroundDataChanged'));
  }, [backgrounds]);

  // Save active background ID to localStorage whenever it changes
  useEffect(() => {
    if (activeBackgroundId) {
      localStorage.setItem('activeBackgroundId', activeBackgroundId);
    } else {
      localStorage.removeItem('activeBackgroundId');
    }
    
    // Dispatch a custom event for the same tab to detect changes
    window.dispatchEvent(new Event('backgroundDataChanged'));
  }, [activeBackgroundId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      
      if (!document.fullscreenElement) {
        updateSidebarVisibility(isOpen);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    const handleDorofyFullscreenChanged = (e: CustomEvent) => {
      setIsFullscreen(e.detail.isFullscreen);
      if (!e.detail.isFullscreen) {
        updateSidebarVisibility(isOpen);
      }
    };
    
    document.addEventListener('dorofyFullscreenChanged', handleDorofyFullscreenChanged as EventListener);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('dorofyFullscreenChanged', handleDorofyFullscreenChanged as EventListener);
    };
  }, [isOpen]);

  useEffect(() => {
    updateSidebarVisibility(isOpen);
  }, [isOpen]);

  const updateSidebarVisibility = (visible: boolean) => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    if (visible) {
      sidebar.style.transform = "translateX(0)";
      sidebar.style.visibility = "visible";
      if (isFullscreen) {
        sidebar.style.position = "fixed";
        sidebar.style.zIndex = "9999";
      }
    } else {
      sidebar.style.transform = "translateX(-100%)";
      sidebar.style.visibility = "hidden";
    }
  };

  const validateYouTubeUrl = (url: string): string | null => {
    // Extract video ID from various YouTube URL formats
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      // Enhanced embed URL with more parameters for better background experience
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${match[1]}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`;
    }
    
    return null;
  };

  const getTypeFromUrl = (url: string): 'image' | 'video' | 'youtube' => {
    if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return 'image';
    } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return 'video';
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    
    // Default to image if can't determine
    return 'image';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const fileUrl = event.target.result as string;
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        
        const newBackground: BackgroundData = {
          id: Date.now().toString(),
          type: fileType,
          url: fileUrl
        };

        setBackgrounds(prev => [...prev, newBackground]);
        setActiveBackgroundId(newBackground.id);
        toast.success(`Background ${fileType} uploaded successfully`);
      }
    };
    
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      reader.readAsDataURL(file);
    } else {
      toast.error('Unsupported file type. Please upload an image or video file.');
    }
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      let finalUrl = url;
      let type = getTypeFromUrl(url);
      
      // Handle YouTube URLs
      if (type === 'youtube') {
        const embedUrl = validateYouTubeUrl(url);
        if (!embedUrl) {
          toast.error('Invalid YouTube URL. Please provide a valid YouTube link.');
          return;
        }
        finalUrl = embedUrl;
      }

      const newBackground: BackgroundData = {
        id: Date.now().toString(),
        type,
        url: finalUrl
      };

      setBackgrounds(prev => [...prev, newBackground]);
      setActiveBackgroundId(newBackground.id);
      setUrl('');
      toast.success('Background added successfully');
    } catch (error) {
      toast.error('Error adding background. Please try again.');
      console.error('Error adding background:', error);
    }
  };

  const removeBackground = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setBackgrounds(prev => prev.filter(bg => bg.id !== id));
    
    if (activeBackgroundId === id) {
      // If we're removing the active background, clear it
      setActiveBackgroundId(null);
      toast.success('Background removed and default theme restored');
    } else {
      toast.success('Background removed');
    }
  };

  const setBackground = (id: string) => {
    const background = backgrounds.find(bg => bg.id === id);
    if (!background) return;
    
    setActiveBackgroundId(id);
    toast.success('Background applied');
  };

  const clearBackground = () => {
    setActiveBackgroundId(null);
    toast.success('Background cleared and default theme restored');
  };

  const toggleSidebar = () => {
    setTimeout(() => {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      updateSidebarVisibility(newIsOpen);
      
      if (!newIsOpen && toggleButtonRef.current) {
        toggleButtonRef.current.focus();
      }
    }, 10);
  };

  const getBackgroundTypeIcon = (type: 'image' | 'video' | 'youtube') => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4 mr-2" />;
      case 'video':
        return <Video className="h-4 w-4 mr-2" />;
      case 'youtube':
        return <div className="mr-2 text-red-500 text-xs">▶</div>;
      default:
        return <Image className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <>
      <button
        ref={toggleButtonRef}
        onClick={toggleSidebar}
        className={`fixed bottom-16 left-4 z-[9999] p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white shadow-lg ${isFullscreen ? 'fullscreen-toggle' : ''}`}
        aria-label={isOpen ? "Close background customizer" : "Open background customizer"}
      >
        <Image className={`h-5 w-5 ${isOpen ? 'text-primary' : 'text-white'}`} />
      </button>

      <div 
        ref={sidebarRef}
        className={`background-sidebar ${isOpen ? 'background-sidebar-open' : 'background-sidebar-closed'} ${isFullscreen ? 'fullscreen-sidebar' : ''}`}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Image className="mr-2 h-5 w-5" /> Background Customizer
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10"
              aria-label="Close background customizer"
            >
              <X className="h-5 w-5 text-white/70" />
            </button>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white/70 mb-2">Upload Image or Video</h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*"
              className="hidden"
              id="background-file-input"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mb-2 bg-white/10 hover:bg-white/20 text-white"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload File
            </Button>
            
            <h3 className="text-sm font-medium text-white/70 mb-2 mt-4">Or Paste URL</h3>
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Image, video, or YouTube URL"
                className="flex-1 p-2 bg-white/5 border border-white/10 rounded text-white text-sm"
              />
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Link className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-white/70">Your Backgrounds</h3>
            {activeBackgroundId && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearBackground}
                className="h-7 text-xs text-white/70 hover:text-white hover:bg-white/10"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Clear
              </Button>
            )}
          </div>
          
          {backgrounds.length === 0 ? (
            <div className="text-white/50 text-sm p-3 text-center">
              No backgrounds added yet
            </div>
          ) : (
            <div className="space-y-2">
              {backgrounds.map((background) => (
                <div
                  key={background.id}
                  className={`bg-black/50 rounded-md overflow-hidden border ${activeBackgroundId === background.id ? 'border-primary' : 'border-white/10'} cursor-pointer hover:bg-white/5 transition-colors`}
                  onClick={() => setBackground(background.id)}
                >
                  <div className="flex justify-between items-center p-3">
                    <div className="flex items-center">
                      {getBackgroundTypeIcon(background.type)}
                      <span className="text-white text-sm truncate max-w-[150px]">
                        {background.type.charAt(0).toUpperCase() + background.type.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {activeBackgroundId === background.id && (
                        <Check className="h-4 w-4 text-primary mr-2" />
                      )}
                      <button
                        onClick={(e) => removeBackground(background.id, e)}
                        className="text-white/50 hover:text-white/80"
                        aria-label="Remove background"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BackgroundCustomizer; 