import React, { useState, useEffect } from 'react';
import { Workout, RegimeExercise } from '../types/workoutRegime';
import { getAllExercises } from '../utils/exerciseUtils';
import { ExerciseData } from './ExerciseModal';
import './WorkoutEditor.css';

interface WorkoutEditorProps {
  workout: Workout | null; // null for new workout, Workout for editing
  onBack: () => void;
  onSave: (workout: Workout) => void;
}

const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ workout, onBack, onSave }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<RegimeExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<ExerciseData[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditMode = workout !== null;

  useEffect(() => {
    // Load available exercises
    const loadData = async () => {
      const exercises = await getAllExercises();
      setAvailableExercises(exercises);

      // If editing, load existing workout
      if (workout) {
        setWorkoutName(workout.name);
        setExercises(workout.exercises);
      }
    };
    loadData();
  }, [workout]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showExerciseSelector) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.exercise-selector')) {
        setShowExerciseSelector(false);
        setSearchTerm('');
        setSelectedExerciseId('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExerciseSelector]);

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};

    if (!workoutName.trim()) {
      newErrors.name = 'Workout name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const workoutData: Workout = {
      id: workout?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: workoutName.trim(),
      exercises: exercises,
    };

    onSave(workoutData);
  };

  const handleAddExercise = (exerciseId?: string) => {
    const idToUse = exerciseId || selectedExerciseId;
    if (!idToUse) {
      alert('Please select an exercise');
      return;
    }

    const exercise = availableExercises.find(e => {
      // Create a simple ID from exercise name for matching
      return e.name.toLowerCase().replace(/\s+/g, '-') === idToUse;
    });

    if (!exercise) return;

    const newExercise: RegimeExercise = {
      exerciseId: idToUse,
      exerciseName: exercise.name,
      sets: 3,
      reps: 10,
    };

    setExercises([...exercises, newExercise]);
    setSelectedExerciseId('');
    setSearchTerm('');
    setShowExerciseSelector(false);
  };

  // Group exercises by category
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

    // Sort categories
    const sortedCategories = Object.keys(grouped).sort();
    return { grouped, sortedCategories };
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: keyof RegimeExercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  return (
    <div className="workout-editor">
      <header className="workout-editor-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="workout-editor-title">
          {isEditMode ? 'Edit Workout' : 'Create Workout'}
        </h1>
        <button className="save-header-button" onClick={handleSave}>
          Save
        </button>
      </header>

      <div className="workout-editor-content">
        <div className="workout-form-section">
          <div className="form-group">
            <label htmlFor="workout-name" className="form-label">
              Workout Name <span className="required">*</span>
            </label>
            <input
              id="workout-name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={workoutName}
              onChange={(e) => {
                setWorkoutName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="Enter workout name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
        </div>

        <div className="exercises-section">
          <div className="exercises-header">
            <h2 className="exercises-title">Exercises</h2>
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
          </div>

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
                            className={`exercise-option ${selectedExerciseId === exerciseId ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedExerciseId(exerciseId);
                              handleAddExercise(exerciseId);
                            }}
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
                    setSelectedExerciseId('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {exercises.length === 0 ? (
            <div className="exercises-empty">
              <p>No exercises added yet</p>
              <p className="exercises-empty-subtitle">Click "Add Exercise" to get started</p>
            </div>
          ) : (
            <div className="exercises-list">
              {exercises.map((exercise, index) => (
                  <div key={index} className="exercise-item">
                    <div className="exercise-item-header">
                      <h3 className="exercise-item-name">{exercise.exerciseName}</h3>
                      <button
                        className="remove-exercise-button"
                        onClick={() => handleRemoveExercise(index)}
                        aria-label="Remove exercise"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>

                    <div className="exercise-fields">
                      <span className="exercise-field-row">
                        <label className="exercise-field-label-inline">Sets</label>
                        <input
                          type="number"
                          min="1"
                          className="exercise-input-inline"
                          value={exercise.sets || ''}
                          onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value) || 0)}
                        />
                      </span>
                      <span className="exercise-field-row">
                        <label className="exercise-field-label-inline">Reps</label>
                        <input
                          type="number"
                          min="0"
                          className="exercise-input-inline"
                          value={exercise.reps || ''}
                          onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value) || 0)}
                        />
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutEditor;

