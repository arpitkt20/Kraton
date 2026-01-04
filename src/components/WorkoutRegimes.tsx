import React, { useState, useEffect } from 'react';
import { WorkoutRegime } from '../types/workoutRegime';
import { getAllRegimes } from '../utils/workoutRegimeUtils';
import './WorkoutRegimes.css';

interface WorkoutRegimesProps {
  onBack: () => void;
  onCreateNew: (regimeId: string | null) => void;
  onEditRegime: (regimeId: string) => void;
}

const WorkoutRegimes: React.FC<WorkoutRegimesProps> = ({ onBack, onCreateNew, onEditRegime }) => {
  const [regimes, setRegimes] = useState<WorkoutRegime[]>([]);

  useEffect(() => {
    // Load regimes from database
    const loadRegimes = async () => {
      const loadedRegimes = await getAllRegimes();
      setRegimes(loadedRegimes);
    };
    loadRegimes();
  }, []);

  return (
    <div className="workout-regimes">
      <header className="workout-regimes-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="workout-regimes-title">Workout Regimes</h1>
        <div style={{ width: '24px' }}></div> {/* Spacer for centering */}
      </header>

      <div className="workout-regimes-content">
        <button className="create-regime-button" onClick={() => onCreateNew(null)}>
          <svg className="create-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="create-text">Create New Workout Regime</span>
        </button>

        {regimes.length === 0 ? (
          <div className="regimes-empty">
            <p>No workout regimes yet</p>
            <p className="regimes-empty-subtitle">Create your first regime to get started</p>
          </div>
        ) : (
          <div className="regimes-list">
            <h2 className="regimes-list-title">My Regimes</h2>
            {regimes.map(regime => (
              <div
                key={regime.id}
                className="regime-item"
                onClick={() => onEditRegime(regime.id)}
              >
                <div className="regime-info">
                  <h3 className="regime-name">{regime.name}</h3>
                  <p className="regime-meta">
                    {regime.workouts?.length || 0} {regime.workouts?.length === 1 ? 'workout' : 'workouts'}
                    {' • '}
                    Updated {regime.updatedAt.toLocaleDateString()}
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

export default WorkoutRegimes;

