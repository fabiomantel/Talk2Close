import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from 'lucide-react';
import './AudioPlayer.css';

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
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Create a single track from the sales call
  const currentTrack: Track = {
    id: salesCallId.toString(),
    title: 'הקלטה מקורית',
    artist: `שיחה ${salesCallId}`,
    src: `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/audio/${salesCallId}`,
  };

  // Format time in mm:ss format
  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        setIsPlaying(false);
        onPlaybackEnd?.();
      }
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
  }, [isRepeat, salesCallId, onPlaybackStart, onPlaybackEnd, onError]);

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
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressWidth = rect.width;
    const newTime = (clickX / progressWidth) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
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

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

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
            <Volume2 size={32} className="text-white/60" />
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
        >
          <div className="progress-bar">
            <div 
              className="progress-filled"
              style={{ width: `${progressPercentage}%` }}
            />
            <div 
              className="progress-handle"
              style={{ left: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <span className="time-display">{formatTime(duration)}</span>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="main-controls">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`control-btn ${isShuffle ? 'active' : ''}`}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>
          
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
              }
            }}
            className="control-btn"
            title="Restart"
          >
            <SkipBack size={20} />
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
              <Pause size={24} />
            ) : (
              <Play size={24} />
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
            <SkipForward size={20} />
          </button>
          
          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={`control-btn ${isRepeat ? 'active' : ''}`}
            title="Repeat"
          >
            <Repeat size={18} />
          </button>
        </div>
        
        <div className="volume-controls">
          <button
            onClick={toggleMute}
            className="control-btn"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
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
  );
};

export default AudioPlayer;
