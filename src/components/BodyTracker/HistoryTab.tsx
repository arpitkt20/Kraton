import React, { useState, useEffect, useMemo } from 'react';
import { BodyPart } from '../../types/bodyTracker';
import { getAllBodyParts, getMeasurementsByBodyPart, getFieldNameForBodyPart } from '../../utils/bodyTrackerUtils';
import './HistoryTab.css';

const HistoryTab: React.FC = () => {
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart>('Weight');
  const [measurements, setMeasurements] = useState<any[]>([]);

  useEffect(() => {
    const loadMeasurements = async () => {
      const data = await getMeasurementsByBodyPart(selectedBodyPart);
      setMeasurements(data);
    };
    loadMeasurements();
  }, [selectedBodyPart]);

  const historyData = useMemo(() => {
    const fieldName = getFieldNameForBodyPart(selectedBodyPart);
    
    return measurements
      .map(m => ({
        id: m.id,
        date: m.date,
        value: m[fieldName] as number
      }))
      .filter(d => d.value !== undefined)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Newest first
  }, [measurements, selectedBodyPart]);

  const bodyParts = getAllBodyParts();

  return (
    <div className="history-tab">
      <div className="history-controls">
        <label htmlFor="history-body-part-select" className="history-label">
          Body Part
        </label>
        <select
          id="history-body-part-select"
          className="history-select"
          value={selectedBodyPart}
          onChange={(e) => setSelectedBodyPart(e.target.value as BodyPart)}
        >
          {bodyParts.map(part => (
            <option key={part} value={part}>{part}</option>
          ))}
        </select>
      </div>

      <div className="history-list-container">
        {historyData.length === 0 ? (
          <div className="history-empty">
            <p>No measurements found for {selectedBodyPart}</p>
            <p className="history-empty-subtitle">Add measurements in the Measurement tab</p>
          </div>
        ) : (
          <div className="history-list">
            <div className="history-header">
              <div className="history-header-date">Date</div>
              <div className="history-header-value">Value</div>
            </div>
            {historyData.map(item => (
              <div key={item.id} className="history-item">
                <div className="history-date">
                  {item.date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="history-value">
                  {item.value.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTab;

