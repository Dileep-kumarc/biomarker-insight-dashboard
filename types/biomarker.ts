export interface BiomarkerValue {
  value: number
  unit: string
  status: string
  trend: string
  date: string
  referenceRange: {
    min: number
    max: number
    optimal?: number
  }
}

export interface BiomarkerData {
  name: string
  category: string
  currentValue: BiomarkerValue
  history: BiomarkerValue[]
  description?: string
  clinicalSignificance?: string
  recommendations?: string[]
}

export interface PatientInfo {
  name: string
  age: number
  gender: string
  id: string
  lastUpdated: string
}
