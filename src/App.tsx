import React, { useEffect, useState } from 'react';
import WorkoutLog from './components/WorkoutLog';
import SplashScreen from './components/SplashScreen';
import { migrateFromLocalStorage } from './db/migration';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Run migration on app startup
    migrateFromLocalStorage().catch(error => {
      console.error('Migration error:', error);
    });
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="app">
      <WorkoutLog />
    </div>
  );
}

export default App;

