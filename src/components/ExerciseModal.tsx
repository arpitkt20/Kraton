import React, { useState } from 'react';
import './ExerciseModal.css';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: ExerciseData) => void;
}

export interface ExerciseData {
  name: string;
  notes: string;
  category: string;
  type: string;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const categories = ['Abs', 'Back', 'Biceps', 'Cardio', 'Chest', 'Forearms', 'Legs', 'Neck', 'Shoulders', 'Triceps'];
  const types = ['Weight and Reps', 'Distance and Time'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!category) {
      newErrors.category = 'Category is required';
    }
    if (!type) {
      newErrors.type = 'Type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const exerciseData: ExerciseData = {
      name: name.trim(),
      notes: notes.trim(),
      category,
      type
    };

    onSave(exerciseData);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setNotes('');
    setCategory('');
    setType('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="exercise-modal-overlay" onClick={handleClose}>
      <div className="exercise-modal" onClick={(e) => e.stopPropagation()}>
        <div className="exercise-modal-header">
          <h2 className="exercise-modal-title">Create New Exercise</h2>
          <button className="exercise-modal-close" onClick={handleClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="exercise-form">
          <div className="form-group">
            <label htmlFor="exercise-name" className="form-label">
              Name <span className="required">*</span>
            </label>
            <input
              id="exercise-name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="Enter exercise name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="exercise-notes" className="form-label">
              Notes <span className="optional">(Optional)</span>
            </label>
            <textarea
              id="exercise-notes"
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter additional notes"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="exercise-category" className="form-label">
              Category <span className="required">*</span>
            </label>
            <select
              id="exercise-category"
              className={`form-select ${errors.category ? 'error' : ''}`}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (errors.category) setErrors({ ...errors, category: '' });
              }}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="exercise-type" className="form-label">
              Type <span className="required">*</span>
            </label>
            <select
              id="exercise-type"
              className={`form-select ${errors.type ? 'error' : ''}`}
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                if (errors.type) setErrors({ ...errors, type: '' });
              }}
            >
              <option value="">Select a type</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.type && <span className="error-message">{errors.type}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExerciseModal;

