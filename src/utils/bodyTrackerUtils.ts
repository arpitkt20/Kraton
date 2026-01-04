import { BodyMeasurement, BodyPart, TimeInterval } from '../types/bodyTracker';
import { db } from '../db/database';

/**
 * Get all body measurements from database
 */
export const getAllMeasurements = async (): Promise<BodyMeasurement[]> => {
  try {
    const measurements = await db.bodyMeasurements.toArray();
    // Ensure dates are Date objects (Dexie handles this, but being explicit)
    return measurements.map(m => ({
      ...m,
      date: m.date instanceof Date ? m.date : new Date(m.date)
    }));
  } catch (error) {
    console.error('Error reading measurements:', error);
    return [];
  }
};

/**
 * Save a new body measurement
 */
export const saveMeasurement = async (measurement: Omit<BodyMeasurement, 'id'>): Promise<BodyMeasurement> => {
  const newMeasurement: BodyMeasurement = {
    ...measurement,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
  };
  
  await db.bodyMeasurements.add(newMeasurement);
  return newMeasurement;
};

/**
 * Get measurements for a specific body part
 */
export const getMeasurementsByBodyPart = async (bodyPart: BodyPart): Promise<BodyMeasurement[]> => {
  const allMeasurements = await getAllMeasurements();
  return allMeasurements.filter(m => {
    const fieldName = getFieldNameForBodyPart(bodyPart);
    return m[fieldName as keyof BodyMeasurement] !== undefined;
  });
};

/**
 * Get field name in BodyMeasurement interface for a body part
 */
export const getFieldNameForBodyPart = (bodyPart: BodyPart): keyof BodyMeasurement => {
  const mapping: { [key in BodyPart]: keyof BodyMeasurement } = {
    'Neck': 'neck',
    'Shoulders': 'shoulders',
    'Left Biceps': 'leftBiceps',
    'Right Biceps': 'rightBiceps',
    'Chest': 'chest',
    'Left Forearms': 'leftForearms',
    'Right Forearms': 'rightForearms',
    'Upper Abs': 'upperAbs',
    'Lower Abs': 'lowerAbs',
    'Waist': 'waist',
    'Hips': 'hips',
    'Left Thighs': 'leftThighs',
    'Right Thighs': 'rightThighs',
    'Left Calf': 'leftCalf',
    'Right Calf': 'rightCalf',
    'Weight': 'weight',
    'Body Fat (%)': 'bodyFatPercent',
    'Body Fat (Kg)': 'bodyFatKg'
  };
  return mapping[bodyPart];
};

/**
 * Get all available body parts
 */
export const getAllBodyParts = (): BodyPart[] => {
  return [
    'Neck',
    'Shoulders',
    'Left Biceps',
    'Right Biceps',
    'Chest',
    'Left Forearms',
    'Right Forearms',
    'Upper Abs',
    'Lower Abs',
    'Waist',
    'Hips',
    'Left Thighs',
    'Right Thighs',
    'Left Calf',
    'Right Calf',
    'Weight',
    'Body Fat (%)',
    'Body Fat (Kg)'
  ];
};

/**
 * Filter measurements by time interval
 */
export const filterByTimeInterval = (
  measurements: BodyMeasurement[],
  interval: TimeInterval
): BodyMeasurement[] => {
  if (interval === 'All') return measurements;
  
  const now = new Date();
  const cutoffDate = new Date();
  
  switch (interval) {
    case '1mo':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case '3mo':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case '6mo':
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    case '1yr':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return measurements.filter(m => m.date >= cutoffDate);
};

