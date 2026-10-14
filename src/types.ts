export type CohortId = 'aspiring' | 'novice' | 'amateur' | 'mid' | 'coach';

export type TabType = 'participants' | 'interview' | 'review' | 'dashboard';

export type InterviewMode = 'quick' | 'full';

export interface CohortInfo {
  id: CohortId;
  name: string;
  shortLabel: string;
  description: string;
  tags: string[];
  questions: string[];
}

export interface DemoStep {
  tab: TabType;
  title: string;
  prompt: string;
}

export interface SavedSession {
  id: string;
  cohortId: CohortId;
  cohortName: string;
  mode: InterviewMode;
  modeName: string;
  questionsAnswered: number;
  totalQuestions: number;
  recordedSeconds: number;
  notes: string;
  timestamp: number;
}
