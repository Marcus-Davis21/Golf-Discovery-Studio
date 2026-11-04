export type CohortId = 'aspiring' | 'novice' | 'amateur' | 'mid' | 'coach';

export type PostInterviewSubTab = 'transcribe' | 'dashboard' | 'storage' | 'ord';

export type TabType =
  | 'participants'
  | 'interview'
  | 'review'
  | 'post_interview'
  | 'transcribe'
  | 'dashboard'
  | 'storage'
  | 'ord';

export type InterviewMode = 'quick' | 'full';

export type RecordingMediaType = 'video_voice' | 'voice_only' | 'simulated';

export type QuestionApprovalStatus = 'approved' | 'under_review' | 'flagged';

export interface QuestionApprovalRecord {
  cohortId: CohortId;
  questionIndex: number;
  questionText: string;
  status: QuestionApprovalStatus;
  reviewedBy: string;
  reviewDate: string;
  scientificRationale?: string;
}

export interface CohortInfo {
  id: CohortId;
  name: string;
  shortLabel: string;
  description: string;
  tags: string[];
  questions: string[];
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

// Computer Scientist Pipeline Structured Output Interfaces
export interface TranscriptEntry {
  timestamp: string; // e.g. "00:15"
  speaker: 'Interviewer' | 'Participant';
  text: string;
  questionAnchor?: string;
}

export interface QuotableSoundbite {
  quote: string;
  speaker: string;
  context: string;
  significance: string;
}

export interface IdentifiedBarrier {
  barrier: string;
  category: 'cost' | 'time' | 'intimidation' | 'technique' | 'access' | 'other';
  severity: 'high' | 'medium' | 'low';
  participantVerbatim: string;
}

export interface ToolOrImprovisedDrill {
  toolOrDrill: string;
  source: 'purchased' | 'improvised_diy' | 'coach_given' | 'online_video';
  outcome: string;
  abandonedReason?: string;
}

export interface SentimentAnalysis {
  overall: 'Enthusiastic' | 'Frustrated' | 'Hesitant' | 'Analytical' | 'Mixed';
  breakdown: {
    enthusiasticScore: number; // 0-100
    frustratedScore: number; // 0-100
    hesitantScore: number; // 0-100
  };
  keyEmotionalMoments: string[];
}

export interface AIQualitativeAnalysis {
  verbatimTranscript: TranscriptEntry[];
  quotableSoundbites: QuotableSoundbite[];
  identifiedBarriers: IdentifiedBarrier[];
  currentToolsAndDrills: ToolOrImprovisedDrill[];
  sentimentAnalysis: SentimentAnalysis;
  analyzedAt: number;
  modelUsed: string; // e.g. "gemini-3.8-flash"
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
  aiAnalysis?: AIQualitativeAnalysis;
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

export interface PMReviewSignOff {
  itemKey: string;
  sectionName: string;
  requirement: string;
  verified: boolean;
  reviewedBy: string;
  reviewedDate: string;
  notes?: string;
}
