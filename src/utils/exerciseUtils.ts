import { ExerciseData } from '../components/ExerciseModal';
import { exerciseBank } from '../data/exercises';
import { db, Exercise } from '../db/database';

/**
 * Initialize exercises database with default exercises if empty
 */
export const initializeExercises = async (): Promise<void> => {
  const count = await db.exercises.count();
  if (count === 0) {
    // Database is empty, populate with default exercises
    const exercisesToAdd: Exercise[] = exerciseBank.map(ex => ({
      ...ex,
      id: undefined // Let Dexie auto-generate the ID
    }));
    await db.exercises.bulkAdd(exercisesToAdd);
  }
};

/**
 * Get all exercises from the database
 */
export const getAllExercises = async (): Promise<ExerciseData[]> => {
  await initializeExercises();
  const exercises = await db.exercises.toArray();
  // Remove the id field to match ExerciseData interface
  return exercises.map(({ id, ...exercise }) => exercise);
};

/**
 * Get exercises filtered by category
 */
export const getExercisesByCategory = async (category: string): Promise<ExerciseData[]> => {
  const allExercises = await getAllExercises();
  return allExercises.filter(exercise => exercise.category === category);
};

/**
 * Get exercises filtered by type
 */
export const getExercisesByType = async (type: string): Promise<ExerciseData[]> => {
  const allExercises = await getAllExercises();
  return allExercises.filter(exercise => exercise.type === type);
};

/**
 * Search exercises by name
 */
export const searchExercises = async (searchTerm: string): Promise<ExerciseData[]> => {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return getAllExercises();
  
  const allExercises = await getAllExercises();
  return allExercises.filter(exercise =>
    exercise.name.toLowerCase().includes(term)
  );
};

/**
 * Get all unique categories
 */
export const getAllCategories = async (): Promise<string[]> => {
  const allExercises = await getAllExercises();
  const categories = allExercises.map(exercise => exercise.category);
  return Array.from(new Set(categories)).sort();
};

/**
 * Get all unique types
 */
export const getAllTypes = async (): Promise<string[]> => {
  const allExercises = await getAllExercises();
  const types = allExercises.map(exercise => exercise.type);
  return Array.from(new Set(types));
};

/**
 * Get exercise by name (case-insensitive)
 */
export const getExerciseByName = async (name: string): Promise<ExerciseData | undefined> => {
  const allExercises = await getAllExercises();
  return allExercises.find(
    exercise => exercise.name.toLowerCase() === name.toLowerCase()
  );
};

/**
 * Add a new exercise to the database
 */
export const addExercise = async (exercise: ExerciseData): Promise<void> => {
  // Check if exercise already exists
  const existing = await getExerciseByName(exercise.name);
  if (existing) {
    throw new Error(`Exercise "${exercise.name}" already exists`);
  }
  
  // Add to database
  await db.exercises.add({
    ...exercise,
    id: undefined // Let Dexie auto-generate the ID
  });
};

/**
 * Get total count of exercises
 */
export const getExerciseCount = async (): Promise<number> => {
  await initializeExercises();
  return db.exercises.count();
};

/**
 * Get exercise count by category
 */
export const getExerciseCountByCategory = async (): Promise<{ [category: string]: number }> => {
  const allExercises = await getAllExercises();
  const counts: { [category: string]: number } = {};
  
  allExercises.forEach(exercise => {
    counts[exercise.category] = (counts[exercise.category] || 0) + 1;
  });
  
  return counts;
};

