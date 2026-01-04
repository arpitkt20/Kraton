import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BodyPart, TimeInterval } from '../../types/bodyTracker';
import { getAllBodyParts, getMeasurementsByBodyPart, filterByTimeInterval, getFieldNameForBodyPart } from '../../utils/bodyTrackerUtils';
import './ChartsTab.css';

const ChartsTab: React.FC = () => {
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart>('Weight');
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>('All');
  const [measurements, setMeasurements] = useState<any[]>([]);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const loadMeasurements = async () => {
      const data = await getMeasurementsByBodyPart(selectedBodyPart);
      setMeasurements(data);
    };
    loadMeasurements();
  }, [selectedBodyPart]);

  const chartData = useMemo(() => {
    let filtered = filterByTimeInterval(measurements, selectedInterval);
    
    const fieldName = getFieldNameForBodyPart(selectedBodyPart);
    
    return filtered
      .map(m => ({
        date: m.date,
        value: m[fieldName] as number
      }))
      .filter(d => d.value !== undefined)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [measurements, selectedBodyPart, selectedInterval]);

  const bodyParts = getAllBodyParts();

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="chart-empty">
          <p>No data available for {selectedBodyPart}</p>
          <p className="chart-empty-subtitle">Add measurements to see the chart</p>
        </div>
      );
    }

    // Responsive chart dimensions
    const isMobile = window.innerWidth <= 480;
    const width = isMobile ? 600 : 800;
    const height = isMobile ? 300 : 400;
    const padding = isMobile ? 40 : 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const values = chartData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    const dates = chartData.map(d => d.date);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const dateRange = maxDate.getTime() - minDate.getTime() || 1;

    const points = chartData.map((d) => {
      const x = padding + (d.date.getTime() - minDate.getTime()) / dateRange * chartWidth;
      const y = padding + chartHeight - ((d.value - minValue) / valueRange * chartHeight);
      return { x, y, value: d.value, date: d.date };
    });

    const pathData = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    return (
      <svg 
        width={width} 
        height={height} 
        className="chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((_, i) => {
          const y = padding + (chartHeight / 4) * i;
          return (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          );
        })}

        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map((_, i) => {
          const value = minValue + (valueRange / 4) * (4 - i);
          const y = padding + (chartHeight / 4) * i;
          return (
            <text
              key={`y-label-${i}`}
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="12"
              fill="#666"
            >
              {value.toFixed(1)}
            </text>
          );
        })}

        {/* Chart line */}
        <path
          d={pathData}
          fill="none"
          stroke="#4a9eff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={`point-${i}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#4a9eff"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <title>
              {point.date.toLocaleDateString()}: {point.value.toFixed(1)}
            </title>
          </g>
        ))}

        {/* X-axis */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#333"
          strokeWidth="2"
        />

        {/* X-axis date labels */}
        {points.map((point, i) => {
          // Show labels for evenly spaced points or all points if there are few
          const showLabel = chartData.length <= 7 || 
            i === 0 || 
            i === points.length - 1 || 
            (points.length > 7 && i % Math.ceil(points.length / 5) === 0);
          
          if (!showLabel) return null;
          
          return (
            <text
              key={`x-label-${i}`}
              x={point.x}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#666"
            >
              {point.date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </text>
          );
        })}

        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#333"
          strokeWidth="2"
        />
      </svg>
    );
  };

  const intervals: Array<{ value: TimeInterval; label: string }> = [
    { value: 'All', label: 'All' },
    { value: '1yr', label: '1y' },
    { value: '6mo', label: '6mo' },
    { value: '3mo', label: '3mo' },
    { value: '1mo', label: '1mo' }
  ];

  return (
    <div className="charts-tab">
      <div className="charts-header">
        <div className="body-part-wrapper">
          <button 
            type="button"
            className="body-part-button"
            onClick={() => {
              selectRef.current?.focus();
              selectRef.current?.click();
            }}
          >
            <svg className="dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 2L6 5L9 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="body-part-text">{selectedBodyPart}</span>
          </button>
          <select
            ref={selectRef}
            id="body-part-select"
            className="body-part-select"
            value={selectedBodyPart}
            onChange={(e) => setSelectedBodyPart(e.target.value as BodyPart)}
          >
            {bodyParts.map(part => (
              <option key={part} value={part}>{part}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="interval-tabs">
        {intervals.map(interval => (
          <button
            key={interval.value}
            className={`interval-tab ${selectedInterval === interval.value ? 'active' : ''}`}
            onClick={() => setSelectedInterval(interval.value)}
          >
            {interval.label}
          </button>
        ))}
      </div>

      <div className="chart-container">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartsTab;

