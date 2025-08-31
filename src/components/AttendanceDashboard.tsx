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
  FaGraduationCap,
  FaCalculator,
  FaBullseye,
} from 'react-icons/fa';
import { StudentInfo, SubjectAttendance, AttendanceSummary } from '../types/attendance';
import { getAttendanceStatus } from '../utils/attendanceParser';

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

  const overallAttendance = summary.find((s) => s.type === 'Regular')?.percentage || 0;
  const ccaAttendance = summary.find((s) => s.type === 'CCA')?.percentage || 0;
  const overallStatus = getAttendanceStatus(overallAttendance);
  const ccaStatus = getAttendanceStatus(ccaAttendance);

  // Calculate classes needed for target percentage
  const regularSummary = summary.find((s) => s.type === 'Regular');
  const totalClasses = regularSummary?.totalClasses || 0;
  const presentClasses = regularSummary?.presentees || 0;

  const calculateClassesNeeded = (target: number) => {
    if (overallAttendance >= target) {
      // Calculate how many classes can be bunked
      let canBunk = 0;
      let tempPresent = presentClasses;
      let tempTotal = totalClasses;

      while (tempTotal > 0 && (tempPresent / (tempTotal + 1)) * 100 >= target) {
        tempTotal += 1;
        canBunk += 1;
      }

      return { type: 'bunk', count: canBunk };
    } else {
      // Calculate how many classes need to be attended
      let needToAttend = 0;
      let tempPresent = presentClasses;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FaGraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Attendance Portal</h1>
                <p className="text-sm text-gray-500">Academic Year {studentInfo['Acad. Year']}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <FaUser className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                  {studentInfo['Student Name']}
                </h2>
                <p className="text-gray-600 font-medium text-sm sm:text-base">{studentInfo.HTNO}</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                  <span className="flex items-center">
                    <FaUsers className="h-4 w-4 mr-1" />
                    Year {studentInfo.Year}, Semester {studentInfo.Semester}
                  </span>
                  <span>Section {studentInfo.Section}</span>
                </div>
              </div>
            </div>

            {/* Attendance Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`px-3 py-2 rounded-xl ${overallStatus.bgColor}`}>
                <div className="flex items-center justify-center space-x-2">
                  {overallAttendance >= 75 ? (
                    <FaCheckCircle className={`h-4 w-4 ${overallStatus.color}`} />
                  ) : (
                    <FaExclamationTriangle className={`h-4 w-4 ${overallStatus.color}`} />
                  )}
                  <span className={`font-semibold text-sm ${overallStatus.color}`}>
                    {overallAttendance}% Overall
                  </span>
                </div>
              </div>
              <div className={`px-3 py-2 rounded-xl ${ccaStatus.bgColor}`}>
                <div className="flex items-center justify-center space-x-2">
                  {ccaAttendance >= 75 ? (
                    <FaCheckCircle className={`h-4 w-4 ${ccaStatus.color}`} />
                  ) : (
                    <FaExclamationTriangle className={`h-4 w-4 ${ccaStatus.color}`} />
                  )}
                  <span className={`font-semibold text-sm ${ccaStatus.color}`}>
                    {ccaAttendance}% CCA
                  </span>
                </div>
              </div>
            </div>

            {/* Class Calculator */}
            <div className="pt-4 border-t border-gray-200/50">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <FaCalculator className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Attendance Calculator</h3>
                  </div>
                  <div className="flex items-center space-x-2 justify-center sm:justify-end">
                    <FaBullseye className="h-4 w-4 text-gray-500" />
                    <label htmlFor="target" className="text-sm font-medium text-gray-700">
                      Target:
                    </label>
                    <select
                      id="target"
                      value={targetPercentage}
                      onChange={(e) => setTargetPercentage(Number(e.target.value))}
                      className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    >
                      <option value={65}>65%</option>
                      <option value={70}>70%</option>
                      <option value={75}>75%</option>
                      <option value={80}>80%</option>
                      <option value={85}>85%</option>
                      <option value={90}>90%</option>
                      <option value={95}>95%</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  {classCalculation.type === 'attend' ? (
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-center sm:text-left">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaChartLine className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          To reach {targetPercentage}% attendance:
                        </p>
                        <p className="text-base sm:text-lg font-bold text-blue-600">
                          Attend next{' '}
                          <span className="text-xl sm:text-2xl">{classCalculation.count}</span> classes
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-center sm:text-left">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaCheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          You can maintain {targetPercentage}% by:
                        </p>
                        <p className="text-base sm:text-lg font-bold text-emerald-600">
                          Bunking up to{' '}
                          <span className="text-xl sm:text-2xl">{classCalculation.count}</span> classes
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {summary.map((item, index) => {
            const status = getAttendanceStatus(item.percentage);
            return (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 sm:p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {item.type === 'Regular' ? (
                      <FaBook className="h-5 w-5 text-blue-600" />
                    ) : (
                      <FaAward className="h-5 w-5 text-purple-600" />
                    )}
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      {item.type} Classes
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl sm:text-2xl font-bold ${status.color}`}>
                      {item.percentage}%
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                      >
                        {item.percentage >= 90
                          ? 'Excellent'
                          : item.percentage >= 80
                          ? 'Good'
                          : item.percentage >= 75
                          ? 'Warning'
                          : 'Critical'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Classes:</span>
                    <span className="font-medium text-gray-900">{item.totalClasses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Present:</span>
                    <span className="font-medium text-emerald-600">{item.presentees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Absent:</span>
                    <span className="font-medium text-red-600">{item.absentees}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subject-wise Attendance */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200/50">
            <div className="flex items-center space-x-2">
              <FaChartLine className="h-5 w-5 text-blue-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Subject-wise Attendance
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="sticky left-0 bg-gray-50/50 px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200/50 min-w-[180px]">
                    Subject
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Classes Held
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Attendance %
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {subjects.map((subject, index) => {
                  const status = getAttendanceStatus(subject.percentage);
                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/30 transition-colors duration-200"
                    >
                      <td className="sticky left-0 bg-white/70 px-4 sm:px-6 py-3 sm:py-4 border-r border-gray-200/50">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div>
                            <div className="font-medium text-gray-900 text-xs sm:text-sm leading-tight whitespace-nowrap pr-2">
                              {subject.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {subject.held}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {subject.present}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {subject.absent}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                        <div className="flex flex-col items-center space-y-1">
                          <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                subject.percentage >= 90
                                  ? 'bg-emerald-500'
                                  : subject.percentage >= 80
                                  ? 'bg-blue-500'
                                  : subject.percentage >= 75
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`font-semibold text-xs sm:text-sm ${status.color}`}>
                            {subject.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                        >
                          {subject.percentage >= 90
                            ? 'Excellent'
                            : subject.percentage >= 80
                            ? 'Good'
                            : subject.percentage >= 75
                            ? 'Warning'
                            : 'Critical'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Academic Period Info */}
        <div className="mt-8 bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaCalendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Academic Period</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <FaClock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Start Date:</span>
              <span className="font-medium text-gray-900">{studentInfo['Start Date']}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaClock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">End Date:</span>
              <span className="font-medium text-gray-900">
                {studentInfo['End Date'] || 'Ongoing'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;