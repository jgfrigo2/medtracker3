export interface TimePointData {
  value: number | null;
  medication: string[];
  comments: string;
}

export interface DailyRecord {
  [time: string]: TimePointData;
}

export interface AppState {
  medications: string[];
  standardPattern: { [time: string]: string[] };
  records: { [date: string]: DailyRecord };
}

export interface JsonBinCredential {
  id: string;
  name: string;
  apiKey: string;
  binId: string;
}
