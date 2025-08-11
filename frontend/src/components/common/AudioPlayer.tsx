import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import './AudioPlayer.css';
import { config } from '../../config/environment';

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover?: string;
  duration?: string;
}

interface AudioPlayerProps {
  salesCallId: number;
  className?: string;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  onError?: (error: string) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  salesCallId,
  className = '',
  onPlaybackStart,
  onPlaybackEnd,
  onError
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Available playback speeds
  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Create a single track from the sales call
  const currentTrack: Track = {
    id: salesCallId.toString(),
    title: 'הקלטה מקורית',
    artist: `שיחה ${salesCallId}`,
    src: `${config.API_BASE_URL}/audio/${salesCallId}`,
  };

  // Format time in mm:ss format
  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress position for RTL
  const getProgressPosition = (time: number, totalDuration: number): number => {
    if (totalDuration <= 0) return 0;
    return (time / totalDuration) * 100;
  };

  // Handle progress click and drag
  const handleProgressInteraction = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressWidth = rect.width;
    
    // For RTL, we need to calculate from the right side
    const rtlClickX = progressWidth - clickX;
    const newTime = (rtlClickX / progressWidth) * duration;
    
    audio.currentTime = Math.max(0, Math.min(newTime, duration));
    setCurrentTime(audio.currentTime);
  }, [duration]);

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressInteraction(e);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleProgressInteraction(e);
    }
  }, [isDragging, handleProgressInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setHasError(false);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
    };
    const handleWaiting = () => setIsLoading(true);
    const handleEnded = () => {
      setIsPlaying(false);
      onPlaybackEnd?.();
    };
    const handlePlay = () => {
      setIsPlaying(true);
      onPlaybackStart?.();
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = (error: any) => {
      const errorMsg = `שגיאה בטעינת הקלטה עבור שיחה ${salesCallId}`;
      setHasError(true);
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [salesCallId, onPlaybackStart, onPlaybackEnd, onError]);

  // Update playback speed when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) {
      handleProgressInteraction(e);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audio.muted = newMuted;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  if (hasError) {
    return (
      <div className={`audio-player-container ${className}`}>
        <div className="error-content">
          <div className="error-icon">❌</div>
          <p className="error-message">{errorMessage}</p>
          <button 
            onClick={() => {
              setHasError(false);
              setErrorMessage('');
              setIsLoading(true);
              if (audioRef.current) {
                audioRef.current.load();
              }
            }}
            className="retry-button"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = getProgressPosition(currentTime, duration);

  return (
    <div className={`audio-player-container ${className}`}>
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="metadata"
      />

      {/* Track Info Display */}
      <div className="track-info">
        <div className="track-cover">
          <div className="default-cover">
            <LucideIcons.Volume2 size={32} className="text-white/60" />
          </div>
        </div>
        <div className="track-details">
          <h3 className="track-title">{currentTrack.title}</h3>
          <p className="track-artist">{currentTrack.artist}</p>
        </div>
        <div className="playlist-info">
          <span className="track-counter">
            {isLoading ? 'טוען...' : 'הקלטה'}
          </span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="progress-section">
        <span className="time-display">{formatTime(currentTime)}</span>
        <div 
          className="progress-container"
          ref={progressRef}
          onClick={handleProgressClick}
          onMouseDown={handleMouseDown}
          data-testid="progress-container"
        >
          <div className="progress-bar">
            <div 
              className="progress-filled"
              style={{ width: `${progressPercentage}%` }}
            />
            <div 
              className="progress-handle"
              style={{ right: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <span className="time-display">{formatTime(duration)}</span>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="main-controls">
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
              }
            }}
            className="control-btn"
            title="Restart"
          >
            <LucideIcons.SkipBack size={20} />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="play-pause-btn"
            title={isPlaying ? 'Pause' : 'Play'}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner" />
            ) : isPlaying ? (
              <LucideIcons.Pause size={24} />
            ) : (
              <LucideIcons.Play size={24} />
            )}
          </button>
          
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = duration;
              }
            }}
            className="control-btn"
            title="Skip to end"
          >
            <LucideIcons.SkipForward size={20} />
          </button>
        </div>
        
        <div className="secondary-controls">
          {/* Speed Control */}
          <div className="speed-control">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="speed-btn"
              title={`Playback Speed: ${playbackSpeed}x`}
            >
              <span className="speed-text">{playbackSpeed}x</span>
              <LucideIcons.ChevronDown size={14} />
            </button>
            
            {showSpeedMenu && (
              <div className="speed-menu">
                {playbackSpeeds.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`speed-option ${playbackSpeed === speed ? 'active' : ''}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Controls */}
          <div className="volume-controls">
            <button
              onClick={toggleMute}
              className="control-btn"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <LucideIcons.VolumeX size={18} /> : <LucideIcons.Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
