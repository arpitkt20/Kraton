import { WorkoutSession, WorkoutSessionExercise, WorkoutSet } from '../types/workoutSession';
import { db } from '../db/database';

/**
 * Get all workout sessions from database
 */
export const getAllSessions = async (): Promise<WorkoutSession[]> => {
  try {
    const sessions = await db.workoutSessions.toArray();
    return sessions.map(s => ({
      ...s,
      date: s.date instanceof Date ? s.date : new Date(s.date),
      createdAt: s.createdAt instanceof Date ? s.createdAt : new Date(s.createdAt)
    })).sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error('Error reading workout sessions:', error);
    return [];
  }
};

/**
 * Get sessions for a specific date
 */
export const getSessionsByDate = async (date: Date): Promise<WorkoutSession[]> => {
  try {
    // Normalize the date to start of day for comparison
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get all sessions and filter by date
    const allSessions = await db.workoutSessions.toArray();
    
    const sessions = allSessions.filter(s => {
      const sessionDate = s.date instanceof Date ? s.date : new Date(s.date);
      // Normalize session date to start of day for consistent comparison
      const normalizedSessionDate = new Date(sessionDate);
      normalizedSessionDate.setHours(0, 0, 0, 0);
      const sessionDateStr = normalizedSessionDate.toISOString().split('T')[0];
      return sessionDateStr === targetDateStr;
    });
    
    return sessions.map(s => ({
      ...s,
      date: s.date instanceof Date ? s.date : new Date(s.date),
      createdAt: s.createdAt instanceof Date ? s.createdAt : new Date(s.createdAt)
    }));
  } catch (error) {
    console.error('Error reading workout sessions by date:', error);
    return [];
  }
};

/**
 * Get sessions for a specific workout
 */
export const getSessionsByWorkout = async (workoutId: string): Promise<WorkoutSession[]> => {
  try {
    const sessions = await db.workoutSessions
      .where('workoutId')
      .equals(workoutId)
      .toArray();
    return sessions.map(s => ({
      ...s,
      date: s.date instanceof Date ? s.date : new Date(s.date),
      createdAt: s.createdAt instanceof Date ? s.createdAt : new Date(s.createdAt)
    })).sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error('Error reading workout sessions:', error);
    return [];
  }
};

/**
 * Get the most recent session for a workout
 */
export const getLatestSessionForWorkout = async (workoutId: string): Promise<WorkoutSession | null> => {
  try {
    const sessions = await getSessionsByWorkout(workoutId);
    return sessions.length > 0 ? sessions[0] : null;
  } catch (error) {
    console.error('Error reading latest workout session:', error);
    return null;
  }
};

/**
 * Get previous values for an exercise in a workout
 */
export const getPreviousExerciseValues = async (
  workoutId: string,
  exerciseId: string
): Promise<{ sets: number; reps?: number; weight?: number; distance?: number; time?: number } | null> => {
  try {
    const latestSession = await getLatestSessionForWorkout(workoutId);
    if (!latestSession) return null;

    const exercise = latestSession.exercises.find(e => e.exerciseId === exerciseId);
    if (!exercise || exercise.sets.length === 0) return null;

    // Get the last completed set
    const lastSet = exercise.sets[exercise.sets.length - 1];
    if (!lastSet.completed) return null;

    return {
      sets: exercise.sets.length,
      reps: lastSet.reps,
      weight: lastSet.weight,
      distance: lastSet.distance,
      time: lastSet.time
    };
  } catch (error) {
    console.error('Error reading previous exercise values:', error);
    return null;
  }
};

/**
 * Get a session by ID
 */
export const getSessionById = async (sessionId: string): Promise<WorkoutSession | null> => {
  try {
    const session = await db.workoutSessions.get(sessionId);
    if (!session) return null;
    
    return {
      ...session,
      date: session.date instanceof Date ? session.date : new Date(session.date),
      createdAt: session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt)
    };
  } catch (error) {
    console.error('Error reading workout session:', error);
    return null;
  }
};

/**
 * Save a workout session
 * Only one session per day is allowed - if a session exists for the date, it will be updated
 */
export const saveWorkoutSession = async (session: Omit<WorkoutSession, 'id' | 'createdAt'>): Promise<WorkoutSession> => {
  // Normalize the date to start of day (00:00:00) in local time to avoid timezone issues
  const normalizedDate = new Date(session.date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  // Check if a session already exists for this date
  const existingSessions = await getSessionsByDate(normalizedDate);
  
  if (existingSessions.length > 0) {
    // Update the existing session instead of creating a new one
    const existingSession = existingSessions[0];
    return await updateWorkoutSession(existingSession.id, {
      date: normalizedDate,
      regimeId: session.regimeId,
      regimeName: session.regimeName,
      workoutId: session.workoutId,
      workoutName: session.workoutName,
      exercises: session.exercises
    }) || existingSession;
  }
  
  const newSession: WorkoutSession = {
    ...session,
    date: normalizedDate,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date()
  };
  
  await db.workoutSessions.add(newSession);
  return newSession;
};

/**
 * Update a workout session
 */
export const updateWorkoutSession = async (sessionId: string, session: Partial<WorkoutSession>): Promise<WorkoutSession | null> => {
  try {
    const existing = await db.workoutSessions.get(sessionId);
    if (!existing) return null;
    
    // Normalize the date to start of day (00:00:00) in local time if date is being updated
    const updatedData: Partial<WorkoutSession> = { ...session };
    if (updatedData.date) {
      const normalizedDate = new Date(updatedData.date);
      normalizedDate.setHours(0, 0, 0, 0);
      updatedData.date = normalizedDate;
    }
    
    const updatedSession: WorkoutSession = {
      ...existing,
      ...updatedData,
      id: sessionId
    };
    
    await db.workoutSessions.put(updatedSession);
    return updatedSession;
  } catch (error) {
    console.error('Error updating workout session:', error);
    return null;
  }
};

/**
 * Delete a workout session
 */
export const deleteWorkoutSession = async (sessionId: string): Promise<boolean> => {
  try {
    await db.workoutSessions.delete(sessionId);
    return true;
  } catch (error) {
    console.error('Error deleting workout session:', error);
    return false;
  }
};

