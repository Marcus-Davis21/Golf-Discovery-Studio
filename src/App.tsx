import React, { useState, useEffect, useRef } from 'react';
import { CohortId, TabType, SavedSession } from './types';
import { COHORTS_DATA, FOLLOW_UP_PROBES, DEMO_STEPS } from './data/researchData';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { GuidedDemoCard } from './components/GuidedDemoCard';
import { ParticipantsView } from './components/ParticipantsView';
import { InterviewView } from './components/InterviewView';
import { ReviewView } from './components/ReviewView';
import { DashboardView } from './components/DashboardView';

export default function App() {
  // Navigation & Cohort State
  const [activeTab, setActiveTab] = useState<TabType>('participants');
  const [selectedCohortId, setSelectedCohortId] = useState<CohortId>('aspiring');
  const [isFullInterview, setIsFullInterview] = useState<boolean>(true);
  const [isFramed, setIsFramed] = useState<boolean>(true);

  // Active Interview State
  const [questions, setQuestions] = useState<string[]>(COHORTS_DATA['aspiring'].questions);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentProbe, setCurrentProbe] = useState<string>(FOLLOW_UP_PROBES[0]);
  const [interviewNotes, setInterviewNotes] = useState<string>('');

  // Recording Simulation State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordedSeconds, setRecordedSeconds] = useState<number>(0);
  const [recordingStatusMessage, setRecordingStatusMessage] = useState<string>(
    'Ready to record. Tap Start recording when the participant begins.'
  );

  // Sessions History & Persistence
  const [sessionCount, setSessionCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('gdsSessions') || 0);
    } catch {
      return 0;
    }
  });

  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
    try {
      const saved = localStorage.getItem('gdsSavedSessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Guided Demo Walkthrough State
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [demoSeconds, setDemoSeconds] = useState<number>(300);
  const [isDemoFinished, setIsDemoFinished] = useState<boolean>(false);

  // Recording Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  // Demo Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isDemoActive && !isDemoFinished) {
      interval = setInterval(() => {
        setDemoSeconds((prev) => {
          if (prev <= 1) {
            setIsDemoFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDemoActive, isDemoFinished]);

  // Cohort Change
  const handleCohortChange = (id: CohortId) => {
    setSelectedCohortId(id);
    const cohortData = COHORTS_DATA[id];
    setQuestions(cohortData.questions);
    setCurrentIndex(0);
    setCurrentProbe(FOLLOW_UP_PROBES[0]);
  };

  // Start Interview
  const handleStartInterview = (isFull: boolean) => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordedSeconds(0);
    setRecordingStatusMessage('Ready to record. Tap Start recording when the participant begins.');

    setIsFullInterview(isFull);
    const cohortData = COHORTS_DATA[selectedCohortId];
    const qs = isFull ? cohortData.questions : cohortData.questions.slice(0, Math.min(8, cohortData.questions.length));
    setQuestions(qs);
    setCurrentIndex(0);
    setCurrentProbe(FOLLOW_UP_PROBES[0]);
    setActiveTab('interview');
  };

  // Next Question
  const handleNextQuestion = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsPaused(false);
      setRecordingStatusMessage('Question advanced. Recording paused automatically.');
    }

    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCurrentProbe(FOLLOW_UP_PROBES[nextIdx % FOLLOW_UP_PROBES.length]);
    } else {
      setActiveTab('review');
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setCurrentProbe(FOLLOW_UP_PROBES[prevIdx % FOLLOW_UP_PROBES.length]);
    }
  };

  // Recording Toggles
  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setIsPaused(false);
      setRecordingStatusMessage('Recording simulation started. Speak naturally, then use Pause if needed.');
    } else {
      setIsRecording(false);
      setIsPaused(false);
      setRecordingStatusMessage('Recording simulation stopped. You can continue the interview or review notes.');
    }
  };

  const handleTogglePause = () => {
    if (!isRecording) return;
    setIsPaused((prev) => {
      const next = !prev;
      setRecordingStatusMessage(next ? 'Recording paused. Tap Resume to continue.' : 'Recording resumed.');
      return next;
    });
  };

  // Submit Session
  const handleSubmitSession = () => {
    const newCount = sessionCount + 1;
    setSessionCount(newCount);
    try {
      localStorage.setItem('gdsSessions', String(newCount));
    } catch (e) {
      console.warn('Storage error', e);
    }

    const newSession: SavedSession = {
      id: 'session-' + Date.now(),
      cohortId: selectedCohortId,
      cohortName: COHORTS_DATA[selectedCohortId].name,
      mode: isFullInterview ? 'full' : 'quick',
      modeName: isFullInterview ? 'Full Interview' : 'Quick Interview',
      questionsAnswered: currentIndex + 1,
      totalQuestions: questions.length,
      recordedSeconds,
      notes: interviewNotes,
      timestamp: Date.now(),
    };

    const updatedSessions = [newSession, ...savedSessions];
    setSavedSessions(updatedSessions);
    try {
      localStorage.setItem('gdsSavedSessions', JSON.stringify(updatedSessions));
    } catch (e) {
      console.warn('Storage error', e);
    }

    setIsRecording(false);
    setIsPaused(false);
    setRecordingStatusMessage("Session saved to this browser's prototype state. No audio/video is stored.");
    setActiveTab('dashboard');
  };

  const handleClearSessions = () => {
    if (window.confirm('Reset all saved discovery session records for this prototype?')) {
      setSessionCount(0);
      setSavedSessions([]);
      try {
        localStorage.removeItem('gdsSessions');
        localStorage.removeItem('gdsSavedSessions');
      } catch (e) {
        console.warn('Storage error', e);
      }
    }
  };

  // Guided Demo Walkthrough Actions
  const handleStartDemo = () => {
    setIsDemoActive(true);
    setDemoStep(0);
    setDemoSeconds(300);
    setIsDemoFinished(false);
    setActiveTab(DEMO_STEPS[0].tab);
  };

  const handleNextDemoStep = () => {
    if (demoStep < DEMO_STEPS.length - 1) {
      const nextStep = demoStep + 1;
      setDemoStep(nextStep);
      setActiveTab(DEMO_STEPS[nextStep].tab);
    } else {
      setIsDemoFinished(true);
    }
  };

  const handlePrevDemoStep = () => {
    if (demoStep > 0) {
      const prevStep = demoStep - 1;
      setDemoStep(prevStep);
      setActiveTab(DEMO_STEPS[prevStep].tab);
    }
  };

  const handleStopDemo = () => {
    setIsDemoActive(false);
    setDemoStep(0);
    setIsDemoFinished(false);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex justify-center selection:bg-emerald-100 selection:text-emerald-900 font-sans antialiased">
      {/* Mobile App View Frame */}
      <div
        className={`w-full bg-white min-h-screen shadow-xl border-x border-slate-200/80 flex flex-col transition-all duration-300 ${
          isFramed ? 'max-w-[430px]' : 'max-w-3xl'
        }`}
      >
        {/* Header */}
        <Header isFramed={isFramed} onToggleFrame={() => setIsFramed(!isFramed)} />

        {/* Sticky Tabs Navigation */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isRecording={isRecording}
          sessionCount={sessionCount}
        />

        {/* Main Content Area */}
        <main className="p-4 pb-24 flex-1">
          {/* Guided Demo Walkthrough Box */}
          <GuidedDemoCard
            isDemoActive={isDemoActive}
            demoStep={demoStep}
            demoSeconds={demoSeconds}
            isDemoFinished={isDemoFinished}
            onStartDemo={handleStartDemo}
            onNextStep={handleNextDemoStep}
            onPrevStep={handlePrevDemoStep}
            onStopDemo={handleStopDemo}
          />

          {/* Tab Views */}
          {activeTab === 'participants' && (
            <ParticipantsView
              selectedCohortId={selectedCohortId}
              onCohortChange={handleCohortChange}
              onStartInterview={handleStartInterview}
            />
          )}

          {activeTab === 'interview' && (
            <InterviewView
              cohortName={COHORTS_DATA[selectedCohortId].name}
              modeName={isFullInterview ? 'Full Interview' : 'Quick Interview'}
              questions={questions}
              currentIndex={currentIndex}
              currentProbe={currentProbe}
              onSelectProbe={setCurrentProbe}
              onNextQuestion={handleNextQuestion}
              onPrevQuestion={handlePrevQuestion}
              onGoToReview={() => setActiveTab('review')}
              isRecording={isRecording}
              isPaused={isPaused}
              recordedSeconds={recordedSeconds}
              recordingStatusMessage={recordingStatusMessage}
              onToggleRecord={handleToggleRecord}
              onTogglePause={handleTogglePause}
              notes={interviewNotes}
              onNotesChange={setInterviewNotes}
            />
          )}

          {activeTab === 'review' && (
            <ReviewView
              cohortName={COHORTS_DATA[selectedCohortId].name}
              modeName={isFullInterview ? 'Full Interview' : 'Quick Interview'}
              questionsCovered={currentIndex + 1}
              totalQuestions={questions.length}
              recordedSeconds={recordedSeconds}
              isRecording={isRecording}
              isPaused={isPaused}
              notes={interviewNotes}
              onSaveSession={handleSubmitSession}
              onReturnToInterview={() => setActiveTab('interview')}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              sessionCount={sessionCount}
              activeCohortName={COHORTS_DATA[selectedCohortId].name}
              savedSessions={savedSessions}
              onClearSessions={handleClearSessions}
            />
          )}
        </main>

        {/* Fixed Footer */}
        <footer className="sticky bottom-0 z-20 w-full px-4 py-2.5 bg-white/95 backdrop-blur-sm border-t border-slate-200 text-[11px] text-center text-slate-500 font-medium">
          Mobile stakeholder-testing prototype · Iteration 2
        </footer>
      </div>
    </div>
  );
}
