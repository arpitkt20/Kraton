import React, { useState } from 'react';
import MeasurementTab from './BodyTracker/MeasurementTab';
import ChartsTab from './BodyTracker/ChartsTab';
import HistoryTab from './BodyTracker/HistoryTab';
import './BodyTracker.css';

interface BodyTrackerProps {
  onBack: () => void;
}

const BodyTracker: React.FC<BodyTrackerProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'measurement' | 'charts' | 'history'>('measurement');

  return (
    <div className="body-tracker">
      <header className="body-tracker-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="body-tracker-title">Body Tracker</h1>
        <div style={{ width: '24px' }}></div> {/* Spacer for centering */}
      </header>

      <div className="body-tracker-tabs">
        <button
          className={`tab-button ${activeTab === 'measurement' ? 'active' : ''}`}
          onClick={() => setActiveTab('measurement')}
        >
          Measurement
        </button>
        <button
          className={`tab-button ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          Charts
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      <div className="body-tracker-content">
        {activeTab === 'measurement' && <MeasurementTab />}
        {activeTab === 'charts' && <ChartsTab />}
        {activeTab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
};

export default BodyTracker;

