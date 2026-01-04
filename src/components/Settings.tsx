import React, { useState, useEffect } from 'react';
import './Settings.css';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [restTime, setRestTime] = useState<number>(60); // Default 60 seconds

  useEffect(() => {
    // Load rest time from localStorage
    const savedRestTime = localStorage.getItem('kraton-rest-time');
    if (savedRestTime) {
      setRestTime(parseInt(savedRestTime, 10));
    }
  }, []);

  const handleRestTimeChange = (value: number) => {
    if (value >= 0 && value <= 600) { // Max 10 minutes (600 seconds)
      setRestTime(value);
      localStorage.setItem('kraton-rest-time', value.toString());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="settings">
      <header className="settings-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="settings-title">Settings</h1>
        <div style={{ width: '24px' }}></div> {/* Spacer for centering */}
      </header>

      <div className="settings-content">
        <div className="settings-section">
          <h2 className="settings-section-title">Rest Timer</h2>
          
          <div className="settings-item">
            <div className="rest-time-controls">
              <button
                className="rest-time-button"
                onClick={() => handleRestTimeChange(restTime - 5)}
                disabled={restTime <= 0}
              >
                -5
              </button>
              <div className="rest-time-display">
                <input
                  type="number"
                  min="0"
                  max="600"
                  value={restTime}
                  onChange={(e) => handleRestTimeChange(parseInt(e.target.value) || 0)}
                  className="rest-time-input"
                />
                <span className="rest-time-unit">seconds</span>
                <div className="rest-time-preview">
                  ({formatTime(restTime)})
                </div>
              </div>
              <button
                className="rest-time-button"
                onClick={() => handleRestTimeChange(restTime + 5)}
                disabled={restTime >= 600}
              >
                +5
              </button>
            </div>
            <div className="rest-time-presets">
              <button
                className="preset-button"
                onClick={() => handleRestTimeChange(30)}
              >
                30s
              </button>
              <button
                className="preset-button"
                onClick={() => handleRestTimeChange(60)}
              >
                1m
              </button>
              <button
                className="preset-button"
                onClick={() => handleRestTimeChange(90)}
              >
                1.5m
              </button>
              <button
                className="preset-button"
                onClick={() => handleRestTimeChange(120)}
              >
                2m
              </button>
              <button
                className="preset-button"
                onClick={() => handleRestTimeChange(180)}
              >
                3m
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

