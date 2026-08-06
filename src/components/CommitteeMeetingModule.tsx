import React, { useState } from 'react';
import { MeetingItem, Submission, Language, CalendarType, User } from '../types';
import { translations } from '../utils/i18n';
import { formatDateWithCalendar } from '../utils/calendar';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  FileText,
  Plus,
  Vote,
  FileCheck,
  Send,
  Building,
} from 'lucide-react';

interface CommitteeMeetingModuleProps {
  meetings: MeetingItem[];
  submissions: Submission[];
  language: Language;
  calendar: CalendarType;
  currentUser: User;
  onScheduleMeeting: (meeting: Partial<MeetingItem>) => void;
  onSelectSubmission: (sub: Submission) => void;
}

export const CommitteeMeetingModule: React.FC<CommitteeMeetingModuleProps> = ({
  meetings,
  submissions,
  language,
  calendar,
  currentUser,
  onScheduleMeeting,
  onSelectSubmission,
}) => {
  const t = translations[language];

  const [activeMeeting, setActiveMeeting] = useState<MeetingItem | null>(meetings[0] || null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // New Meeting Form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-08-25');
  const [time, setTime] = useState('09:00 AM - 01:00 PM');
  const [location, setLocation] = useState('OHB Main Conference Hall / Zoom Hybrid');
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);

  // Active Vote State
  const [votedMap, setVotedMap] = useState<Record<string, 'APPROVE' | 'REVISE' | 'REJECT' | 'ABSTAIN'>>({});

  const handleCreateMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScheduleMeeting({
      title: title || 'OHB IRB Panel Regular Review Session',
      date,
      time,
      location,
      protocolIds: selectedProtocols,
    });
    setShowScheduleModal(false);
  };

  const handleVote = (submissionId: string, vote: 'APPROVE' | 'REVISE' | 'REJECT' | 'ABSTAIN') => {
    setVotedMap({ ...votedMap, [submissionId]: vote });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#005BAC] text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4" />
            <span>OHB IRB Committee Sessions</span>
          </div>
          <h1 className="text-2xl font-extrabold mt-1">Committee Meetings & Voting Management</h1>
          <p className="text-blue-100 text-xs mt-1">
            Digital meeting agendas, electronic voting, minutes logging, and protocol decision clearance.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Committee Panel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Meetings List */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Committee Meetings Archive ({meetings.length})
          </h2>

          <div className="space-y-3">
            {meetings.map((mtg) => {
              const isSelected = activeMeeting?.id === mtg.id;
              return (
                <div
                  key={mtg.id}
                  onClick={() => setActiveMeeting(mtg)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected ? 'border-[#005BAC] bg-blue-50/70 shadow-xs' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                      {mtg.status}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatDateWithCalendar(mtg.date, calendar, language)}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 mt-2">{mtg.title}</h3>
                  <div className="text-[11px] text-gray-500 mt-2 space-y-0.5">
                    <p className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{mtg.time}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="truncate">{mtg.location}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Active Session Detail & Voting */}
        <div className="lg:col-span-2 space-y-6">
          {activeMeeting ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-6">
              {/* Meeting Meta Header */}
              <div className="border-b pb-4 flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                    {activeMeeting.status}
                  </span>
                  <h2 className="text-base font-extrabold text-gray-900 mt-2">{activeMeeting.title}</h2>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-2">
                    <span className="flex items-center space-x-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#005BAC]" />
                      <span>{formatDateWithCalendar(activeMeeting.date, calendar, language)} ({activeMeeting.time})</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-[#005BAC]" />
                      <span>{activeMeeting.location}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendance Checklist */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span>Committee Panel Attendance</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {activeMeeting.attendees.map((att) => (
                    <div key={att.userId} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{att.name}</p>
                        <p className="text-[10px] text-gray-500">{att.role}</p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Present"></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protocol Agenda & Electronic Voting */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Vote className="w-4 h-4 text-[#005BAC]" />
                  <span>Agenda Protocols & Committee Electronic Voting</span>
                </h3>

                <div className="space-y-4">
                  {activeMeeting.protocolIds.map((protoId) => {
                    const sub = submissions.find((s) => s.id === protoId || s.refNo === protoId);
                    if (!sub) return null;

                    const userVote = votedMap[sub.id];

                    return (
                      <div key={sub.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold bg-blue-50 text-[#005BAC] px-2 py-0.5 rounded">
                            {sub.refNo}
                          </span>
                          <button
                            onClick={() => onSelectSubmission(sub)}
                            className="text-xs font-bold text-blue-700 hover:underline"
                          >
                            Inspect Full Dossier
                          </button>
                        </div>

                        <h4 className="text-xs font-bold text-gray-900">{sub.title}</h4>
                        <p className="text-[11px] text-gray-600 line-clamp-2">{sub.abstract}</p>

                        {/* Voting Buttons */}
                        <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[11px] font-bold text-gray-700">Committee Member Vote:</span>
                          <div className="flex items-center space-x-2 text-xs">
                            <button
                              onClick={() => handleVote(sub.id, 'APPROVE')}
                              className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                userVote === 'APPROVE'
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVote(sub.id, 'REVISE')}
                              className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                userVote === 'REVISE'
                                  ? 'bg-amber-600 text-white border-amber-600'
                                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              Request Changes
                            </button>
                            <button
                              onClick={() => handleVote(sub.id, 'REJECT')}
                              className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                userVote === 'REJECT'
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                              }`}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Discussion Notes / Minutes Log */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Session Discussion Minutes
                </h3>
                <p className="text-xs text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-200 leading-relaxed italic">
                  "{activeMeeting.discussionNotes || 'Discussion notes being logged by IRB Secretary.'}"
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl text-center text-gray-500 border">
              Select a committee meeting on the left to view agenda and vote.
            </div>
          )}
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 border shadow-xl">
            <h3 className="text-base font-extrabold text-gray-900">Schedule New IRB Committee Panel</h3>

            <form onSubmit={handleCreateMeetingSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. OHB IRB August 2026 Panel Session"
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Venue / Platform</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Include Protocols in Agenda</label>
                <div className="max-h-36 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {submissions.map((s) => (
                    <label key={s.id} className="flex items-center space-x-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProtocols.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedProtocols([...selectedProtocols, s.id]);
                          else setSelectedProtocols(selectedProtocols.filter((id) => id !== s.id));
                        }}
                      />
                      <span>
                        {s.refNo} - {s.title.substring(0, 45)}...
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005BAC] text-white rounded-lg font-bold"
                >
                  Confirm & Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
