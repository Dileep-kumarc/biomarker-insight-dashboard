export interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  id: string;
  lastUpdated: string;
  reportDate: string;
}

export interface BiomarkerData {
  value: number;
  unit: string;
  status: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  date: string;
  referenceRange: {
    min: number;
    max: number;
  };
}

export interface BiomarkerEntry {
  name: string;
  description: string;
  category: string;
  currentValue: BiomarkerData;
  history: BiomarkerData[];
}

export interface ExtractedPDFData {
  patientInfo: PatientInfo;
  biomarkers: {
    [key: string]: BiomarkerData;
  };
  text: string;
  numPages: number;
}

export type BiomarkerDataMap = {
  [key: string]: BiomarkerEntry;
};
