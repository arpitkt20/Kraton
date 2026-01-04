import { WorkoutRegime, Workout } from '../types/workoutRegime';
import { db } from '../db/database';

/**
 * Migrate old regime structure (with exercises) to new structure (with workouts)
 */
const migrateRegimeStructure = async (regime: any): Promise<WorkoutRegime> => {
  // Check if regime has old structure (exercises array) and needs migration
  if (regime.exercises && Array.isArray(regime.exercises) && regime.exercises.length > 0 && !regime.workouts) {
    // Convert exercises to a single default workout
    const defaultWorkout: Workout = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: 'Default Workout',
      exercises: regime.exercises
    };

    // Create new regime without exercises property
    const { exercises, ...regimeWithoutExercises } = regime;
    const migratedRegime: WorkoutRegime = {
      ...regimeWithoutExercises,
      workouts: [defaultWorkout]
    };

    // Update in database
    await db.workoutRegimes.put(migratedRegime);
    return migratedRegime;
  }

  // If already migrated or has workouts, ensure workouts array exists
  if (!regime.workouts) {
    const { exercises, ...regimeWithoutExercises } = regime;
    const migratedRegime: WorkoutRegime = {
      ...regimeWithoutExercises,
      workouts: []
    };
    await db.workoutRegimes.put(migratedRegime);
    return migratedRegime;
  }

  return regime as WorkoutRegime;
};

/**
 * Get all workout regimes from database
 */
export const getAllRegimes = async (): Promise<WorkoutRegime[]> => {
  try {
    const regimes = await db.workoutRegimes.toArray();
    // Migrate old structure and ensure dates are Date objects
    const migratedRegimes = await Promise.all(regimes.map(async r => {
      const migrated = await migrateRegimeStructure(r);
      return {
        ...migrated,
        createdAt: migrated.createdAt instanceof Date ? migrated.createdAt : new Date(migrated.createdAt),
        updatedAt: migrated.updatedAt instanceof Date ? migrated.updatedAt : new Date(migrated.updatedAt)
      };
    }));
    return migratedRegimes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Error reading regimes:', error);
    return [];
  }
};

/**
 * Save a new workout regime
 */
export const saveRegime = async (regime: Omit<WorkoutRegime, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutRegime> => {
  const newRegime: WorkoutRegime = {
    ...regime,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await db.workoutRegimes.add(newRegime);
  return newRegime;
};

/**
 * Update an existing workout regime
 */
export const updateRegime = async (regimeId: string, regime: Partial<WorkoutRegime>): Promise<WorkoutRegime | null> => {
  try {
    const existing = await db.workoutRegimes.get(regimeId);
    if (!existing) return null;
    
    const updatedRegime: WorkoutRegime = {
      ...existing,
      ...regime,
      id: regimeId,
      updatedAt: new Date()
    };
    
    await db.workoutRegimes.put(updatedRegime);
    return updatedRegime;
  } catch (error) {
    console.error('Error updating regime:', error);
    return null;
  }
};

/**
 * Delete a workout regime
 */
export const deleteRegime = async (regimeId: string): Promise<boolean> => {
  try {
    await db.workoutRegimes.delete(regimeId);
    return true;
  } catch (error) {
    console.error('Error deleting regime:', error);
    return false;
  }
};

/**
 * Get a regime by ID
 */
export const getRegimeById = async (regimeId: string): Promise<WorkoutRegime | null> => {
  try {
    const regime = await db.workoutRegimes.get(regimeId);
    if (!regime) return null;
    
    // Migrate old structure if needed
    const migrated = await migrateRegimeStructure(regime);
    
    // Ensure dates are Date objects
    return {
      ...migrated,
      createdAt: migrated.createdAt instanceof Date ? migrated.createdAt : new Date(migrated.createdAt),
      updatedAt: migrated.updatedAt instanceof Date ? migrated.updatedAt : new Date(migrated.updatedAt)
    };
  } catch (error) {
    console.error('Error reading regime:', error);
    return null;
  }
};

