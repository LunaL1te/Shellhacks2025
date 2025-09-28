export interface ChronicCondition {
  id: string;
  name: string;
  diagnosedDate: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[]; // e.g., ["08:00", "20:00"]
  startDate: string;
  endDate?: string;
  sideEffects?: string[];
  forCondition?: string;
  notes?: string;
}

export interface Consultation {
  id: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface MedicalProfile {
  chronicConditions: ChronicCondition[];
  medications: Medication[];
  allergies: string[];
  consultations: Consultation[];
  userInfo?: Patient;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageUri?: string; // For camera photos
}

export interface Patient {
  Name: string;
  Email: string;
  Phone: string;
  Weight: number;
  Height: number;
  Gender: string;
  Age: number;
}
