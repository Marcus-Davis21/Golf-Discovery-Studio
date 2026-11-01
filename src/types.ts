export type CohortId = 'aspiring' | 'novice' | 'amateur' | 'mid' | 'coach';

export type TabType = 'participants' | 'interview' | 'review' | 'dashboard' | 'storage';

export type InterviewMode = 'quick' | 'full';

export type RecordingMediaType = 'video_voice' | 'voice_only' | 'simulated';

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

export interface QuestionResponse {
  questionIndex: number;
  questionText: string;
  answer: string;
  quote?: string;
  tags?: string[];
  timestamp?: number;
}

export interface Participant {
  id: string; // e.g. "ASP-01", "NOV-01", "AM-01", etc.
  name: string;
  cohortId: CohortId;
  email: string;
  experienceLevel: string;
  handicapOrRounds?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  scheduledDate?: string;
  sessionId?: string;
  briefBio?: string;
}

export interface SavedSession {
  id: string;
  participantId?: string;
  participantName?: string;
  participantEmail?: string;
  cohortId: CohortId;
  cohortName: string;
  mode: InterviewMode;
  modeName: string;
  questionsAnswered: number;
  totalQuestions: number;
  recordedSeconds: number;
  mediaType: RecordingMediaType;
  mediaBlobUrl?: string;
  mediaSizeKb?: number;
  notes: string;
  responses: Record<number, QuestionResponse>;
  keyThemes?: string[];
  timestamp: number;
  syncedToStorageEmail?: string;
}

export interface StorageConfig {
  storageEmail: string;
  secondaryEmail?: string;
  autoEmailDigest: boolean;
  cloudSyncEnabled: boolean;
  studyTitle: string;
  targetCountPerCohort: number; // default 25 per cohort
  totalTargetCount: number; // 25 * 5 = 125, unlimited supported
  lastExportAt?: number;
}

export interface StudyMetrics {
  totalTarget: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  cohortDistribution: Record<CohortId, { target: number; completed: number }>;
  totalMinutesRecorded: number;
  totalQuotesLogged: number;
}
