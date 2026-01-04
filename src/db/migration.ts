import { db } from './database';
import { BodyMeasurement } from '../types/bodyTracker';
import { WorkoutRegime } from '../types/workoutRegime';

const MIGRATION_KEY = 'kraton-migration-completed';

/**
 * Migrate data from localStorage to Dexie database
 * This should only run once
 */
export const migrateFromLocalStorage = async (): Promise<void> => {
  // Check if migration has already been completed
  const migrationCompleted = localStorage.getItem(MIGRATION_KEY);
  if (migrationCompleted === 'true') {
    console.log('Migration already completed');
    return;
  }

  try {
    console.log('Starting migration from localStorage to Dexie...');

    // Migrate body measurements (check both old and new keys for backward compatibility)
    const oldMeasurementsKey = 'kraton-body-measurements';
    const measurementsKey = 'kraton-body-measurements';
    const storedMeasurements = localStorage.getItem(measurementsKey) || localStorage.getItem(oldMeasurementsKey);
    if (storedMeasurements) {
      try {
        const measurements: BodyMeasurement[] = JSON.parse(storedMeasurements);
        // Convert date strings to Date objects
        const convertedMeasurements = measurements.map(m => ({
          ...m,
          date: m.date instanceof Date ? m.date : new Date(m.date)
        }));
        
        // Check if database already has data
        const existingCount = await db.bodyMeasurements.count();
        if (existingCount === 0 && convertedMeasurements.length > 0) {
          await db.bodyMeasurements.bulkAdd(convertedMeasurements);
          console.log(`Migrated ${convertedMeasurements.length} body measurements`);
        }
      } catch (error) {
        console.error('Error migrating body measurements:', error);
      }
    }

    // Migrate workout regimes (check both old and new keys for backward compatibility)
    const oldRegimesKey = 'kraton-workout-Regimes';
    const regimesKey = 'kraton-workout-Regimes';
    const storedRegimes = localStorage.getItem(regimesKey) || localStorage.getItem(oldRegimesKey);
    if (storedRegimes) {
      try {
        const regimes: WorkoutRegime[] = JSON.parse(storedRegimes);
        // Convert date strings to Date objects
        const convertedRegimes = regimes.map(r => ({
          ...r,
          createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
          updatedAt: r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt)
        }));
        
        // Check if database already has data
        const existingCount = await db.workoutRegimes.count();
        if (existingCount === 0 && convertedRegimes.length > 0) {
          await db.workoutRegimes.bulkAdd(convertedRegimes);
          console.log(`Migrated ${convertedRegimes.length} workout regimes`);
        }
      } catch (error) {
        console.error('Error migrating workout regimes:', error);
      }
    }

    // Mark migration as completed
    localStorage.setItem(MIGRATION_KEY, 'true');
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

