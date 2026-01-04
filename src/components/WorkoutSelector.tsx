import React from 'react';
import { WorkoutRegime, Workout } from '../types/workoutRegime';
import './WorkoutSelector.css';

interface WorkoutSelectorProps {
  regime: WorkoutRegime;
  onSelectWorkout: (workout: Workout) => void;
  onBack: () => void;
}

const WorkoutSelector: React.FC<WorkoutSelectorProps> = ({ regime, onSelectWorkout, onBack }) => {
  return (
    <div className="workout-selector">
      <header className="workout-selector-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="workout-selector-title">{regime.name}</h1>
        <div style={{ width: '24px' }}></div>
      </header>

      <div className="workout-selector-content">
        {regime.workouts && regime.workouts.length > 0 ? (
          <div className="workouts-list">
            {regime.workouts.map(workout => (
              <div
                key={workout.id}
                className="workout-item"
                onClick={() => onSelectWorkout(workout)}
              >
                <div className="workout-info">
                  <h3 className="workout-name">{workout.name}</h3>
                  <p className="workout-meta">
                    {workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
                  </p>
                </div>
                <svg className="workout-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>
        ) : (
          <div className="workouts-empty">
            <p>No workouts in this regime</p>
            <p className="workouts-empty-subtitle">Add workouts to this regime first</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutSelector;

