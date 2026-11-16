export type CohortId = 'aspiring' | 'novice' | 'amateur' | 'mid' | 'coach';

export type PostInterviewSubTab =
  | 'transcribe'
  | 'dashboard'
  | 'storage'
  | 'ord'
  | 'mid_market_validation'
  | 'memorandum'
  | 'executive_review';

export type TabType =
  | 'participants'
  | 'interview'
  | 'review'
  | 'post_interview'
  | 'flight_hub'
  | 'transcribe'
  | 'dashboard'
  | 'storage'
  | 'ord'
  | 'mid_market_validation'
  | 'memorandum'
  | 'executive_review';

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

// Hub 2: Golf Resistance Ball Discovery Studio Types (Google Stitch + Engineering MVP)
export type ClubKey = 'driver' | 'wood3' | 'iron7' | 'wedge';

export type DimpleProfileId =
  | 'tour_332'
  | 'low_drag_392'
  | 'high_lift_318'
  | 'resistance_flow_280';

export type StrikeQuality = 'centered' | 'slightly_off' | 'toe_heel';
export type FairwayFirmness = 'soft' | 'normal' | 'firm';

export interface FlightTrajectoryPoint {
  x: number; // downrange yards
  y: number; // altitude yards above tee
  z: number; // lateral yards (- left/draw, + right/fade)
  t: number; // elapsed seconds
}

export interface AerodynamicMetrics {
  dragCoeffCd: number;
  liftCoeffCl: number;
  reynoldsNumber: number;
  spinFactorSp: number;
  magnusLiftNewtons: number;
  dragForceNewtons: number;
  landingAngleDeg: number;
  resistanceDeltaMph: number;
  dimpleEfficiencyGainPct: number;
  airDensityKgM3: number;
  effectiveWindHeadMph: number;
  effectiveWindCrossMph: number;
}

export interface FlightShotTelemetry {
  id: string;
  timestamp: number;
  clubKey: ClubKey;
  clubName: string;
  clubSpeed: number;
  ballSpeed: number;
  smash: number;
  launchAngle: number;
  spinRate: number;
  sideSpinAngle: number;
  attackAngle: number;
  swingResistanceLbs: number;
  dimpleProfile: DimpleProfileId;
  strikeQuality?: StrikeQuality;
  fairwayFirmness?: FairwayFirmness;
  windSpeedMph?: number;
  windDirectionDeg?: number;
  altitudeFt?: number;
  slopeFt?: number;
  carry: number;
  total: number;
  apex: number;
  apexTime: number;
  lateralYds: number;
  flightShape: string;
  source: 'manual' | 'video_ai';
  sourceLabel?: string;
  aerodynamics: AerodynamicMetrics;
  points: FlightTrajectoryPoint[];
  color: string;
}

export interface VideoFlightExtraction {
  detectedClub: ClubKey;
  clubSpeedMph: number;
  launchAngleDeg: number;
  spinRateRpm: number;
  sideSpinAngleDeg: number;
  attackAngleDeg: number;
  recommendedDimpleProfile: DimpleProfileId;
  estimatedDimpleCount: number;
  swingResistanceEffectSummary: string;
  trajectoryObservation: string;
  dimpleAerodynamicsObservation: string;
  coachingFeedback: string[];
  confidenceScore: number;
  modelUsed: string;
  analyzedAt: number;
}
