import React, { useState, useEffect } from 'react';
import { saveMeasurement, getMeasurementsByBodyPart, getFieldNameForBodyPart } from '../../utils/bodyTrackerUtils';
import { BodyPart } from '../../types/bodyTracker';
import './MeasurementTab.css';

const MeasurementTab: React.FC = () => {
  const [formData, setFormData] = useState({
    neck: '',
    shoulders: '',
    leftBiceps: '',
    rightBiceps: '',
    chest: '',
    leftForearms: '',
    rightForearms: '',
    upperAbs: '',
    lowerAbs: '',
    waist: '',
    hips: '',
    leftThighs: '',
    rightThighs: '',
    leftCalf: '',
    rightCalf: '',
    weight: '',
    bodyFatPercent: '',
    bodyFatKg: ''
  });

  const [latestValues, setLatestValues] = useState<{ [key: string]: string }>({});

  // Load latest values for all body parts
  useEffect(() => {
    const loadLatestValues = async () => {
      const values: { [key: string]: string } = {};
      for (const field of measurementFields) {
        const measurements = await getMeasurementsByBodyPart(field.bodyPart);
        if (measurements.length > 0) {
          const fieldName = getFieldNameForBodyPart(field.bodyPart);
          const latest = measurements[0]; // Already sorted by date (newest first)
          const value = latest[fieldName as keyof typeof latest] as number | undefined;
          if (value !== undefined) {
            values[field.key] = value.toString();
          }
        }
      }
      setLatestValues(values);
    };
    loadLatestValues();
  }, []);

  // Get latest value for a field
  const getLatestValue = (fieldKey: keyof typeof formData): string => {
    return latestValues[fieldKey] || '';
  };

  const measurementFields: Array<{ key: keyof typeof formData; label: string; bodyPart: BodyPart }> = [
    { key: 'neck', label: 'Neck', bodyPart: 'Neck' },
    { key: 'shoulders', label: 'Shoulders', bodyPart: 'Shoulders' },
    { key: 'leftBiceps', label: 'Left Biceps', bodyPart: 'Left Biceps' },
    { key: 'rightBiceps', label: 'Right Biceps', bodyPart: 'Right Biceps' },
    { key: 'chest', label: 'Chest', bodyPart: 'Chest' },
    { key: 'leftForearms', label: 'Left Forearms', bodyPart: 'Left Forearms' },
    { key: 'rightForearms', label: 'Right Forearms', bodyPart: 'Right Forearms' },
    { key: 'upperAbs', label: 'Upper Abs', bodyPart: 'Upper Abs' },
    { key: 'lowerAbs', label: 'Lower Abs', bodyPart: 'Lower Abs' },
    { key: 'waist', label: 'Waist', bodyPart: 'Waist' },
    { key: 'hips', label: 'Hips', bodyPart: 'Hips' },
    { key: 'leftThighs', label: 'Left Thighs', bodyPart: 'Left Thighs' },
    { key: 'rightThighs', label: 'Right Thighs', bodyPart: 'Right Thighs' },
    { key: 'leftCalf', label: 'Left Calf', bodyPart: 'Left Calf' },
    { key: 'rightCalf', label: 'Right Calf', bodyPart: 'Right Calf' },
    { key: 'weight', label: 'Weight', bodyPart: 'Weight' },
    { key: 'bodyFatPercent', label: 'Body Fat (%)', bodyPart: 'Body Fat (%)' },
    { key: 'bodyFatKg', label: 'Body Fat (Kg)', bodyPart: 'Body Fat (Kg)' }
  ];

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to measurement object, only including fields with values
    const measurement: any = {
      date: new Date()
    };

    Object.entries(formData).forEach(([key, value]) => {
      if (value.trim() !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          measurement[key] = numValue;
        }
      }
    });

    // Check if at least one measurement was entered
    if (Object.keys(measurement).length === 1) {
      alert('Please enter at least one measurement');
      return;
    }

    try {
      await saveMeasurement(measurement);
      alert('Measurement saved successfully!');
      
      // Reset form but keep latest values as placeholders
      const resetData: any = {};
      measurementFields.forEach(field => {
        resetData[field.key] = '';
      });
      setFormData(resetData);
      
      // Reload latest values
      const values: { [key: string]: string } = {};
      for (const field of measurementFields) {
        const measurements = await getMeasurementsByBodyPart(field.bodyPart);
        if (measurements.length > 0) {
          const fieldName = getFieldNameForBodyPart(field.bodyPart);
          const latest = measurements[0];
          const value = latest[fieldName as keyof typeof latest] as number | undefined;
          if (value !== undefined) {
            values[field.key] = value.toString();
          }
        }
      }
      setLatestValues(values);
    } catch (error) {
      console.error('Error saving measurement:', error);
      alert('Failed to save measurement. Please try again.');
    }
  };

  return (
    <div className="measurement-tab">
      <form onSubmit={handleSubmit} className="measurement-form">
        <div className="measurement-list">
          {measurementFields.map(field => {
            const latestValue = getLatestValue(field.key);
            return (
              <div key={field.key} className="measurement-row">
                <label htmlFor={field.key} className="measurement-label">
                  {field.label}
                  {latestValue && (
                    <span className="latest-value">Last: {latestValue}</span>
                  )}
                </label>
                <input
                  id={field.key}
                  type="number"
                  step="0.1"
                  className="measurement-input"
                  value={formData[field.key]}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={latestValue ? latestValue : "0.0"}
                />
              </div>
            );
          })}
        </div>

        <div className="measurement-actions">
          <button type="submit" className="save-button">
            Save Measurement
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeasurementTab;

