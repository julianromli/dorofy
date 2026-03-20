import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Video, Upload, Link, X, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { GlassButton } from '@/components/glass';

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

  const updateSidebarVisibility = useCallback((visible: boolean) => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    if (visible) {
      sidebar.style.transform = 'translateX(0)';
      sidebar.style.visibility = 'visible';
      if (isFullscreen) {
        sidebar.style.position = 'fixed';
        sidebar.style.zIndex = '9999';
      }
      return;
    }

    sidebar.style.transform = 'translateX(-100%)';
    sidebar.style.visibility = 'hidden';
  }, [isFullscreen]);

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
  }, [isOpen, updateSidebarVisibility]);

  useEffect(() => {
    updateSidebarVisibility(isOpen);
  }, [isOpen, updateSidebarVisibility]);

  const validateYouTubeUrl = (url: string): string | null => {
    // Extract video ID from various YouTube URL formats
    const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      // Enhanced embed URL with more parameters for better background experience
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${match[1]}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`;
    }
    
    return null;
  };

  const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
      // Check if it's a data URL
      if (url.startsWith('data:')) return true;

      // Check if it's a valid URL
      const urlObj = new URL(url);
      
      // Check if it's from a trusted source
      const trustedDomains = [
        'unsplash.com',
        'pexels.com',
        'images.unsplash.com',
        'images.pexels.com',
        'google.com',
        'googleusercontent.com',
        'giphy.com',
        'tenor.com',
        'imgur.com',
        'i.imgur.com'
      ];

      const isTrustedDomain = trustedDomains.some(domain => 
        urlObj.hostname.includes(domain)
      );

      if (!isTrustedDomain) {
        toast.warning('This image source is not from a trusted domain. It may not work as expected.');
      }

      // Try to fetch the image to validate it exists and is accessible
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error validating image URL:', error);
      return false;
    }
  };

  const getTypeFromUrl = (url: string): 'image' | 'video' | 'youtube' => {
    // Check for data URLs first
    if (url.startsWith('data:')) {
      if (url.startsWith('data:image/')) return 'image';
      if (url.startsWith('data:video/')) return 'video';
    }

    // Check file extensions
    if (url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) {
      return 'image';
    } else if (url.match(/\.(mp4|webm|ogg|mov)$/i)) {
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

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      let finalUrl = url;
      const type = getTypeFromUrl(url);
      
      // Handle YouTube URLs
      if (type === 'youtube') {
        const embedUrl = validateYouTubeUrl(url);
        if (!embedUrl) {
          toast.error('Invalid YouTube URL. Please provide a valid YouTube link.');
          return;
        }
        finalUrl = embedUrl;
      } else {
        // Validate image/video URL
        const isValid = await validateImageUrl(url);
        if (!isValid) {
          toast.error('Invalid or inaccessible URL. Please check the URL and try again.');
          return;
        }
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
        className={`glass-floating-button fixed bottom-4 left-4 z-[10000] flex h-12 w-12 translate-y-[-60px] items-center justify-center rounded-full ${isFullscreen ? 'fullscreen-toggle' : ''}`}
        aria-label={isOpen ? "Close background customizer" : "Open background customizer"}
      >
        <Image className={`h-5 w-5 ${isOpen ? 'text-primary' : 'text-foreground'}`} />
      </button>

      <div
        ref={sidebarRef}
        className={`background-sidebar glass-sidebar ${isOpen ? 'background-sidebar-open' : 'background-sidebar-closed'} ${isFullscreen ? 'fullscreen-sidebar' : ''}`}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-foreground flex items-center">
              <Image className="mr-2 h-5 w-5" /> Custom Background
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10"
              aria-label="Close background customizer"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Add Background</h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*"
              className="hidden"
              id="background-file-input"
            />
            <GlassButton
              onClick={() => fileInputRef.current?.click()}
              variant="default"
              className="mb-2 w-full justify-center"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload File
            </GlassButton>
            
            <h3 className="text-sm font-medium text-muted-foreground mb-2 mt-4">Or Paste URL</h3>
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Image, video, or YouTube URL"
                className="glass-input-shell flex-1 rounded-[1rem] border p-2 text-sm text-foreground"
              />
              <GlassButton
                type="submit"
                variant="hero"
                className="justify-center"
              >
                <Link className="h-4 w-4" />
              </GlassButton>
            </form>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Your Backgrounds</h3>
            {activeBackgroundId && (
              <GlassButton 
                variant="ghost" 
                size="sm" 
                onClick={clearBackground}
                className="h-7 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Clear
              </GlassButton>
            )}
          </div>

          {backgrounds.length === 0 ? (
            <div className="text-muted-foreground text-sm p-3 text-center">
              No backgrounds added yet
            </div>
          ) : (
            <div className="space-y-2">
              {backgrounds.map((background) => (
                <div
                  key={background.id}
                  className={`playlist-card rounded-[1rem] overflow-hidden border ${activeBackgroundId === background.id ? 'border-primary' : 'border-white/10'} cursor-pointer transition-colors`}
                  onClick={() => setBackground(background.id)}
                >
                  <div className="flex justify-between items-center p-3">
                    <div className="flex items-center">
                      {getBackgroundTypeIcon(background.type)}
                      <span className="text-foreground text-sm truncate max-w-[150px]">
                        {background.type.charAt(0).toUpperCase() + background.type.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {activeBackgroundId === background.id && (
                        <Check className="h-4 w-4 text-primary mr-2" />
                      )}
                      <button
                        onClick={(e) => removeBackground(background.id, e)}
                        className="text-muted-foreground hover:text-foreground"
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
