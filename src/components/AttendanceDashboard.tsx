import React, { useState } from 'react';
import {
  FaUser,
  FaCalendar,
  FaBook,
  FaChartLine,
  FaClock,
  FaAward,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUsers,
  FaBars,
  FaCalculator,
  FaBullseye,
  FaGraduationCap,
} from 'react-icons/fa';
import { StudentInfo, SubjectAttendance, AttendanceSummary } from '../types/attendance';
import { getAttendanceStatus } from '../utils/attendanceParser';
import GpaCalculator from './GpaCalculator';

interface AttendanceDashboardProps {
  studentInfo: StudentInfo;
  subjects: SubjectAttendance[];
  summary: AttendanceSummary[];
  onLogout: () => void;
}

const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({
  studentInfo,
  subjects,
  summary,
  onLogout,
}) => {
  const [targetPercentage, setTargetPercentage] = useState(75);
  const [targetInput, setTargetInput] = useState('75');
  const [activeTab, setActiveTab] = useState<'attendance' | 'gpa'>('attendance');
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const regularSummary = summary.find((s) => s.type === 'Regular');
  const overallAttendance = regularSummary?.percentage || 0;
  const totalClasses = regularSummary?.totalClasses || 0;
  const presentClasses = regularSummary?.presentees || 0;
  const extraClasses = regularSummary?.extraClasses || 0;

  // For attendance calculator, present = presentees + extraClasses
  const presentWithExtra = presentClasses + extraClasses;

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTargetInput(raw);
    const parsed = parseFloat(raw);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      setTargetPercentage(parsed);
    }
  };

  const isInputInvalid =
    targetInput.trim() !== '' &&
    (isNaN(parseFloat(targetInput)) ||
      parseFloat(targetInput) < 0 ||
      parseFloat(targetInput) > 100);


  const calculateClassesNeeded = (target: number) => {
    // Use presentWithExtra for calculations
    if (overallAttendance >= target) {
      let canBunk = 0;
      let tempPresent = presentWithExtra;
      let tempTotal = totalClasses;
      while (tempTotal > 0 && (tempPresent / (tempTotal + 1)) * 100 >= target) {
        tempTotal += 1;
        canBunk += 1;
      }
      return { type: 'bunk', count: canBunk };
    } else {
      let needToAttend = 0;
      let tempPresent = presentWithExtra;
      let tempTotal = totalClasses;
      while (tempTotal > 0 && (tempPresent / tempTotal) * 100 < target) {
        tempPresent += 1;
        tempTotal += 1;
        needToAttend += 1;
      }
      return { type: 'attend', count: needToAttend };
    }
  };

  const classCalculation = calculateClassesNeeded(targetPercentage);

  const getAttendanceColor = (pct: number) => {
    if (pct >= 90) return 'text-emerald-400';
    if (pct >= 80) return 'text-blue-400';
    if (pct >= 75) return 'text-amber-400';
    return 'text-red-400';
  };

  const getAttendanceBg = (pct: number) => {
    if (pct >= 90) return 'bg-emerald-500/10 border-emerald-500/20';
    if (pct >= 80) return 'bg-blue-500/10 border-blue-500/20';
    if (pct >= 75) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getAttendanceBar = (pct: number) => {
    if (pct >= 90) return 'bg-emerald-500';
    if (pct >= 80) return 'bg-blue-500';
    if (pct >= 75) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getAttendanceLabel = (pct: number) => {
    if (pct >= 90) return 'Excellent';
    if (pct >= 80) return 'Good';
    if (pct >= 75) return 'Warning';
    return 'Critical';
  };

  return (
    <div className="min-h-screen bg-[#0f1117] relative overflow-x-hidden">

      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glow blobs */}
      <div className="fixed top-[-10%] left-[-5%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Header ── */}
      <header className="bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-blue-600/20"
                >
                  <FaBars className="h-4 w-4 text-white" />
                  <span className="absolute -top-1 -right-1 inline-flex h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-[#0f1117]" />
                </button>

                {isMenuOpen && (
                  <div className="absolute top-12 left-0 bg-[#1a1d27] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 py-1.5 min-w-[170px] z-50">
                    {(['attendance', 'gpa'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setIsMenuOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                          activeTab === tab
                            ? 'text-blue-400 bg-blue-500/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {tab === 'attendance' ? 'Attendance' : 'GPA Calculator'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FaGraduationCap className="text-white text-xs" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-base leading-tight">Attendance Portal</h1>
                  <p className="hidden sm:block text-gray-500 text-xs">Academic Year {studentInfo['Acad. Year']}</p>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium hover:bg-white/5 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {activeTab === 'attendance' ? (
          <>
            {/* ── Student Info Card ── */}
            <div className="bg-[#1a1d27] border border-white/[0.08] rounded-2xl p-5 sm:p-6 mb-6 shadow-xl shadow-black/20">

              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
                  <FaUser className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-white font-bold text-lg sm:text-xl leading-tight truncate">
                    {studentInfo['Student Name']}
                  </h2>
                  <p className="text-gray-400 text-sm font-mono">{studentInfo.HTNO}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-gray-500 text-xs">
                      <FaUsers className="h-3 w-3" />
                      Year {studentInfo.Year} · Sem {studentInfo.Semester}
                    </span>
                    <span className="text-gray-500 text-xs">Section {studentInfo.Section}</span>
                  </div>
                </div>
              </div>

              {/* Attendance pill: Only Overall */}
              <div className="grid grid-cols-1 gap-3 mb-5">
                <div className={`border rounded-xl px-4 py-3 ${getAttendanceBg(overallAttendance)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-xs font-medium">Overall</span>
                    {overallAttendance >= 75
                      ? <FaCheckCircle className={`h-3.5 w-3.5 ${getAttendanceColor(overallAttendance)}`} />
                      : <FaExclamationTriangle className={`h-3.5 w-3.5 ${getAttendanceColor(overallAttendance)}`} />
                    }
                  </div>
                  <p className={`text-2xl font-black ${getAttendanceColor(overallAttendance)}`}>{overallAttendance}%</p>
                  <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getAttendanceBar(overallAttendance)}`}
                      style={{ width: `${Math.min(overallAttendance, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Attendance Calculator ── */}
              <div className="border-t border-white/[0.06] pt-5">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <FaCalculator className="h-4 w-4 text-blue-400" />
                      <h3 className="text-white font-semibold text-sm">Attendance Calculator</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaBullseye className="h-3.5 w-3.5 text-gray-500" />
                      <label htmlFor="target" className="text-gray-400 text-xs font-medium">Target:</label>
                      <div className="relative flex items-center">
                        <input
                          id="target"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={targetInput}
                          onChange={handleTargetChange}
                          placeholder="75"
                          className={`w-20 bg-white/5 border rounded-lg px-3 py-1.5 pr-7 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/60 transition-all ${
                            isInputInvalid ? 'border-red-500/50 ring-1 ring-red-500/30' : 'border-white/10'
                          }`}
                        />
                        <span className="absolute right-2 text-xs text-gray-500 pointer-events-none">%</span>
                      </div>
                      {isInputInvalid && (
                        <span className="text-xs text-red-400">0–100</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0f1117] rounded-lg p-4 border border-white/[0.04]">
                    <div className="flex flex-wrap gap-4 mb-3">
                      <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-lg">Present: <span className="text-emerald-400 font-bold">{presentClasses}</span></span>
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">Extra: <span className="font-bold">{extraClasses}</span></span>
                      <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-lg">Total: <span className="font-bold">{totalClasses}</span></span>
                    </div>
                    {classCalculation.type === 'attend' ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaChartLine className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">To reach {targetPercentage}% attendance</p>
                          <p className="text-blue-400 font-bold text-base">
                            Attend next <span className="text-2xl">{classCalculation.count}</span> classes
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaCheckCircle className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Maintaining {targetPercentage}% attendance</p>
                          <p className="text-emerald-400 font-bold text-base">
                            You can bunk <span className="text-2xl">{classCalculation.count}</span> classes
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {summary.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#1a1d27] border border-white/[0.08] rounded-xl p-5 shadow-xl shadow-black/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {item.type === 'Regular'
                        ? <FaBook className="h-4 w-4 text-blue-400" />
                        : <FaAward className="h-4 w-4 text-purple-400" />
                      }
                      <span className="text-gray-300 font-semibold text-sm">{item.type}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getAttendanceBg(item.percentage)} ${getAttendanceColor(item.percentage)}`}>
                      {getAttendanceLabel(item.percentage)}
                    </span>
                  </div>

                  <p className={`text-3xl font-black mb-1 ${getAttendanceColor(item.percentage)}`}>
                    {item.percentage}%
                  </p>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getAttendanceBar(item.percentage)}`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    {item.type === 'Regular' ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total</span>
                          <span className="font-semibold text-gray-400">{item.totalClasses}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Present</span>
                          <span className="font-semibold text-emerald-400">{item.presentees}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Extra</span>
                          <span className="font-semibold text-blue-400">{item.extraClasses || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Absent</span>
                          <span className="font-semibold text-red-400">{item.absentees}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total</span>
                          <span className="font-semibold text-gray-400">{item.totalClasses}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Present</span>
                          <span className="font-semibold text-emerald-400">{item.presentees}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Absent</span>
                          <span className="font-semibold text-red-400">{item.absentees}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Subject-wise Table ── */}
            <div className="bg-[#1a1d27] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl shadow-black/20 mb-6">
              <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <FaChartLine className="h-4 w-4 text-blue-400" />
                  <h3 className="text-white font-semibold text-sm sm:text-base">Subject-wise Attendance</h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[580px]">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="sticky left-0 bg-[#1a1d27] pl-5 pr-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-white/[0.06] min-w-[130px]">
                        Subject
                      </th>
                      {['Held', 'Present', 'Absent', 'Attendance', 'Status'].map((h) => (
                        <th key={h} className="px-3 sm:px-5 py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {subjects.map((subject, index) => (
                      <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                        <td className="sticky left-0 bg-[#1a1d27] pl-5 pr-3 sm:px-6 py-3 sm:py-4 border-r border-white/[0.06]">
                          <p className="text-gray-200 font-medium text-xs sm:text-sm leading-tight truncate max-w-[120px] sm:max-w-[180px]">
                            {subject.name}
                          </p>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4 text-center">
                          <span className="text-gray-400 text-xs font-medium bg-white/5 px-2 py-0.5 rounded-full">
                            {subject.held}
                          </span>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4 text-center">
                          <span className="text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {subject.present}
                          </span>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4 text-center">
                          <span className="text-red-400 text-xs font-medium bg-red-500/10 px-2 py-0.5 rounded-full">
                            {subject.absent}
                          </span>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-12 sm:w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getAttendanceBar(subject.percentage)}`}
                                style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${getAttendanceColor(subject.percentage)}`}>
                              {subject.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4 text-center">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getAttendanceBg(subject.percentage)} ${getAttendanceColor(subject.percentage)}`}>
                            {getAttendanceLabel(subject.percentage)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Academic Period ── */}
            <div className="bg-[#1a1d27] border border-white/[0.08] rounded-xl p-5 sm:p-6 shadow-xl shadow-black/20">
              <div className="flex items-center gap-2 mb-4">
                <FaCalendar className="h-4 w-4 text-blue-400" />
                <h3 className="text-white font-semibold text-sm">Academic Period</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Start Date', value: studentInfo['Start Date'] },
                  { label: 'End Date', value: studentInfo['End Date'] || 'Ongoing' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <FaClock className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-500 text-xs">{label}:</span>
                    <span className="text-gray-300 text-xs font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <GpaCalculator subjects={subjects} />
            <p className="text-gray-600 text-xs">
              Tip: Leave grade or credits empty for subjects without exams; they'll be ignored in GPA.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDashboard;