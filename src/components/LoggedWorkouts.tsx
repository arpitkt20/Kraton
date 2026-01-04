import React from 'react';
import { WorkoutSession } from '../types/workoutSession';
import './LoggedWorkouts.css';

interface LoggedWorkoutsProps {
  workouts: WorkoutSession[];
  onEdit: (session: WorkoutSession) => void;
  onDelete: (session: WorkoutSession) => void;
}

const LoggedWorkouts: React.FC<LoggedWorkoutsProps> = ({ workouts, onEdit, onDelete }) => {
  if (workouts.length === 0) {
    return null;
  }

  const isSingleWorkout = workouts.length === 1;

  return (
    <div className={`logged-workouts ${isSingleWorkout ? 'single-workout' : ''}`}>
      <h2 className="logged-workouts-title">Logged Workouts</h2>
      <div className={`workouts-list ${isSingleWorkout ? 'single-workout-list' : ''}`}>
        {workouts.map(workout => (
          <div key={workout.id} className="workout-card">
            <div className="workout-card-header">
              <div className="workout-card-info">
                <h3 className="workout-card-name">{workout.workoutName}</h3>
                <p className="workout-card-regime">{workout.regimeName}</p>
              </div>
              <div className="workout-card-actions">
                <button
                  className="edit-workout-button"
                  onClick={() => onEdit(workout)}
                  aria-label="Edit workout"
                  title="Edit workout"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  className="delete-workout-button"
                  onClick={() => onDelete(workout)}
                  aria-label="Delete workout"
                  title="Delete workout"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="workout-exercises">
              {workout.exercises.map((exercise, index) => {
                const completedSets = exercise.sets.filter(s => s.completed).length;
                const totalSets = exercise.sets.length;
                const isWeightReps = exercise.exerciseType === 'Weight and Reps';
                
                return (
                  <div key={index} className="exercise-summary">
                    <div className="exercise-summary-header">
                      <span className="exercise-summary-name">{exercise.exerciseName}</span>
                      <span className="exercise-summary-sets">{completedSets}/{totalSets} sets</span>
                    </div>
                    <div className="exercise-summary-details">
                      {exercise.sets.filter(s => s.completed).map((set, setIndex) => (
                        <div key={setIndex} className="set-summary">
                          <div className="set-summary-values">
                            {isWeightReps ? (
                              <>
                                {set.reps && <span>{set.reps} reps</span>}
                                {set.weight && <span>{set.weight} kg</span>}
                              </>
                            ) : (
                              <>
                                {set.distance && <span>{set.distance} km</span>}
                                {set.time && <span>{set.time} min</span>}
                              </>
                            )}
                          </div>
                          {set.notes && (
                            <div className="set-summary-notes">
                              <span className="set-notes-icon">📝</span>
                              <span className="set-notes-text">{set.notes}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoggedWorkouts;

