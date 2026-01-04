import React, { useState, useEffect } from 'react';
import { WorkoutRegime, Workout } from '../types/workoutRegime';
import { getRegimeById, saveRegime, updateRegime } from '../utils/workoutRegimeUtils';
import WorkoutEditor from './WorkoutEditor';
import './RegimeEditor.css';

interface RegimeEditorProps {
  regimeId: string | null; // null for new regime, string for editing
  onBack: () => void;
  onSave: () => void;
}

const RegimeEditor: React.FC<RegimeEditorProps> = ({ regimeId, onBack, onSave }) => {
  const [regimeName, setRegimeName] = useState('');
  const [description, setDescription] = useState('');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showWorkoutEditor, setShowWorkoutEditor] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditMode = regimeId !== null;

  useEffect(() => {
    // Load existing regime if editing
    const loadData = async () => {
      if (regimeId) {
        const regime = await getRegimeById(regimeId);
        if (regime) {
          setRegimeName(regime.name);
          setDescription(regime.description || '');
          setWorkouts(regime.workouts || []);
        }
      }
    };
    loadData();
  }, [regimeId]);

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!regimeName.trim()) {
      newErrors.name = 'Regime name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const regimeData: Omit<WorkoutRegime, 'id' | 'createdAt' | 'updatedAt'> = {
      name: regimeName.trim(),
      workouts: workouts,
      ...(description.trim() && { description: description.trim() } as any)
    };

    try {
      if (isEditMode && regimeId) {
        await updateRegime(regimeId, regimeData);
      } else {
        await saveRegime(regimeData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving regime:', error);
      alert('Failed to save regime. Please try again.');
    }
  };

  const handleCreateWorkout = () => {
    setEditingWorkout(null);
    setShowWorkoutEditor(true);
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setShowWorkoutEditor(true);
  };

  const handleWorkoutSave = (workout: Workout) => {
    if (editingWorkout) {
      // Update existing workout
      const updated = workouts.map(w => w.id === workout.id ? workout : w);
      setWorkouts(updated);
    } else {
      // Add new workout
      setWorkouts([...workouts, workout]);
    }
    setShowWorkoutEditor(false);
    setEditingWorkout(null);
  };

  const handleRemoveWorkout = (workoutId: string) => {
    setWorkouts(workouts.filter(w => w.id !== workoutId));
  };

  const handleWorkoutEditorBack = () => {
    setShowWorkoutEditor(false);
    setEditingWorkout(null);
  };

  // Show WorkoutEditor if active
  if (showWorkoutEditor) {
    return (
      <WorkoutEditor
        workout={editingWorkout}
        onBack={handleWorkoutEditorBack}
        onSave={handleWorkoutSave}
      />
    );
  }

  return (
    <div className="regime-editor">
      <header className="regime-editor-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="regime-editor-title">
          {isEditMode ? 'Edit Regime' : 'Create Regime'}
        </h1>
        <button className="save-header-button" onClick={handleSave}>
          Save
        </button>
      </header>

      <div className="regime-editor-content">
        <div className="regime-form-section">
          <div className="form-group">
            <label htmlFor="regime-name" className="form-label">
              Regime Name <span className="required">*</span>
            </label>
            <input
              id="regime-name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={regimeName}
              onChange={(e) => {
                setRegimeName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="Enter regime name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="regime-description" className="form-label">
              Description <span className="optional">(Optional)</span>
            </label>
            <textarea
              id="regime-description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter regime description"
              rows={3}
            />
          </div>
        </div>

        <div className="exercises-section">
          <div className="exercises-header">
            <h2 className="exercises-title">Workouts</h2>
            <button
              className="add-exercise-button"
              onClick={handleCreateWorkout}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Create Workout
            </button>
          </div>

          {workouts.length === 0 ? (
            <div className="exercises-empty">
              <p>No workouts added yet</p>
              <p className="exercises-empty-subtitle">Click "Create Workout" to get started</p>
            </div>
          ) : (
            <div className="exercises-list">
              {workouts.map((workout) => (
                <div key={workout.id} className="exercise-item">
                  <div className="exercise-item-header">
                    <h3 className="exercise-item-name">{workout.name}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="remove-exercise-button"
                        onClick={() => handleEditWorkout(workout)}
                        aria-label="Edit workout"
                        style={{ color: '#4a9eff' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        className="remove-exercise-button"
                        onClick={() => handleRemoveWorkout(workout.id)}
                        aria-label="Remove workout"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666666' }}>
                    {workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegimeEditor;

