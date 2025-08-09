import React, { useState, useEffect } from 'react';
import H5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './AudioPlayer.css';
import { config } from '../../config/environment';

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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  useEffect(() => {
    // Use centralized configuration for backend URL
    const url = `${config.BACKEND_URL}/api/audio/${salesCallId}`;
    setAudioUrl(url);
    setIsLoading(false);
    
    console.log(`🎧 AudioPlayer: Initialized for sales call ${salesCallId}`);
    console.log(`🔗 Audio URL: ${url}`);
  }, [salesCallId]);

  const handleAudioError = (error: any) => {
    const errorMsg = `שגיאה בטעינת הקלטה עבור שיחה ${salesCallId}`;
    setHasError(true);
    setErrorMessage(errorMsg);
    
    console.error('❌ Audio playback error:', error);
    onError?.(errorMsg);
  };

  const handlePlay = () => {
    console.log(`▶️ Audio playback started for sales call ${salesCallId}`);
    onPlaybackStart?.();
  };

  const handleEnded = () => {
    console.log(`⏹️ Audio playback ended for sales call ${salesCallId}`);
    onPlaybackEnd?.();
  };

  const handleLoadStart = () => {
    console.log(`📡 Audio loading started for sales call ${salesCallId}`);
    setIsLoading(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    console.log(`✅ Audio ready to play for sales call ${salesCallId}`);
    setIsLoading(false);
    setHasError(false);
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
    
    // Force reload by updating the URL with timestamp
    const url = `${process.env.REACT_APP_API_URL || 'http://localhost:3002'}/api/audio/${salesCallId}?t=${Date.now()}`;
    setAudioUrl(url);
  };

  if (hasError) {
    return (
      <div className={`audio-player-container audio-error-state ${className}`}>
        <h4 className="audio-player-title hebrew-content">
          🎧 הקלטה מקורית
        </h4>
        <div className="audio-error-content">
          <div className="error-icon">❌</div>
          <p className="error-message hebrew-content">{errorMessage}</p>
          <div className="error-actions">
            <button 
              onClick={handleRetry}
              className="retry-button hebrew-content"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`audio-player-container ${className}`}>
      <h4 className="audio-player-title hebrew-content">
        🎧 הקלטה מקורית
      </h4>
      
      {isLoading && (
        <div className="audio-loading-state">
          <div className="loading-spinner"></div>
          <span className="loading-text hebrew-content">טוען הקלטה...</span>
        </div>
      )}
      
      {audioUrl && !isLoading && (
        <H5AudioPlayer
          src={audioUrl}
          className="audio-player-rtl"
          showJumpControls={false}
          showSkipControls={false}
          showDownloadProgress={true}
          showFilledProgress={true}
          hasDefaultKeyBindings={true}
          preload="metadata"
          volume={0.8}
          onError={handleAudioError}
          onPlay={handlePlay}
          onEnded={handleEnded}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          customAdditionalControls={[]}
          customVolumeControls={[]}
        />
      )}
    </div>
  );
};

export default AudioPlayer;
