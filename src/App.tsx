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

    // Prevent zoom on iOS when keyboard appears
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Prevent zoom on input focus
    const preventZoomOnFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        // Ensure font-size is at least 16px to prevent iOS auto-zoom
        const computedStyle = window.getComputedStyle(target);
        const fontSize = parseFloat(computedStyle.fontSize);
        if (fontSize < 16) {
          (target as HTMLElement).style.fontSize = '16px';
        }
      }
    };

    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });
    document.addEventListener('focusin', preventZoomOnFocus);

    return () => {
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchend', preventDoubleTapZoom);
      document.removeEventListener('focusin', preventZoomOnFocus);
    };
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

