import React, { useState } from 'react';
import { CohortId, Participant } from '../types';
import { COHORTS_DATA } from '../data/researchData';
import {
  Users,
  CheckCircle2,
  Play,
  Plus,
  Edit2,
  Video,
  Mic,
  Search,
  Zap,
  BookOpen,
  Filter,
  Shield,
  Layers,
} from 'lucide-react';

interface ParticipantsViewProps {
  selectedCohortId: CohortId;
  onCohortChange: (id: CohortId) => void;
  onStartInterview: (isFull: boolean, participant?: Participant) => void;
  participants: Participant[];
  onUpdateParticipant?: (participant: Participant) => void;
  onAddParticipant?: (participant: Participant) => void;
}

export const ParticipantsView: React.FC<ParticipantsViewProps> = ({
  selectedCohortId,
  onCohortChange,
  onStartInterview,
  participants,
  onUpdateParticipant,
  onAddParticipant,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New participant form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [newBio, setNewBio] = useState('');

  // Selected participant for modal
  const [activeParticipantForModal, setActiveParticipantForModal] = useState<Participant | null>(null);

  const currentCohort = COHORTS_DATA[selectedCohortId];

  // Filter participants for active cohort
  const cohortParticipants = participants.filter((p) => p.cohortId === selectedCohortId);
  const cohortCompleted = cohortParticipants.filter((p) => p.status === 'completed').length;
  const cohortTarget = 25;
  const cohortProgress = Math.min(100, Math.round((cohortCompleted / cohortTarget) * 100));

  // Cross-cohort total stats
  const totalCompleted = participants.filter((p) => p.status === 'completed').length;
  const totalParticipants = participants.length;

  // Filter within active cohort
  const filteredParticipants = cohortParticipants.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBio = p.briefBio?.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      if (!matchName && !matchBio && !matchId) return false;
    }
    return true;
  });

  const handleOpenStartModal = (p: Participant) => {
    setActiveParticipantForModal(p);
  };

  const handleConfirmStart = (isFull: boolean) => {
    if (activeParticipantForModal) {
      onStartInterview(isFull, activeParticipantForModal);
      setActiveParticipantForModal(null);
    } else {
      onStartInterview(isFull);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingParticipant && onUpdateParticipant) {
      onUpdateParticipant(editingParticipant);
      setEditingParticipant(null);
    }
  };

  const handleAddNewParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const prefix =
      selectedCohortId === 'aspiring'
        ? 'ASP'
        : selectedCohortId === 'novice'
        ? 'NOV'
        : selectedCohortId === 'amateur'
        ? 'AM'
        : selectedCohortId === 'mid'
        ? 'MID'
        : 'PRO';
    const nextNum = cohortParticipants.length + 1;
    const newId = `${prefix}-${String(nextNum).padStart(2, '0')}`;
    const newP: Participant = {
      id: newId,
      name: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@study.io`,
      cohortId: selectedCohortId,
      experienceLevel: newExperience.trim() || currentCohort.name,
      status: 'not_started',
      briefBio: newBio.trim(),
    };
    if (onAddParticipant) {
      onAddParticipant(newP);
    }
    setIsAddingNew(false);
    setNewName('');
    setNewEmail('');
    setNewBio('');
    setNewExperience('');
  };

  return (
    <div className="space-y-4">
      {/* 5-Cohort Selector Navigation Bar */}
      <div className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-800" />
            <span>Select Cohort (Target: 25 Interviews Per Cohort)</span>
          </label>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Total Completed: {totalCompleted} (Unlimited Allowed)
          </span>
        </div>

        {/* 5 Cohort Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
          {(['aspiring', 'novice', 'amateur', 'mid', 'coach'] as CohortId[]).map((cid) => {
            const cInfo = COHORTS_DATA[cid];
            const cList = participants.filter((p) => p.cohortId === cid);
            const cDone = cList.filter((p) => p.status === 'completed').length;
            const isSelected = selectedCohortId === cid;

            return (
              <button
                key={cid}
                type="button"
                onClick={() => onCohortChange(cid)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-800 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className={`text-[10px] uppercase font-bold truncate ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {cid}
                </div>
                <div className="text-xs font-bold truncate mt-0.5">{cInfo.shortLabel.split(' ')[0]}</div>
                <div className="flex items-center justify-between text-[11px] font-extrabold mt-1">
                  <span className={isSelected ? 'text-white' : 'text-emerald-800'}>
                    {cDone} / 25
                  </span>
                  <span className={`text-[9px] font-medium ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {Math.round((cDone / 25) * 100)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Cohort Detail & Progress Banner */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {currentCohort.name}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                25 Quota Target
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {currentCohort.description}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-sm font-black text-emerald-800">
              {cohortCompleted} / 25
            </div>
            <div className="text-[10px] text-slate-500">
              {cohortParticipants.length} in cohort roster
            </div>
          </div>
        </div>

        {/* Progress Bar for This Cohort */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 mt-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
            <span>{currentCohort.shortLabel.split(' ')[0]} Cohort Progress</span>
            <span className="text-emerald-800 font-bold">{cohortProgress}% (Target 25)</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-800 rounded-full transition-all duration-500"
              style={{ width: `${cohortProgress}%` }}
            />
          </div>
        </div>

        {/* Direct Start Ad-Hoc Interview */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onStartInterview(false)}
            className="flex-1 py-2 px-3 rounded-xl border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 text-emerald-800" />
            <span>Ad-Hoc Video/Voice (Quick)</span>
          </button>

          <button
            type="button"
            onClick={() => onStartInterview(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Full Interview ({currentCohort.questions.length} Qs)</span>
          </button>
        </div>
      </div>

      {/* Cohort Participant Roster (25+ Slots) */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${currentCohort.name} participants...`}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          {/* Add unlimited interviewee */}
          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-2.5 py-1.5 rounded-xl border border-emerald-700/60 bg-emerald-50 text-emerald-800 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3 h-3" />
            <span>Add Interviewee</span>
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1 text-[11px] mb-3">
          <span className="text-slate-400 font-semibold mr-1">Roster:</span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2 py-0.5 rounded-full font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({cohortParticipants.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('not_started')}
            className={`px-2 py-0.5 rounded-full font-semibold transition-colors ${
              statusFilter === 'not_started'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending ({cohortParticipants.filter((p) => p.status === 'not_started').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-2 py-0.5 rounded-full font-semibold transition-colors ${
              statusFilter === 'completed'
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed ({cohortCompleted})
          </button>
        </div>

        {/* Add New Participant Form */}
        {isAddingNew && (
          <form
            onSubmit={handleAddNewParticipant}
            className="mb-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2.5 text-xs animate-fadeIn"
          >
            <div className="font-bold text-emerald-950 flex items-center justify-between">
              <span>Add Unlimited Interviewee to {currentCohort.name}</span>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-slate-600 text-[10px]"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Participant Name *"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="p-2 border border-slate-300 rounded-lg bg-white"
              />
              <input
                type="text"
                placeholder="Experience / Handicap"
                value={newExperience}
                onChange={(e) => setNewExperience(e.target.value)}
                className="p-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="email"
                placeholder="Email Address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="p-2 border border-slate-300 rounded-lg bg-white"
              />
              <input
                type="text"
                disabled
                value={`Cohort: ${currentCohort.name}`}
                className="p-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 text-[11px]"
              />
            </div>
            <textarea
              placeholder="Background context or research focus..."
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white resize-y"
              rows={2}
            />
            <button
              type="submit"
              className="w-full py-2 bg-emerald-800 text-white font-bold rounded-lg text-xs hover:bg-emerald-900 cursor-pointer"
            >
              Add to {currentCohort.shortLabel.split(' ')[0]} Roster
            </button>
          </form>
        )}

        {/* Participant Cards Grid (Optimized for Laptop and Mobile) */}
        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No participants match the selected filter in this cohort.
            </div>
          ) : (
            filteredParticipants.map((p) => {
              const isDone = p.status === 'completed';

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border transition-all text-xs ${
                    isDone
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">{p.name}</h4>
                        {isDone && (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Interview Completed</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>{p.experienceLevel}</span>
                        {p.handicapOrRounds && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-slate-700">{p.handicapOrRounds}</span>
                          </>
                        )}
                      </div>

                      {p.briefBio && (
                        <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                          {p.briefBio}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenStartModal(p)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          isDone
                            ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                            : 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-xs'
                        }`}
                      >
                        <Video className="w-3 h-3" />
                        <span>{isDone ? 'Re-Interview' : 'Interview'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingParticipant(p)}
                        className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-0.5"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Start Interview Choice Modal */}
      {activeParticipantForModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                {activeParticipantForModal.id}
              </span>
              <button
                type="button"
                onClick={() => setActiveParticipantForModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {activeParticipantForModal.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentCohort.name}
            </p>

            <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
              <div>{activeParticipantForModal.experienceLevel}</div>
              {activeParticipantForModal.briefBio && (
                <div className="mt-1 text-[11px] text-slate-500 italic">
                  "{activeParticipantForModal.briefBio}"
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => handleConfirmStart(false)}
                className="w-full py-2.5 px-3 rounded-xl border border-emerald-700 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 font-bold text-xs flex items-center justify-between cursor-pointer"
              >
                <span>Quick Video/Voice (8 questions)</span>
                <Zap className="w-3.5 h-3.5 text-emerald-700" />
              </button>

              <button
                type="button"
                onClick={() => handleConfirmStart(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-between cursor-pointer shadow-xs"
              >
                <span>Full Deep Dive ({currentCohort.questions.length} questions)</span>
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Participant Modal */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-fadeIn space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Edit {editingParticipant.id} ({COHORTS_DATA[editingParticipant.cohortId]?.name})
              </h3>
              <button
                type="button"
                onClick={() => setEditingParticipant(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Name</label>
              <input
                type="text"
                value={editingParticipant.name}
                onChange={(e) =>
                  setEditingParticipant({ ...editingParticipant, name: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                value={editingParticipant.email}
                onChange={(e) =>
                  setEditingParticipant({ ...editingParticipant, email: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Experience / Level</label>
              <input
                type="text"
                value={editingParticipant.experienceLevel}
                onChange={(e) =>
                  setEditingParticipant({ ...editingParticipant, experienceLevel: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bio / Notes</label>
              <textarea
                value={editingParticipant.briefBio || ''}
                onChange={(e) =>
                  setEditingParticipant({ ...editingParticipant, briefBio: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg resize-y"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingParticipant(null)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
