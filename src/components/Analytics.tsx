import React, { useState } from 'react';
import WorkoutsTab from './Analytics/WorkoutsTab';
import BreakdownTab from './Analytics/BreakdownTab';
import ExercisesTab from './Analytics/ExercisesTab';
import './Analytics.css';

interface AnalyticsProps {
  onBack: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'workouts' | 'breakdown' | 'exercises'>('workouts');

  return (
    <div className="analytics">
      <header className="analytics-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="analytics-title">Analytics</h1>
        <div style={{ width: '24px' }}></div> {/* Spacer for centering */}
      </header>

      <div className="analytics-tabs">
        <button
          className={`tab-button ${activeTab === 'workouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('workouts')}
        >
          WORKOUTS
        </button>
        <button
          className={`tab-button ${activeTab === 'breakdown' ? 'active' : ''}`}
          onClick={() => setActiveTab('breakdown')}
        >
          BREAKDOWN
        </button>
        <button
          className={`tab-button ${activeTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercises')}
        >
          EXERCISES
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'workouts' && <WorkoutsTab />}
        {activeTab === 'breakdown' && <BreakdownTab />}
        {activeTab === 'exercises' && <ExercisesTab />}
      </div>
    </div>
  );
};

export default Analytics;

