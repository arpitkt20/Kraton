import React, { useState, useEffect } from 'react';
import { WorkoutRegime, Workout, RegimeExercise } from '../types/workoutRegime';
import { WorkoutSessionExercise, WorkoutSet } from '../types/workoutSession';
import { getAllExercises } from '../utils/exerciseUtils';
import { getPreviousExerciseValues, saveWorkoutSession, getSessionById, updateWorkoutSession, getAllSessions } from '../utils/workoutSessionUtils';
import { WorkoutSession } from '../types/workoutSession';
import { ExerciseData } from './ExerciseModal';
import './ActiveWorkout.css';

interface ActiveWorkoutProps {
  regime: WorkoutRegime;
  workout: Workout;
  selectedDate: Date;
  sessionId?: string | null; // For editing existing session
  onBack: () => void;
  onComplete: () => void;
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ regime, workout, selectedDate, sessionId, onBack, onComplete }) => {
  const [exercises, setExercises] = useState<WorkoutSessionExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<ExerciseData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [restTime, setRestTime] = useState<number>(60); // Rest time in seconds
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const alertShownRef = React.useRef<boolean>(false);
  const [notesModal, setNotesModal] = useState<{ exerciseIndex: number; setIndex: number } | null>(null);
  const [notesInput, setNotesInput] = useState<string>('');
  const [historyModal, setHistoryModal] = useState<{ exerciseId: string; exerciseName: string } | null>(null);
  const [exerciseHistory, setExerciseHistory] = useState<any[]>([]);
  const [collapsedExercises, setCollapsedExercises] = useState<Set<number>>(new Set());

  // Load rest time setting
  useEffect(() => {
    const savedRestTime = localStorage.getItem('kraton-rest-time');
    if (savedRestTime) {
      setRestTime(parseInt(savedRestTime, 10));
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Timer effect - handles countdown and background notifications
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer reached zero
            setTimerActive(false);
            setTimerStartTime(null);
            
            // Only show alert/notification once
            if (!alertShownRef.current) {
              alertShownRef.current = true;
              
              // Show notification if app is in background
              if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('Rest Timer Complete!', {
                  body: 'Your rest period is over. Time for the next set!',
                  icon: '/icon.png',
                  tag: 'rest-timer',
                  requireInteraction: true
                });
              } else {
                // Show alert if app is in foreground
                alert('Rest Timer Complete! Time for the next set!');
              }
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [timerActive, timeRemaining]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Handle visibility change - sync timer when app comes back to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && timerActive && timerStartTime) {
        // App came back to foreground, recalculate remaining time
        const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
        const remaining = Math.max(0, restTime - elapsed);
        setTimeRemaining(remaining);
        
        if (remaining === 0 && !alertShownRef.current) {
          setTimerActive(false);
          setTimerStartTime(null);
          alertShownRef.current = true;
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Rest Timer Complete!', {
              body: 'Your rest period is over. Time for the next set!',
              icon: '/icon.png',
              tag: 'rest-timer',
              requireInteraction: true
            });
          } else {
            alert('Rest Timer Complete! Time for the next set!');
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timerActive, timerStartTime, restTime]);

  useEffect(() => {
    const loadData = async () => {
      const allExercises = await getAllExercises();
      setAvailableExercises(allExercises);

      // If editing existing session, load its data
      if (sessionId) {
        const existingSession = await getSessionById(sessionId);
        if (existingSession) {
          setExercises(existingSession.exercises);
          return;
        }
      }

      // Load exercises with previous values
      const exercisesWithPrevious: WorkoutSessionExercise[] = await Promise.all(
        workout.exercises.map(async (regimeExercise) => {
          const exerciseData = allExercises.find(
            e => e.name.toLowerCase().replace(/\s+/g, '-') === regimeExercise.exerciseId
          );
          
          // Get previous values
          const previous = await getPreviousExerciseValues(workout.id, regimeExercise.exerciseId);
          
          // Create sets based on regime exercise
          const sets: WorkoutSet[] = [];
          const numSets = previous?.sets || regimeExercise.sets || 3;
          
          for (let i = 1; i <= numSets; i++) {
            sets.push({
              setNumber: i,
              reps: previous?.reps || regimeExercise.reps,
              weight: previous?.weight || regimeExercise.weight,
              distance: previous?.distance || regimeExercise.distance,
              time: previous?.time || regimeExercise.time,
              completed: false
            });
          }

          return {
            exerciseId: regimeExercise.exerciseId,
            exerciseName: regimeExercise.exerciseName,
            exerciseType: (exerciseData?.type || 'Weight and Reps') as 'Weight and Reps' | 'Distance and Time',
            sets: sets
          };
        })
      );

      setExercises(exercisesWithPrevious);
    };

    loadData();
  }, [workout, sessionId]);

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setExercises(updated);
  };

  const handleToggleComplete = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    const wasCompleted = updated[exerciseIndex].sets[setIndex].completed;
    updated[exerciseIndex].sets[setIndex].completed = !wasCompleted;
    setExercises(updated);
    
    // Start timer when a set is marked as completed
    if (!wasCompleted && restTime > 0) {
      alertShownRef.current = false; // Reset alert flag for new timer
      setTimeRemaining(restTime);
      setTimerStartTime(Date.now());
      setTimerActive(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerStop = () => {
    setTimerActive(false);
    setTimeRemaining(0);
    setTimerStartTime(null);
    alertShownRef.current = false; // Reset alert flag
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const handleOpenNotes = (exerciseIndex: number, setIndex: number) => {
    const set = exercises[exerciseIndex].sets[setIndex];
    setNotesInput(set.notes || '');
    setNotesModal({ exerciseIndex, setIndex });
  };

  const handleCloseNotes = () => {
    setNotesModal(null);
    setNotesInput('');
  };

  const handleSaveNotes = () => {
    if (notesModal) {
      handleSetChange(notesModal.exerciseIndex, notesModal.setIndex, 'notes', notesInput);
      handleCloseNotes();
    }
  };

  const handleOpenHistory = async (exerciseId: string, exerciseName: string) => {
    setHistoryModal({ exerciseId, exerciseName });
    
    // Fetch all sessions and filter for this exercise
    try {
      const allSessions = await getAllSessions();
      const history: any[] = [];
      
      allSessions.forEach(session => {
        const exercise = session.exercises.find(e => 
          e.exerciseId === exerciseId || e.exerciseName === exerciseName
        );
        
        if (exercise) {
          // Get completed sets
          const completedSets = exercise.sets.filter(s => s.completed);
          
          if (completedSets.length > 0) {
            history.push({
              date: session.date,
              workoutName: session.workoutName,
              regimeName: session.regimeName,
              exerciseType: exercise.exerciseType,
              sets: exercise.sets,
              completedSets: completedSets
            });
          }
        }
      });
      
      // Sort by date descending (newest first)
      history.sort((a, b) => b.date.getTime() - a.date.getTime());
      setExerciseHistory(history);
    } catch (error) {
      console.error('Error loading exercise history:', error);
      setExerciseHistory([]);
    }
  };

  const handleCloseHistory = () => {
    setHistoryModal(null);
    setExerciseHistory([]);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    const exercise = updated[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSetNumber = exercise.sets.length + 1;
    
    const newSet: WorkoutSet = {
      setNumber: newSetNumber,
      reps: lastSet?.reps,
      weight: lastSet?.weight,
      distance: lastSet?.distance,
      time: lastSet?.time,
      completed: false
    };
    
    updated[exerciseIndex].sets = [...exercise.sets, newSet];
    setExercises(updated);
  };

  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    const exercise = updated[exerciseIndex];
    
    if (exercise.sets.length <= 1) {
      alert('At least one set is required');
      return;
    }
    
    exercise.sets.splice(setIndex, 1);
    // Renumber sets
    exercise.sets.forEach((set, index) => {
      set.setNumber = index + 1;
    });
    
    setExercises(updated);
  };

  const handleAddExercise = (exerciseId?: string) => {
    if (!exerciseId) {
      const exercise = availableExercises.find(e => {
        const id = e.name.toLowerCase().replace(/\s+/g, '-');
        return id === searchTerm.toLowerCase().replace(/\s+/g, '-');
      });
      if (exercise) {
        exerciseId = exercise.name.toLowerCase().replace(/\s+/g, '-');
      }
    }
    
    if (!exerciseId) {
      alert('Please select an exercise');
      return;
    }

    const exercise = availableExercises.find(e => {
      return e.name.toLowerCase().replace(/\s+/g, '-') === exerciseId;
    });

    if (!exercise) return;

    // Check if exercise already exists
    const existingIndex = exercises.findIndex(e => e.exerciseId === exerciseId);
    if (existingIndex !== -1) {
      alert('This exercise is already added');
      return;
    }

    const newExercise: WorkoutSessionExercise = {
      exerciseId: exerciseId,
      exerciseName: exercise.name,
      exerciseType: (exercise.type || 'Weight and Reps') as 'Weight and Reps' | 'Distance and Time',
      sets: [{
        setNumber: 1,
        reps: undefined,
        weight: undefined,
        distance: undefined,
        time: undefined,
        completed: false
      }]
    };

    setExercises([...exercises, newExercise]);
    setSearchTerm('');
    setShowExerciseSelector(false);
  };

  const handleDeleteExercise = (exerciseIndex: number) => {
    if (exercises.length <= 1) {
      alert('At least one exercise is required');
      return;
    }
    
    const updated = exercises.filter((_, i) => i !== exerciseIndex);
    setExercises(updated);
  };

  const handleMoveExerciseUp = (exerciseIndex: number) => {
    if (exerciseIndex === 0) return; // Already at top
    const updated = [...exercises];
    const [moved] = updated.splice(exerciseIndex, 1);
    updated.splice(exerciseIndex - 1, 0, moved);
    setExercises(updated);
  };

  const handleMoveExerciseDown = (exerciseIndex: number) => {
    if (exerciseIndex === exercises.length - 1) return; // Already at bottom
    const updated = [...exercises];
    const [moved] = updated.splice(exerciseIndex, 1);
    updated.splice(exerciseIndex + 1, 0, moved);
    setExercises(updated);
  };

  // Group exercises by category for selector
  const getGroupedExercises = () => {
    const filtered = availableExercises.filter(exercise => {
      if (!searchTerm.trim()) return true;
      const search = searchTerm.toLowerCase();
      return exercise.name.toLowerCase().includes(search) || 
             exercise.category.toLowerCase().includes(search);
    });

    const grouped: { [key: string]: ExerciseData[] } = {};
    filtered.forEach(exercise => {
      if (!grouped[exercise.category]) {
        grouped[exercise.category] = [];
      }
      grouped[exercise.category].push(exercise);
    });

    const sortedCategories = Object.keys(grouped).sort();
    return { grouped, sortedCategories };
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showExerciseSelector) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.exercise-selector')) {
        setShowExerciseSelector(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExerciseSelector]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (sessionId) {
        // Update existing session
        await updateWorkoutSession(sessionId, {
          date: selectedDate,
          regimeId: regime.id,
          regimeName: regime.name,
          workoutId: workout.id,
          workoutName: workout.name,
          exercises: exercises
        });
      } else {
        // Create new session
        await saveWorkoutSession({
          date: selectedDate,
          regimeId: regime.id,
          regimeName: regime.name,
          workoutId: workout.id,
          workoutName: workout.name,
          exercises: exercises
        });
      }
      onComplete();
    } catch (error) {
      console.error('Error saving workout session:', error);
      alert('Failed to save workout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="active-workout">
      <header className="active-workout-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="active-workout-title-section">
          <h1 className="active-workout-title">{workout.name}</h1>
          <p className="active-workout-subtitle">{regime.name}</p>
        </div>
        <div className="active-workout-header-right">
          <button className="save-workout-button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {timerActive && (
        <div className="rest-timer-banner">
          <div className="rest-timer-banner-content">
            <div className="rest-timer-banner-left">
              <div className="rest-timer-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="rest-timer-banner-text">
                <div className="rest-timer-banner-label">Rest Time</div>
                <div className={`rest-timer-banner-time ${timeRemaining <= 10 ? 'timer-warning' : ''}`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
            <button
              className="rest-timer-banner-stop"
              onClick={handleTimerStop}
              aria-label="Stop timer"
              title="Stop timer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="active-workout-content">
        {exercises.map((exercise, exerciseIndex) => {
          const isWeightReps = exercise.exerciseType === 'Weight and Reps';
          
          return (
            <div 
              key={`${exercise.exerciseId}-${exerciseIndex}`} 
              className="exercise-card"
            >
              <div className="exercise-card-header">
                <div className="exercise-card-header-left">
                  <button
                    className="collapse-exercise-button"
                    onClick={() => {
                      const newCollapsed = new Set(collapsedExercises);
                      if (newCollapsed.has(exerciseIndex)) {
                        newCollapsed.delete(exerciseIndex);
                      } else {
                        newCollapsed.add(exerciseIndex);
                      }
                      setCollapsedExercises(newCollapsed);
                    }}
                    aria-label={collapsedExercises.has(exerciseIndex) ? "Expand exercise" : "Collapse exercise"}
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ transform: collapsedExercises.has(exerciseIndex) ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                    >
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="exercise-move-buttons">
                    <button
                      className="move-exercise-button move-up-button"
                      onClick={() => handleMoveExerciseUp(exerciseIndex)}
                      disabled={exerciseIndex === 0}
                      aria-label="Move exercise up"
                      title="Move up"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      className="move-exercise-button move-down-button"
                      onClick={() => handleMoveExerciseDown(exerciseIndex)}
                      disabled={exerciseIndex === exercises.length - 1}
                      aria-label="Move exercise down"
                      title="Move down"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <h3 
                    className="exercise-card-name clickable"
                    onClick={() => handleOpenHistory(exercise.exerciseId, exercise.exerciseName)}
                    title="Click to view history"
                  >
                    {exercise.exerciseName}
                  </h3>
                </div>
                <button
                  className="delete-exercise-button"
                  onClick={() => handleDeleteExercise(exerciseIndex)}
                  aria-label="Delete exercise"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              
              {!collapsedExercises.has(exerciseIndex) && (
              <div className="sets-container">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className={`set-container ${set.completed ? 'completed' : ''}`}>
                    <div className={`set-row ${set.completed ? 'completed' : ''}`}>
                      <div className="set-number-cell">{set.setNumber}</div>
                      
                      {isWeightReps ? (
                        <>
                          <div className="set-field">
                            <label className="set-label">Reps</label>
                            <input
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              min="0"
                              className="set-input"
                              value={set.reps || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d+$/.test(value)) {
                                  handleSetChange(exerciseIndex, setIndex, 'reps', parseInt(value) || 0);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              placeholder={set.reps?.toString() || ''}
                            />
                          </div>
                          <div className="set-field">
                            <label className="set-label">Weight</label>
                            <input
                              type="number"
                              inputMode="decimal"
                              pattern="[0-9]*\.?[0-9]*"
                              min="0"
                              step="0.5"
                              className="set-input"
                              value={set.weight || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                  handleSetChange(exerciseIndex, setIndex, 'weight', parseFloat(value) || 0);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (!/[0-9.]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              placeholder={set.weight?.toString() || ''}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="set-field">
                            <label className="set-label">Distance</label>
                            <input
                              type="number"
                              inputMode="decimal"
                              pattern="[0-9]*\.?[0-9]*"
                              min="0"
                              step="0.1"
                              className="set-input"
                              value={set.distance || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                  handleSetChange(exerciseIndex, setIndex, 'distance', parseFloat(value) || 0);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (!/[0-9.]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              placeholder={set.distance?.toString() || ''}
                            />
                          </div>
                          <div className="set-field">
                            <label className="set-label">Time</label>
                            <input
                              type="number"
                              inputMode="decimal"
                              pattern="[0-9]*\.?[0-9]*"
                              min="0"
                              step="0.1"
                              className="set-input"
                              value={set.time || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                  handleSetChange(exerciseIndex, setIndex, 'time', parseFloat(value) || 0);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (!/[0-9.]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              placeholder={set.time?.toString() || ''}
                            />
                          </div>
                        </>
                      )}
                      
                      <button
                        className={`complete-button ${set.completed ? 'completed' : ''}`}
                        onClick={() => handleToggleComplete(exerciseIndex, setIndex)}
                      >
                        {set.completed ? '✓' : '○'}
                      </button>
                      
                      <button
                        className={`notes-button ${set.notes ? 'has-notes' : ''}`}
                        onClick={() => handleOpenNotes(exerciseIndex, setIndex)}
                        aria-label="Add notes"
                        title={set.notes ? 'Edit notes' : 'Add notes'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                      
                      <button
                        className="delete-set-button"
                        onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                        aria-label="Delete set"
                        title="Delete set"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  className="add-set-button"
                  onClick={() => handleAddSet(exerciseIndex)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Add Set
                </button>
              </div>
              )}
            </div>
          );
        })}

        {/* Add Exercise Button - Moved to bottom */}
        <div className="add-exercise-section">
          <button
            className="add-exercise-button"
            onClick={() => setShowExerciseSelector(!showExerciseSelector)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Exercise
          </button>

          {showExerciseSelector && (
            <div className="exercise-selector">
              <div className="exercise-search-container">
                <input
                  type="text"
                  className="exercise-search-input"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="exercise-dropdown">
                {(() => {
                  const { grouped, sortedCategories } = getGroupedExercises();
                  if (sortedCategories.length === 0) {
                    return (
                      <div className="exercise-dropdown-empty">
                        <p>No exercises found</p>
                      </div>
                    );
                  }
                  return sortedCategories.map(category => (
                    <div key={category} className="exercise-category-group">
                      <div className="exercise-category-header">{category}</div>
                      {grouped[category].map(exercise => {
                        const exerciseId = exercise.name.toLowerCase().replace(/\s+/g, '-');
                        return (
                          <div
                            key={exerciseId}
                            className="exercise-option"
                            onClick={() => handleAddExercise(exerciseId)}
                          >
                            <span className="exercise-option-name">{exercise.name}</span>
                            <span className="exercise-option-type">{exercise.type}</span>
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
              <div className="exercise-selector-actions">
                <button 
                  className="cancel-button" 
                  onClick={() => {
                    setShowExerciseSelector(false);
                    setSearchTerm('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notes Modal */}
        {notesModal && (
          <div className="notes-modal-overlay" onClick={handleCloseNotes}>
            <div className="notes-modal" onClick={(e) => e.stopPropagation()}>
              <div className="notes-modal-header">
                <h3 className="notes-modal-title">Set {exercises[notesModal.exerciseIndex].sets[notesModal.setIndex].setNumber} Notes</h3>
                <button className="notes-modal-close" onClick={handleCloseNotes} aria-label="Close">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <div className="notes-modal-content">
                <textarea
                  className="notes-modal-textarea"
                  placeholder="Add notes for this set..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  rows={6}
                  autoFocus
                />
              </div>
              <div className="notes-modal-footer">
                <button className="notes-modal-cancel" onClick={handleCloseNotes}>
                  Cancel
                </button>
                <button className="notes-modal-save" onClick={handleSaveNotes}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exercise History Modal */}
        {historyModal && (
          <div className="history-modal-overlay" onClick={handleCloseHistory}>
            <div className="history-modal" onClick={(e) => e.stopPropagation()}>
              <div className="history-modal-header">
                <h3 className="history-modal-title">{historyModal.exerciseName} - History</h3>
                <button className="history-modal-close" onClick={handleCloseHistory} aria-label="Close">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <div className="history-modal-content">
                {exerciseHistory.length === 0 ? (
                  <div className="history-empty">
                    <p>No previous entries found for this exercise.</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {exerciseHistory.map((entry, index) => {
                      const isWeightReps = entry.exerciseType === 'Weight and Reps';
                      const dateStr = entry.date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      });
                      
                      return (
                        <div key={index} className="history-item">
                          <div className="history-item-header">
                            <div className="history-item-date">{dateStr}</div>
                            <div className="history-item-workout">{entry.workoutName} • {entry.regimeName}</div>
                          </div>
                          <div className="history-item-sets">
                            {entry.completedSets.map((set: any, setIdx: number) => (
                              <div key={setIdx} className="history-set">
                                <span className="history-set-number">Set {set.setNumber}</span>
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
                                {set.notes && (
                                  <span className="history-set-notes" title={set.notes}>
                                    📝
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveWorkout;

