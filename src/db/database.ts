import Dexie, { Table } from 'dexie';
import { BodyMeasurement } from '../types/bodyTracker';
import { WorkoutRegime } from '../types/workoutRegime';
import { WorkoutSession } from '../types/workoutSession';
import { ExerciseData } from '../components/ExerciseModal';

// Extended ExerciseData with id for database
export interface Exercise extends ExerciseData {
  id?: number;
}

// Database class
export class KratonDatabase extends Dexie {
  exercises!: Table<Exercise, number>;
  bodyMeasurements!: Table<BodyMeasurement, string>;
  workoutRegimes!: Table<WorkoutRegime, string>;
  workoutSessions!: Table<WorkoutSession, string>;

  constructor() {
    super('KratonDB');
    
    this.version(1).stores({
      exercises: '++id, name, category, type',
      bodyMeasurements: 'id, date',
      workoutRegimes: 'id, createdAt, updatedAt'
    });
    
    // Version 2: Rename workoutRegimes to workoutRegimes
    this.version(2).stores({
      exercises: '++id, name, category, type',
      bodyMeasurements: 'id, date',
      workoutRegimes: 'id, createdAt, updatedAt'
    }).upgrade(async (tx) => {
      // Migrate data from workoutRegimes to workoutRegimes
      const Regimes = await tx.table('workoutRegimes').toArray();
      if (Regimes.length > 0) {
        await tx.table('workoutRegimes').bulkAdd(Regimes);
        await tx.table('workoutRegimes').clear();
      }
    });

    // Version 3: Add workout sessions table
    this.version(3).stores({
      exercises: '++id, name, category, type',
      bodyMeasurements: 'id, date',
      workoutRegimes: 'id, createdAt, updatedAt',
      workoutSessions: 'id, date, regimeId, workoutId, createdAt'
    });
  }
}

// Create and export database instance
export const db = new KratonDatabase();

