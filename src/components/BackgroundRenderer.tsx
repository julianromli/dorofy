
import React, { useState, useEffect } from 'react';

interface BackgroundData {
  type: 'image' | 'video' | 'youtube';
  url: string;
  id: string;
}

const BackgroundRenderer: React.FC = () => {
  const [activeBackground, setActiveBackground] = useState<BackgroundData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('dorofyFullscreenChanged', (e: any) => {
      setIsFullscreen(e.detail.isFullscreen);
    });

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('dorofyFullscreenChanged', handleFullscreenChange as EventListener);
    };
  }, []);

  useEffect(() => {
    // Load the active background from localStorage
    const loadBackground = () => {
      try {
        const activeBackgroundId = localStorage.getItem('activeBackgroundId');
        if (!activeBackgroundId) {
          // Remove custom background class when no background is active
          document.documentElement.classList.remove('has-custom-background');
          setActiveBackground(null);
          return;
        }

        const backgroundsStr = localStorage.getItem('backgroundData');
        if (!backgroundsStr) {
          document.documentElement.classList.remove('has-custom-background');
          return;
        }

        const backgrounds: BackgroundData[] = JSON.parse(backgroundsStr);
        const background = backgrounds.find(bg => bg.id === activeBackgroundId);
        
        if (background) {
          // Add class to root element to disable default backgrounds
          document.documentElement.classList.add('has-custom-background');
          setActiveBackground(background);
        } else {
          // Remove class if background not found
          document.documentElement.classList.remove('has-custom-background');
          setActiveBackground(null);
        }
      } catch (error) {
        console.error('Error loading background:', error);
        document.documentElement.classList.remove('has-custom-background');
      }
    };

    // Initial load
    loadBackground();

    // Setup event listener for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === 'activeBackgroundId' || 
        event.key === 'backgroundData'
      ) {
        loadBackground();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Create a custom event listener for the same tab updates
    const handleBackgroundChange = () => {
      loadBackground();
    };

    window.addEventListener('backgroundDataChanged', handleBackgroundChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('backgroundDataChanged', handleBackgroundChange);
      // Clean up by removing the class when component unmounts
      document.documentElement.classList.remove('has-custom-background');
    };
  }, []);

  if (!activeBackground) return null;

  const overlayClass = isFullscreen 
    ? "custom-background-overlay fullscreen-overlay" 
    : "custom-background-overlay";

  return (
    <div className="custom-background-container">
      <div className="custom-background">
        {activeBackground.type === 'image' && (
          <img 
            src={activeBackground.url} 
            alt="Custom background"
            className="custom-background-image"
          />
        )}

        {activeBackground.type === 'video' && (
          <video
            src={activeBackground.url}
            autoPlay
            loop
            muted
            playsInline
            className="custom-background-video"
          />
        )}

        {activeBackground.type === 'youtube' && (
          <iframe
            src={activeBackground.url}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube Background"
          ></iframe>
        )}
      </div>
      <div className={overlayClass} aria-hidden="true"></div>
    </div>
  );
};

export default BackgroundRenderer; 
