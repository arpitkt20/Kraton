export interface BodyMeasurement {
    id: string;
    date: Date;
    neck?: number;
    shoulders?: number;
    leftBiceps?: number;
    rightBiceps?: number;
    chest?: number;
    leftForearms?: number;
    rightForearms?: number;
    upperAbs?: number;
    lowerAbs?: number;
    waist?: number;
    hips?: number;
    leftThighs?: number;
    rightThighs?: number;
    leftCalf?: number;
    rightCalf?: number;
    weight?: number;
    bodyFatPercent?: number;
    bodyFatKg?: number;
  }
  
  export type BodyPart = 
    | 'Neck'
    | 'Shoulders'
    | 'Left Biceps'
    | 'Right Biceps'
    | 'Chest'
    | 'Left Forearms'
    | 'Right Forearms'
    | 'Upper Abs'
    | 'Lower Abs'
    | 'Waist'
    | 'Hips'
    | 'Left Thighs'
    | 'Right Thighs'
    | 'Left Calf'
    | 'Right Calf'
    | 'Weight'
    | 'Body Fat (%)'
    | 'Body Fat (Kg)';
  
  export type TimeInterval = '1mo' | '3mo' | '6mo' | '1yr' | 'All';
  
  