import React, { useState, useEffect } from 'react';
import { getAllSessions } from '../utils/workoutSessionUtils';
import './CalendarModal.css';

interface CalendarModalProps {
  isOpen: boolean;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, selectedDate, onDateSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set());

  // Update currentMonth to show the selected date's month when calendar opens
  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [isOpen, selectedDate]);

  // Load workout dates when calendar opens
  useEffect(() => {
    const loadWorkoutDates = async () => {
      if (isOpen) {
        try {
          const sessions = await getAllSessions();
          const datesSet = new Set<string>();
          
          sessions.forEach(session => {
            const sessionDate = session.date instanceof Date ? session.date : new Date(session.date);
            const normalizedDate = new Date(sessionDate);
            normalizedDate.setHours(0, 0, 0, 0);
            const dateStr = normalizedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
            datesSet.add(dateStr);
          });
          
          setWorkoutDates(datesSet);
        } catch (error) {
          console.error('Error loading workout dates:', error);
        }
      }
    };
    
    loadWorkoutDates();
  }, [isOpen]);

  if (!isOpen) return null;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(newDate);
    onClose();
  };

  const isSelectedDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const hasWorkout = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    const dateStr = normalizedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    return workoutDates.has(dateStr);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = isSelectedDate(day);
    const isTodayDate = isToday(day);
    const hasWorkoutEntry = hasWorkout(day);
    days.push(
      <div
        key={day}
        className={`calendar-day ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''} ${hasWorkoutEntry ? 'has-workout' : ''}`}
        onClick={() => handleDateClick(day)}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="calendar-overlay" onClick={onClose}>
      <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-header">
          <button className="calendar-nav-button" onClick={handlePrevMonth}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2 className="calendar-month-year">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button className="calendar-nav-button" onClick={handleNextMonth}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="calendar-weekdays">
          {dayNames.map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {days}
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;

