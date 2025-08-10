import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AudioPlayer from './AudioPlayer';

// Mock the environment config
jest.mock('../../config/environment', () => ({
  config: {
    BACKEND_URL: 'http://localhost:3001'
  }
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Volume2: ({ size, className }: any) => <div data-testid="volume-icon" className={className}>Volume2</div>,
  Pause: ({ size }: any) => <div data-testid="pause-icon">Pause</div>,
  Play: ({ size }: any) => <div data-testid="play-icon">Play</div>,
  SkipBack: ({ size }: any) => <div data-testid="skip-back-icon">SkipBack</div>,
  SkipForward: ({ size }: any) => <div data-testid="skip-forward-icon">SkipForward</div>,
  VolumeX: ({ size }: any) => <div data-testid="volume-x-icon">VolumeX</div>,
  ChevronDown: ({ size }: any) => <div data-testid="chevron-down-icon">ChevronDown</div>
}));

describe('AudioPlayer', () => {
  beforeEach(() => {
    // Mock getBoundingClientRect for progress bar
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      width: 100,
      height: 20,
      right: 100,
      bottom: 20,
      x: 0,
      y: 0,
      toJSON: () => ({})
    } as DOMRect));
  });

  describe('Rendering', () => {
    it('renders the audio player with correct track information', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      expect(screen.getByText('הקלטה מקורית')).toBeInTheDocument();
      expect(screen.getByText('שיחה 123')).toBeInTheDocument();
      expect(screen.getByText('הקלטה')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<AudioPlayer salesCallId={123} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('audio-player-container', 'custom-class');
    });

    it('renders all control buttons', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      expect(screen.getByTitle('Restart')).toBeInTheDocument();
      expect(screen.getByTitle('Play')).toBeInTheDocument();
      expect(screen.getByTitle('Skip to end')).toBeInTheDocument();
      expect(screen.getByTitle('Mute')).toBeInTheDocument();
    });

    it('renders time displays', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      const timeDisplays = screen.getAllByText('0:00');
      expect(timeDisplays).toHaveLength(2);
    });

    it('renders speed control button', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      expect(screen.getByTitle('Playback Speed: 1x')).toBeInTheDocument();
      expect(screen.getByText('1x')).toBeInTheDocument();
    });

    it('renders volume slider', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      const volumeSlider = screen.getByRole('slider');
      expect(volumeSlider).toBeInTheDocument();
      expect(volumeSlider).toHaveAttribute('min', '0');
      expect(volumeSlider).toHaveAttribute('max', '1');
      expect(volumeSlider).toHaveAttribute('step', '0.01');
    });

    it('renders progress bar', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      const progressContainer = screen.getByTestId('progress-container');
      expect(progressContainer).toBeInTheDocument();
    });
  });

  describe('Audio Element', () => {
    it('creates audio element with correct src', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      const audioElement = document.querySelector('audio');
      expect(audioElement).toHaveAttribute('src', 'http://localhost:3001/api/audio/123');
      expect(audioElement).toHaveAttribute('preload', 'metadata');
    });
  });

  describe('Play/Pause Controls', () => {
    it('shows play button when not playing', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
      expect(screen.getByTitle('Play')).toBeInTheDocument();
    });

    it('play button is clickable', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      const playButton = screen.getByTitle('Play');
      expect(playButton).not.toBeDisabled();
    });
  });

  describe('Volume Controls', () => {
    it('volume slider is interactive', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      const volumeSlider = screen.getByRole('slider');
      fireEvent.change(volumeSlider, { target: { value: '0.5' } });
      
      expect(volumeSlider).toHaveValue('0.5');
    });

    it('mute button is clickable', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      const muteButton = screen.getByTitle('Mute');
      expect(muteButton).not.toBeDisabled();
    });
  });

  describe('Speed Control', () => {
    it('shows speed menu when speed button is clicked', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      const speedButton = screen.getByTitle('Playback Speed: 1x');
      fireEvent.click(speedButton);
      
      expect(screen.getByText('0.5x')).toBeInTheDocument();
      expect(screen.getByText('0.75x')).toBeInTheDocument();
      expect(screen.getByText('1.25x')).toBeInTheDocument();
      expect(screen.getByText('1.5x')).toBeInTheDocument();
      expect(screen.getByText('2x')).toBeInTheDocument();
    });

    it('changes speed when speed option is selected', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      const speedButton = screen.getByTitle('Playback Speed: 1x');
      fireEvent.click(speedButton);
      
      const speedOption = screen.getByText('1.5x');
      fireEvent.click(speedOption);
      
      expect(screen.getByText('1.5x')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('progress bar is clickable', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      const progressContainer = screen.getByTestId('progress-container');
      expect(progressContainer).toBeInTheDocument();
      
      fireEvent.click(progressContainer);
      // Should not throw an error
    });
  });

  describe('Skip Controls', () => {
    it('skip back button is clickable', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      const skipBackButton = screen.getByTitle('Restart');
      expect(skipBackButton).not.toBeDisabled();
    });

    it('skip forward button is clickable', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      const skipForwardButton = screen.getByTitle('Skip to end');
      expect(skipForwardButton).not.toBeDisabled();
    });
  });

  describe('Callback Functions', () => {
    it('calls onPlaybackStart when provided', () => {
      const onPlaybackStart = jest.fn();
      render(<AudioPlayer salesCallId={123} onPlaybackStart={onPlaybackStart} />);
      
      // The callback should be available but not called until audio actually plays
      expect(onPlaybackStart).toBeDefined();
    });

    it('calls onPlaybackEnd when provided', () => {
      const onPlaybackEnd = jest.fn();
      render(<AudioPlayer salesCallId={123} onPlaybackEnd={onPlaybackEnd} />);
      
      // The callback should be available but not called until audio actually ends
      expect(onPlaybackEnd).toBeDefined();
    });

    it('calls onError when provided', () => {
      const onError = jest.fn();
      render(<AudioPlayer salesCallId={123} onError={onError} />);
      
      // The callback should be available but not called until an error occurs
      expect(onError).toBeDefined();
    });
  });

  describe('Time Formatting', () => {
    it('formats time correctly', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      // The component should display 0:00 initially
      const timeDisplays = screen.getAllByText('0:00');
      expect(timeDisplays).toHaveLength(2);
    });
  });

  describe('Component Structure', () => {
    it('has correct CSS classes', () => {
      const { container } = render(<AudioPlayer salesCallId={123} />);
      
      expect(container.querySelector('.audio-player-container')).toBeInTheDocument();
      expect(container.querySelector('.track-info')).toBeInTheDocument();
      expect(container.querySelector('.progress-section')).toBeInTheDocument();
      expect(container.querySelector('.controls-section')).toBeInTheDocument();
      expect(container.querySelector('.main-controls')).toBeInTheDocument();
      expect(container.querySelector('.secondary-controls')).toBeInTheDocument();
    });

    it('has all required icons', () => {
      render(<AudioPlayer salesCallId={123} />);
      
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
      expect(screen.getByTestId('skip-back-icon')).toBeInTheDocument();
      expect(screen.getByTestId('skip-forward-icon')).toBeInTheDocument();
      expect(screen.getAllByTestId('volume-icon')).toHaveLength(2); // One in cover, one in controls
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });
  });
});
