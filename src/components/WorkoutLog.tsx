import React, { useState, useRef, useEffect } from 'react';
import CalendarModal from './CalendarModal';
import ExerciseModal, { ExerciseData } from './ExerciseModal';
import ExerciseDatabase from './ExerciseDatabase';
import BodyTracker from './BodyTracker';
import Settings from './Settings';
import Analytics from './Analytics';
import WorkoutRegimes from './WorkoutRegimes';
import RegimeEditor from './RegimeEditor';
import RegimeSelector from './RegimeSelector';
import WorkoutSelector from './WorkoutSelector';
import ActiveWorkout from './ActiveWorkout';
import LoggedWorkouts from './LoggedWorkouts';
import { WorkoutRegime, Workout } from '../types/workoutRegime';
import { WorkoutSession } from '../types/workoutSession';
import { addExercise, getAllExercises } from '../utils/exerciseUtils';
import { getSessionsByDate, saveWorkoutSession, deleteWorkoutSession, getAllSessions } from '../utils/workoutSessionUtils';
import { getAllMeasurements, saveMeasurement } from '../utils/bodyTrackerUtils';
import { getAllRegimes, saveRegime } from '../utils/workoutRegimeUtils';
import { db } from '../db/database';
import './WorkoutLog.css';

const WorkoutLog: React.FC = () => {
  // Initialize with today's date, normalized to start of day
  const getInitialDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };
  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [showExerciseDatabase, setShowExerciseDatabase] = useState(false);
  const [showBodyTracker, setShowBodyTracker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showWorkoutRegimes, setShowWorkoutRegimes] = useState(false);
  const [showRegimeEditor, setShowRegimeEditor] = useState(false);
  const [editingRegimeId, setEditingRegimeId] = useState<string | null>(null);
  const [showRegimeSelector, setShowRegimeSelector] = useState(false);
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [showActiveWorkout, setShowActiveWorkout] = useState(false);
  const [selectedRegime, setSelectedRegime] = useState<WorkoutRegime | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [loggedWorkouts, setLoggedWorkouts] = useState<WorkoutSession[]>([]);
  const [isCopyMode, setIsCopyMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formattedDate = selectedDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  }).toUpperCase();

  const handleDateSelect = (date: Date) => {
    // Normalize date to start of day for consistency
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    if (isCopyMode) {
      // Handle copy mode - copy workout from selected date to current selectedDate
      handleCopyWorkout(normalizedDate);
      setIsCopyMode(false);
      setIsCalendarOpen(false);
    } else {
      setSelectedDate(normalizedDate);
    }
  };

  const handleCopyWorkout = async (sourceDate: Date) => {
    try {
      // Get workout session from the source date
      const sourceSessions = await getSessionsByDate(sourceDate);
      
      if (sourceSessions.length === 0) {
        alert('No workout found on the selected date.');
        return;
      }

      const sourceSession = sourceSessions[0];
      
      // Check if there's already a workout on the current selected date
      const existingSessions = await getSessionsByDate(selectedDate);
      
      if (existingSessions.length > 0) {
        const confirmCopy = confirm('A workout already exists for this date. Do you want to replace it?');
        if (!confirmCopy) {
          return;
        }
      }

      // Copy the workout to the current selected date
      // Create a new session with the same data but new date
      const copiedSession = {
        date: selectedDate,
        regimeId: sourceSession.regimeId,
        regimeName: sourceSession.regimeName,
        workoutId: sourceSession.workoutId,
        workoutName: sourceSession.workoutName,
        exercises: sourceSession.exercises.map(exercise => ({
          ...exercise,
          sets: exercise.sets.map(set => ({
            ...set,
            completed: false // Reset completion status
          }))
        }))
      };

      await saveWorkoutSession(copiedSession);
      
      // Reload logged workouts for the current date
      const sessions = await getSessionsByDate(selectedDate);
      setLoggedWorkouts(sessions);
      
      alert('Workout copied successfully!');
    } catch (error) {
      console.error('Error copying workout:', error);
      alert('Failed to copy workout. Please try again.');
    }
  };

  const handleCopyPreviousWorkout = () => {
    setIsCopyMode(true);
    setIsCalendarOpen(true);
  };

  // Load logged workouts for selected date
  useEffect(() => {
    const loadLoggedWorkouts = async () => {
      const sessions = await getSessionsByDate(selectedDate);
      setLoggedWorkouts(sessions);
    };
    loadLoggedWorkouts();
  }, [selectedDate]);

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    newDate.setHours(0, 0, 0, 0);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    newDate.setHours(0, 0, 0, 0);
    setSelectedDate(newDate);
  };

  const handleCalendarIconClick = () => {
    setIsCalendarOpen(true);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuOptionClick = (option: string) => {
    setIsMenuOpen(false);
    
    if (option === 'Workout DB') {
      setShowExerciseDatabase(true);
    } else if (option === 'Export DB') {
      handleExportDB();
    } else if (option === 'Import DB') {
      handleImportDB();
    } else if (option === 'Body Tracker') {
      setShowBodyTracker(true);
    } else if (option === 'Settings') {
      setShowSettings(true);
    } else if (option === 'Analytics') {
      setShowAnalytics(true);
    } else {
      console.log(`Selected: ${option}`);
      // TODO: Navigate to respective pages for other options
    }
  };

  const handleExportDB = async () => {
    try {
      // Get all data from database
      const exercises = await getAllExercises();
      const bodyMeasurements = await getAllMeasurements();
      const workoutSessions = await getAllSessions();
      const workoutRegimes = await getAllRegimes();

      // Convert Date objects to ISO strings for JSON serialization
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        exercises: exercises,
        bodyMeasurements: bodyMeasurements.map(m => ({
          ...m,
          date: m.date instanceof Date ? m.date.toISOString() : m.date
        })),
        workoutSessions: workoutSessions.map(s => ({
          ...s,
          date: s.date instanceof Date ? s.date.toISOString() : s.date,
          createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt
        })),
        workoutRegimes: workoutRegimes.map(r => ({
          ...r,
          createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
          updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt
        }))
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kraton-full-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      const totalItems = exercises.length + bodyMeasurements.length + workoutSessions.length + workoutRegimes.length;
      alert(`Database exported successfully!\n\nExported:\n- ${exercises.length} exercises\n- ${bodyMeasurements.length} body measurements\n- ${workoutSessions.length} workout sessions\n- ${workoutRegimes.length} workout regimes\n\nTotal: ${totalItems} items`);
    } catch (error) {
      console.error('Error exporting database:', error);
      alert('Failed to export database. Please try again.');
    }
  };

  const handleImportDB = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        // Check if it's the new format (with version) or old format (just exercises array)
        let exercises: ExerciseData[] = [];
        let bodyMeasurements: any[] = [];
        let workoutSessions: any[] = [];
        let workoutRegimes: any[] = [];

        if (importedData.version && importedData.exercises) {
          // New format with all data
          exercises = importedData.exercises || [];
          bodyMeasurements = importedData.bodyMeasurements || [];
          workoutSessions = importedData.workoutSessions || [];
          workoutRegimes = importedData.workoutRegimes || [];
        } else if (Array.isArray(importedData)) {
          // Old format - just exercises array
          exercises = importedData;
        } else {
          throw new Error('Invalid file format');
        }

        // Validate data
        const validExercises = exercises.filter(ex => ex.name && ex.category && ex.type);
        const validBodyMeasurements = bodyMeasurements.filter(m => m.id && m.date);
        const validWorkoutSessions = workoutSessions.filter(s => s.id && s.date);
        const validWorkoutRegimes = workoutRegimes.filter(r => r.id && r.name);

        const totalItems = validExercises.length + validBodyMeasurements.length + 
                          validWorkoutSessions.length + validWorkoutRegimes.length;

        if (totalItems === 0) {
          alert('No valid data found in the file.');
          return;
        }

        // Confirm before importing (will replace all existing data)
        const confirmMessage = `This will replace all existing data in the database.\n\n` +
          `Found in file:\n` +
          `- ${validExercises.length} exercises\n` +
          `- ${validBodyMeasurements.length} body measurements\n` +
          `- ${validWorkoutSessions.length} workout sessions\n` +
          `- ${validWorkoutRegimes.length} workout regimes\n\n` +
          `Total: ${totalItems} items\n\n` +
          `Do you want to continue?`;

        if (!confirm(confirmMessage)) {
          return;
        }

        // Clear existing data and import new data
        try {
          // Clear all tables
          await db.exercises.clear();
          await db.bodyMeasurements.clear();
          await db.workoutSessions.clear();
          await db.workoutRegimes.clear();

          // Import exercises
          if (validExercises.length > 0) {
            const exercisesToAdd = validExercises.map(ex => ({
              ...ex,
              id: undefined // Let Dexie auto-generate
            }));
            await db.exercises.bulkAdd(exercisesToAdd);
          }

          // Import body measurements (convert ISO strings back to Date objects)
          if (validBodyMeasurements.length > 0) {
            const measurementsToAdd = validBodyMeasurements.map(m => ({
              ...m,
              date: m.date instanceof Date ? m.date : new Date(m.date)
            }));
            await db.bodyMeasurements.bulkAdd(measurementsToAdd);
          }

          // Import workout sessions (convert ISO strings back to Date objects)
          if (validWorkoutSessions.length > 0) {
            const sessionsToAdd = validWorkoutSessions.map(s => ({
              ...s,
              date: s.date instanceof Date ? s.date : new Date(s.date),
              createdAt: s.createdAt instanceof Date ? s.createdAt : new Date(s.createdAt)
            }));
            await db.workoutSessions.bulkAdd(sessionsToAdd);
          }

          // Import workout regimes (convert ISO strings back to Date objects)
          if (validWorkoutRegimes.length > 0) {
            const regimesToAdd = validWorkoutRegimes.map(r => ({
              ...r,
              createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
              updatedAt: r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt)
            }));
            await db.workoutRegimes.bulkAdd(regimesToAdd);
          }

          // Show success message
          alert(`Successfully imported:\n` +
            `- ${validExercises.length} exercises\n` +
            `- ${validBodyMeasurements.length} body measurements\n` +
            `- ${validWorkoutSessions.length} workout sessions\n` +
            `- ${validWorkoutRegimes.length} workout regimes\n\n` +
            `Total: ${totalItems} items imported!`);

          // Trigger refresh in components
          window.dispatchEvent(new Event('exerciseDatabaseUpdated'));
          
          // Reload logged workouts if on current date
          const sessions = await getSessionsByDate(selectedDate);
          setLoggedWorkouts(sessions);
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Failed to import some data. Please check the console for details.');
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Failed to parse the file. Please make sure it is a valid JSON file.');
      }
    };

    reader.onerror = () => {
      console.error('Error reading file');
      alert('Failed to read file. Please try again.');
    };

    reader.readAsText(file);
  };

  const handleExerciseSave = async (exercise: ExerciseData) => {
    try {
      // Add to exercise database
      await addExercise(exercise);
      console.log('Exercise saved to database:', exercise);
      // Dispatch custom event to notify ExerciseDatabase to refresh (before closing modal)
      window.dispatchEvent(new Event('exerciseSaved'));
      // Close modal after saving with a small delay to ensure event is processed
      setTimeout(() => {
        setIsExerciseModalOpen(false);
      }, 100);
    } catch (error) {
      console.error('Error saving exercise:', error);
      alert(`Error saving exercise: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleHomeClick = () => {
    // Reset to current date (today) - normalize to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);
    // Close any open modals
    setIsCalendarOpen(false);
    setIsMenuOpen(false);
    setIsExerciseModalOpen(false);
    setShowExerciseDatabase(false);
    setShowWorkoutRegimes(false);
    setShowBodyTracker(false);
    setShowSettings(false);
    setShowAnalytics(false);
    setEditingRegimeId(null);
  };

  const handlePlusIconClick = () => {
    setShowWorkoutRegimes(true);
  };

  const handleStartNewWorkout = () => {
    setShowRegimeSelector(true);
  };

  const handleRegimeSelect = (regime: WorkoutRegime) => {
    setSelectedRegime(regime);
    setShowRegimeSelector(false);
    setShowWorkoutSelector(true);
  };

  const handleWorkoutSelect = (workout: Workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutSelector(false);
    setShowActiveWorkout(true);
  };

  const handleWorkoutBack = () => {
    setShowWorkoutSelector(false);
    setShowRegimeSelector(true);
    setSelectedRegime(null);
  };

  const handleRegimeSelectorBack = () => {
    setShowRegimeSelector(false);
    setSelectedRegime(null);
  };

  const handleActiveWorkoutBack = () => {
    setShowActiveWorkout(false);
    setShowWorkoutSelector(true);
    setSelectedWorkout(null);
  };

  const handleWorkoutComplete = async () => {
    setShowActiveWorkout(false);
    setShowWorkoutSelector(false);
    setShowRegimeSelector(false);
    setSelectedRegime(null);
    setSelectedWorkout(null);
    setEditingSessionId(null);
    // Reload logged workouts for the selected date
    const sessions = await getSessionsByDate(selectedDate);
    setLoggedWorkouts(sessions);
  };

  const handleEditWorkout = async (session: WorkoutSession) => {
    // Load the regime and workout for this session
    const { getAllRegimes } = await import('../utils/workoutRegimeUtils');
    const regimes = await getAllRegimes();
    const regime = regimes.find(r => r.id === session.regimeId);
    
    if (regime) {
      const workout = regime.workouts?.find(w => w.id === session.workoutId);
      if (workout) {
        setSelectedRegime(regime);
        setSelectedWorkout(workout);
        setEditingSessionId(session.id);
        setShowActiveWorkout(true);
      }
    }
  };

  const handleDeleteWorkout = async (session: WorkoutSession) => {
    const confirmDelete = confirm(`Are you sure you want to delete "${session.workoutName}" workout? This action cannot be undone.`);
    
    if (!confirmDelete) {
      return;
    }

    try {
      const success = await deleteWorkoutSession(session.id);
      if (success) {
        // Reload logged workouts for the current date
        const sessions = await getSessionsByDate(selectedDate);
        setLoggedWorkouts(sessions);
      } else {
        alert('Failed to delete workout. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout. Please try again.');
    }
  };

  const handleCreateNewRegime = (regimeId: string | null) => {
    setEditingRegimeId(regimeId);
    setShowRegimeEditor(true);
  };

  const handleEditRegime = (regimeId: string) => {
    setEditingRegimeId(regimeId);
    setShowRegimeEditor(true);
  };

  const handleRegimeEditorBack = () => {
    setShowRegimeEditor(false);
    setEditingRegimeId(null);
  };

  const handleRegimeSaved = () => {
    setShowRegimeEditor(false);
    setEditingRegimeId(null);
    // Refresh the regimes list by going back to regimes screen
    setShowWorkoutRegimes(true);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Show Exercise Database if active
  if (showExerciseDatabase) {
    return (
      <>
        <ExerciseDatabase
          onBack={() => setShowExerciseDatabase(false)}
          onCreateExercise={() => setIsExerciseModalOpen(true)}
          refreshTrigger={isExerciseModalOpen}
        />
        {/* Exercise Modal - can be shown on top of Exercise Database */}
        <ExerciseModal
          isOpen={isExerciseModalOpen}
          onClose={() => setIsExerciseModalOpen(false)}
          onSave={handleExerciseSave}
        />
      </>
    );
  }

  // Show Body Tracker if active
  if (showBodyTracker) {
    return (
      <BodyTracker onBack={() => setShowBodyTracker(false)} />
    );
  }

  // Show Settings if active
  if (showSettings) {
    return (
      <Settings onBack={() => setShowSettings(false)} />
    );
  }

  // Show Analytics if active
  if (showAnalytics) {
    return (
      <Analytics onBack={() => setShowAnalytics(false)} />
    );
  }

  // Show Regime Selector if active
  if (showRegimeSelector) {
    return (
      <RegimeSelector
        onSelectRegime={handleRegimeSelect}
        onBack={handleRegimeSelectorBack}
      />
    );
  }

  // Show Workout Selector if active
  if (showWorkoutSelector && selectedRegime) {
    return (
      <WorkoutSelector
        regime={selectedRegime}
        onSelectWorkout={handleWorkoutSelect}
        onBack={handleWorkoutBack}
      />
    );
  }

  // Show Active Workout if active
  if (showActiveWorkout && selectedRegime && selectedWorkout) {
    return (
      <ActiveWorkout
        regime={selectedRegime}
        workout={selectedWorkout}
        selectedDate={selectedDate}
        sessionId={editingSessionId}
        onBack={handleActiveWorkoutBack}
        onComplete={handleWorkoutComplete}
      />
    );
  }

  // Show Regime Editor if active
  if (showRegimeEditor) {
    return (
      <RegimeEditor
        regimeId={editingRegimeId}
        onBack={handleRegimeEditorBack}
        onSave={handleRegimeSaved}
      />
    );
  }

  // Show Workout Regimes if active
  if (showWorkoutRegimes) {
    return (
      <WorkoutRegimes
        onBack={() => setShowWorkoutRegimes(false)}
        onCreateNew={handleCreateNewRegime}
        onEditRegime={handleEditRegime}
      />
    );
  }

  return (
    <div className="workout-log">
      {/* Top Header Bar */}
      <header className="header">
        <div className="header-left">
          <button 
            className="app-name-link"
            onClick={handleHomeClick}
            aria-label="Go to home"
          >
            <img src="/Kraton/kraton_banner.png" alt="Kraton" className="banner-logo" />
          </button>
        </div>
        <div className="header-right">
          <button 
            className="header-icon-button"
            onClick={handleCalendarIconClick}
            aria-label="Open calendar"
          >
            <svg className="header-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <button 
            className="header-icon-button"
            onClick={handlePlusIconClick}
            aria-label="Create workout"
          >
            <svg className="header-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="menu-container" ref={menuRef}>
            <button 
              className="header-icon-button"
              onClick={handleMenuToggle}
              aria-label="Open menu"
            >
              <svg className="header-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="5" r="1" fill="currentColor"/>
                <circle cx="12" cy="12" r="1" fill="currentColor"/>
                <circle cx="12" cy="19" r="1" fill="currentColor"/>
              </svg>
            </button>
            {isMenuOpen && (
              <div className="dropdown-menu">
                <button 
                  className="menu-item"
                  onClick={() => handleMenuOptionClick('Settings')}
                >
                  Settings
                </button>
                <button 
                  className="menu-item"
                  onClick={() => handleMenuOptionClick('Analytics')}
                >
                  Analytics
                </button>
                <button 
                  className="menu-item"
                  onClick={() => handleMenuOptionClick('Body Tracker')}
                >
                  Body Tracker
                </button>
                <button 
                  className="menu-item"
                  onClick={() => handleMenuOptionClick('Workout DB')}
                >
                  Workout DB
                </button>
                <button 
                  className="menu-item"
                  onClick={() => handleMenuOptionClick('Export DB')}
                >
                  Export DB
                </button>
                <button 
                  className="menu-item"
                  onClick={() => handleMenuOptionClick('Import DB')}
                >
                  Import DB
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Date Navigation Bar */}
      <div className="date-nav">
        <button className="nav-arrow" onClick={handlePrevDay} aria-label="Previous day">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="date-text">{formattedDate}</div>
        <button className="nav-arrow" onClick={handleNextDay} aria-label="Next day">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Main Content Area */}
      <main className={`main-content ${loggedWorkouts.length > 0 ? 'has-workouts' : ''}`}>
        {loggedWorkouts.length > 0 ? (
          <LoggedWorkouts workouts={loggedWorkouts} onEdit={handleEditWorkout} onDelete={handleDeleteWorkout} />
        ) : (
          <div className="empty-state">
            <p className="empty-text">Workout Log Empty</p>
            
            <div className="action-buttons">
              <button className="action-button" onClick={handleStartNewWorkout}>
                <div className="action-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="action-text">Start New Workout</span>
              </button>

              <button className="action-button" onClick={handleCopyPreviousWorkout}>
                <div className="action-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="action-text">Copy Previous Workout</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onClose={() => {
          setIsCalendarOpen(false);
          setIsCopyMode(false);
        }}
      />

      {/* Exercise Modal */}
      <ExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onSave={handleExerciseSave}
      />

      {/* Hidden file input for importing */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default WorkoutLog;

