export interface Diagnosis {
  summary: string;
  severity: "low" | "medium" | "high" | "critical";
  cause: string;
  steps: string[];
}

export interface AlarmInput {
  alarmName: string;
  state: string;
  reason: string;
}
