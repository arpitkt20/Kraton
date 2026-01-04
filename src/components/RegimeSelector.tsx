import React, { useState, useEffect } from 'react';
import { WorkoutRegime } from '../types/workoutRegime';
import { getAllRegimes } from '../utils/workoutRegimeUtils';
import './RegimeSelector.css';

interface RegimeSelectorProps {
  onSelectRegime: (regime: WorkoutRegime) => void;
  onBack: () => void;
}

const RegimeSelector: React.FC<RegimeSelectorProps> = ({ onSelectRegime, onBack }) => {
  const [regimes, setRegimes] = useState<WorkoutRegime[]>([]);

  useEffect(() => {
    const loadRegimes = async () => {
      const loadedRegimes = await getAllRegimes();
      setRegimes(loadedRegimes);
    };
    loadRegimes();
  }, []);

  return (
    <div className="regime-selector">
      <header className="regime-selector-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="regime-selector-title">Select Regime</h1>
        <div style={{ width: '24px' }}></div>
      </header>

      <div className="regime-selector-content">
        {regimes.length === 0 ? (
          <div className="regimes-empty">
            <p>No workout regimes available</p>
            <p className="regimes-empty-subtitle">Create a regime first to start a workout</p>
          </div>
        ) : (
          <div className="regimes-list">
            {regimes.map(regime => (
              <div
                key={regime.id}
                className="regime-item"
                onClick={() => onSelectRegime(regime)}
              >
                <div className="regime-info">
                  <h3 className="regime-name">{regime.name}</h3>
                  <p className="regime-meta">
                    {regime.workouts?.length || 0} {regime.workouts?.length === 1 ? 'workout' : 'workouts'}
                  </p>
                </div>
                <svg className="regime-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegimeSelector;

