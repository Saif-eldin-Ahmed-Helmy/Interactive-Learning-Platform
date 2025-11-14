import React, { useEffect, useRef, useState } from "react";
import { progressService } from "../services/progressService";

interface YouTubePlayerProps {
  videoUrl: string;
  lessonId: string;
  onVideoComplete?: () => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoUrl, lessonId, onVideoComplete }) => {
  const [player, setPlayer] = useState<any>(null);
  const playerInstanceRef = useRef<any>(null); // Keep ref for direct access in intervals
  const [showFocusCheck, setShowFocusCheck] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const saveIntervalRef = useRef<number | null>(null);
  const [videoStartTime, setVideoStartTime] = useState<number>(0);
  const wasFullscreenRef = useRef<boolean>(false); // Track if video was fullscreen

  // Extract video ID from YouTube URL
  const getVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  const videoId = getVideoId(videoUrl);

  useEffect(() => {
    // Check if YouTube API is already loaded
    if ((window as any).YT && (window as any).YT.Player) {
      // API already loaded, create player directly
      initializePlayer();
    } else {
      // Load YouTube IFrame API
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      // Initialize player when API is ready
      (window as any).onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    }

    return () => {
      // Cleanup intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      // Destroy player instance
      if (playerInstanceRef.current && typeof playerInstanceRef.current.destroy === 'function') {
        playerInstanceRef.current.destroy();
      }
    };
  }, [videoId]);

  const initializePlayer = () => {
    if (!playerRef.current) return;

    const newPlayer = new (window as any).YT.Player(playerRef.current, {
      videoId: videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
    setPlayer(newPlayer);
    playerInstanceRef.current = newPlayer; // Store in ref for direct access
  };

  // Load saved progress when player is ready
  const onPlayerReady = async (event: any) => {
    try {
      const savedProgress = await progressService.getVideoProgress(lessonId);
      if (savedProgress?.currentTime > 0) {
        event.target.seekTo(savedProgress.currentTime, true);
        setVideoStartTime(savedProgress.currentTime);
      }
    } catch (error) {
      console.error('Failed to load saved video progress:', error);
    }
  };

  // Auto-save video progress every 10 seconds
  useEffect(() => {
    if (!player || !lessonId) return;

    const saveInterval = setInterval(async () => {
      try {
        if (player.getCurrentTime && typeof player.getCurrentTime === 'function') {
          const currentTime = player.getCurrentTime();
          if (currentTime > 0) {
            await progressService.saveVideoProgress(lessonId, currentTime);
          }
        }
      } catch (error) {
        console.error('Failed to save video progress:', error);
      }
    }, 10000); // Save every 10 seconds

    saveIntervalRef.current = saveInterval;

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [player, lessonId]);

  const onPlayerStateChange = (event: any) => {
    // Playing
    if (event.data === 1) {
      startWatchTimer();
    }
    // Paused or Ended
    else if (event.data === 2 || event.data === 0) {
      stopWatchTimer();
      
      // Video ended
      if (event.data === 0 && onVideoComplete) {
        onVideoComplete();
      }
    }
  };

  const startWatchTimer = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      // Only increment timer if video is actually playing
      if (playerInstanceRef.current && 
          playerInstanceRef.current.getPlayerState && 
          playerInstanceRef.current.getPlayerState() === 1) {
        setWatchTime((prev) => {
          const newTime = prev + 1;
          
          // Show focus check every 10 minutes (600 seconds)
          if (newTime % 600 === 0 && newTime > 0) {
            showFocusCheckAlert();
          }
          
          return newTime;
        });
      }
    }, 1000);
  };

  const stopWatchTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const showFocusCheckAlert = () => {
    // Check if video is in fullscreen mode
    const isFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    
    wasFullscreenRef.current = isFullscreen;
    
    // Exit fullscreen if active
    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
    
    // Pause the video
    if (playerInstanceRef.current && playerInstanceRef.current.pauseVideo) {
      playerInstanceRef.current.pauseVideo();
    }
    
    setShowFocusCheck(true);
  };

  const handleFocusCheckResponse = (focused: boolean) => {
    setShowFocusCheck(false);
    if (focused && playerInstanceRef.current && playerInstanceRef.current.playVideo) {
      // Resume playing
      playerInstanceRef.current.playVideo();
      
      // Restore fullscreen if it was active before
      if (wasFullscreenRef.current) {
        const iframe = playerInstanceRef.current.getIframe();
        if (iframe) {
          if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
          } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
          } else if (iframe.mozRequestFullScreen) {
            iframe.mozRequestFullScreen();
          } else if (iframe.msRequestFullscreen) {
            iframe.msRequestFullscreen();
          }
        }
        wasFullscreenRef.current = false; // Reset
      }
    }
  };

  return (
    <div className="youtube-player-wrapper">
      <div ref={playerRef} className="youtube-player"></div>

      {/* Focus Check Modal */}
      {showFocusCheck && (
        <div className="focus-check-overlay">
          <div className="focus-check-modal">
            <div className="focus-check-header">
              <h4 className="text-danger fw-bold">⚠️ Focus Check!</h4>
            </div>
            <div className="focus-check-body">
              <p className="mb-4">
                You've been watching for 10 minutes. Are you still paying attention?
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <button
                  className="btn btn-success btn-lg"
                  onClick={() => handleFocusCheckResponse(true)}
                >
                  ✓ Yes, I'm focused!
                </button>
                <button
                  className="btn btn-danger btn-lg"
                  onClick={() => handleFocusCheckResponse(false)}
                >
                  ✗ I need a break
                </button>
              </div>
              <p className="text-muted mt-3 small">
                Taking regular breaks helps improve retention and focus.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .youtube-player-wrapper {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          height: 0;
          overflow: hidden;
          background: #000;
          border-radius: 12px;
        }

        .youtube-player {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .focus-check-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(220, 53, 69, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: flashRed 0.5s ease-in-out;
        }

        @keyframes flashRed {
          0%, 100% { background: rgba(220, 53, 69, 0.95); }
          50% { background: rgba(220, 53, 69, 0.7); }
        }

        .focus-check-modal {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: scaleIn 0.3s ease-out;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .focus-check-header {
          margin-bottom: 20px;
        }

        .focus-check-header h4 {
          font-size: 2rem;
          margin: 0;
        }

        .focus-check-body p {
          font-size: 1.2rem;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default YouTubePlayer;
