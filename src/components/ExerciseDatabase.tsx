import React, { useState, useEffect, useMemo } from 'react';
import { ExerciseData } from './ExerciseModal';
import { getAllExercises, getAllCategories } from '../utils/exerciseUtils';
import './ExerciseDatabase.css';

interface ExerciseDatabaseProps {
  onBack: () => void;
  onCreateExercise: () => void;
  refreshTrigger?: boolean;
}

const ExerciseDatabase: React.FC<ExerciseDatabaseProps> = ({ onBack, onCreateExercise, refreshTrigger }) => {
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [prevRefreshTrigger, setPrevRefreshTrigger] = useState<boolean | undefined>(undefined);

  // Refresh exercises from database
  const handleRefresh = async () => {
    const loadedExercises = await getAllExercises();
    setExercises(loadedExercises);
    // Also update categories
    const cats = await getAllCategories();
    setCategories(['All', ...cats]);
  };

  useEffect(() => {
    // Load exercises from database on mount
    handleRefresh();
    
    // Refresh when window regains focus (handles modal close scenario)
    const handleFocus = () => {
      handleRefresh();
    };
    window.addEventListener('focus', handleFocus);
    
    // Listen for custom event when exercise is saved
    const handleExerciseSaved = () => {
      handleRefresh();
    };
    window.addEventListener('exerciseSaved', handleExerciseSaved);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('exerciseSaved', handleExerciseSaved);
    };
  }, []);

  // Refresh when modal closes (refreshTrigger changes from true to false)
  useEffect(() => {
    if (prevRefreshTrigger !== undefined && prevRefreshTrigger === true && refreshTrigger === false) {
      // Modal just closed after being open, refresh the list
      // Add a small delay to ensure the exercise is fully saved
      setTimeout(() => {
        handleRefresh();
      }, 150);
    }
    setPrevRefreshTrigger(refreshTrigger);
  }, [refreshTrigger, prevRefreshTrigger]);

  // Group exercises by category
  const exercisesByCategory = useMemo(() => {
    const grouped: { [key: string]: ExerciseData[] } = {};
    
    exercises.forEach(exercise => {
      if (!grouped[exercise.category]) {
        grouped[exercise.category] = [];
      }
      grouped[exercise.category].push(exercise);
    });

    // Sort categories alphabetically
    const sortedCategories = Object.keys(grouped).sort();
    const result: { [key: string]: ExerciseData[] } = {};
    sortedCategories.forEach(cat => {
      result[cat] = grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
    });

    return result;
  }, [exercises]);

  // Filter exercises based on selected category
  const filteredExercises = useMemo(() => {
    if (selectedCategory === 'All') {
      return exercisesByCategory;
    }
    return { [selectedCategory]: exercisesByCategory[selectedCategory] || [] };
  }, [exercisesByCategory, selectedCategory]);

  return (
    <div className="exercise-database">
      <header className="exercise-database-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="exercise-database-title">Exercise Database</h1>
        <div style={{ width: '24px' }}></div> {/* Spacer for centering */}
      </header>

      <div className="exercise-database-content">
        {/* Create New Exercise Button */}
        <button className="create-exercise-button" onClick={onCreateExercise}>
          <svg className="create-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="create-text">Create New Exercise</span>
        </button>

        {/* Category Filter */}
        <div className="filter-section">
          <label htmlFor="category-filter" className="filter-label">
            Filter by Muscle Group:
          </label>
          <select
            id="category-filter"
            className="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Exercises List by Category */}
        {Object.keys(filteredExercises).length === 0 ? (
          <div className="exercises-empty">
            <p>No exercises found</p>
            <p className="exercises-empty-subtitle">Create your first exercise to get started</p>
          </div>
        ) : (
          <div className="exercises-list">
            {Object.entries(filteredExercises).map(([category, categoryExercises]) => (
              <div key={category} className="category-section">
                <h2 className="category-title">
                  {category}
                  <span className="category-count">({categoryExercises.length})</span>
                </h2>
                <div className="exercises-grid">
                  {categoryExercises.map((exercise, index) => (
                    <div key={`${exercise.name}-${index}`} className="exercise-item">
                      <div className="exercise-info">
                        <h3 className="exercise-name">{exercise.name}</h3>
                        <p className="exercise-type">{exercise.type}</p>
                        {exercise.notes && (
                          <p className="exercise-notes">{exercise.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseDatabase;

