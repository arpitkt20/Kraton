import React, { useState, useEffect } from 'react';
import appIcon from '../resources/icon.png';
import './SplashScreen.css';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [show, setShow] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Always show splash on app launch
    setShow(true);

    // Show splash for 5 seconds
    const timer = setTimeout(() => {
      setShow(false);
      // Call onComplete after fade out animation
      setTimeout(() => {
        setShouldRender(false);
        onComplete();
      }, 300); // Wait for fade out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={`splash-screen ${!show ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <img src={appIcon} alt="Kraton" className="splash-icon" />
      </div>
    </div>
  );
};

export default SplashScreen;

