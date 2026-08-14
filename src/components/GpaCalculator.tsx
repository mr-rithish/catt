import React, { useMemo, useState } from 'react';
import { FaCalculator, FaRedo } from 'react-icons/fa';
import { SubjectAttendance } from '../types/attendance';

type GradeKey = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F' | '';

const GRADE_POINTS: Record<Exclude<GradeKey, ''>, number> = {
  'A+': 10,
  'A': 9,
  'B+': 8,
  'B': 7,
  'C': 6,
  'D': 5,
  'F': 0,
};

const gradeOptions: GradeKey[] = ['', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F'];
const creditOptions = [0, 1, 2, 3, 4];

interface GpaCalculatorProps {
  subjects: SubjectAttendance[];
}

const gradeColor = (grade: GradeKey) => {
  if (!grade) return 'text-gray-500';
  if (grade === 'A+' || grade === 'A') return 'text-emerald-400';
  if (grade === 'B+' || grade === 'B') return 'text-blue-400';
  if (grade === 'C') return 'text-amber-400';
  if (grade === 'D') return 'text-orange-400';
  return 'text-red-400';
};

export default function GpaCalculator({ subjects }: GpaCalculatorProps) {
  const [rows, setRows] = useState(
    subjects.map((s) => ({ name: s.name, grade: '' as GradeKey, credits: undefined as number | undefined }))
  );

  const setRow = (idx: number, updates: Partial<{ grade: GradeKey; credits: number | undefined }>) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      return next;
    });
  };

  const { gpa, totalCredits, considered } = useMemo(() => {
    let totalPoints = 0;
    let creditsSum = 0;
    let consideredRows = 0;

    for (const r of rows) {
      if (!r.grade || r.credits === undefined || r.credits === null || r.credits === 0) continue;
      const gp = GRADE_POINTS[r.grade as Exclude<GradeKey, ''>];
      totalPoints += gp * r.credits;
      creditsSum += r.credits;
      consideredRows += 1;
    }

    return {
      gpa: creditsSum > 0 ? +(totalPoints / creditsSum).toFixed(2) : 0,
      totalCredits: creditsSum,
      considered: consideredRows,
    };
  }, [rows]);

  const reset = () => {
    setRows(subjects.map((s) => ({ name: s.name, grade: '' as GradeKey, credits: undefined })));
  };

  const gpaColor = () => {
    if (gpa >= 9) return 'text-emerald-400';
    if (gpa >= 8) return 'text-blue-400';
    if (gpa >= 6) return 'text-amber-400';
    if (gpa > 0) return 'text-red-400';
    return 'text-gray-500';
  };

  return (
    <div className="bg-[#1a1d27] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl shadow-black/20">

      {/* Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaCalculator className="h-4 w-4 text-blue-400" />
          <h3 className="text-white font-semibold text-sm sm:text-base">GPA Calculator</h3>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg transition-all"
        >
          <FaRedo className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="sticky left-0 bg-[#1a1d27] pl-5 pr-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-white/[0.06] w-36 sm:w-56">
                Subject
              </th>
              {['Grade', 'Credits', 'Points'].map((h) => (
                <th key={h} className="px-3 sm:px-6 py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map((r, idx) => {
              const gp = r.grade ? GRADE_POINTS[r.grade as Exclude<GradeKey, ''>] : undefined;
              const rowPoints = gp !== undefined && r.credits !== undefined ? gp * r.credits : undefined;

              return (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  {/* Subject name */}
                  <td className="sticky left-0 bg-[#1a1d27] pl-5 pr-3 sm:px-6 py-3 sm:py-4 border-r border-white/[0.06] w-36 sm:w-56">
                    <p className="text-gray-200 font-medium text-xs sm:text-sm leading-tight truncate max-w-[120px] sm:max-w-[200px]">
                      {r.name}
                    </p>
                  </td>

                  {/* Grade select */}
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                    <select
                      value={r.grade}
                      onChange={(e) => setRow(idx, { grade: e.target.value as GradeKey })}
                      className={`bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/60 w-20 sm:w-24 transition-all cursor-pointer ${gradeColor(r.grade)}`}
                    >
                      {gradeOptions.map((g) => (
                        <option key={g || 'none'} value={g} className="bg-[#1a1d27] text-gray-200">
                          {g ? g : '—'}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Credits select */}
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                    <select
                      value={r.credits ?? ''}
                      onChange={(e) => setRow(idx, { credits: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-medium text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/60 w-16 sm:w-20 transition-all cursor-pointer"
                    >
                      <option value="" className="bg-[#1a1d27] text-gray-400">—</option>
                      {creditOptions.map((c) => (
                        <option key={c} value={c} className="bg-[#1a1d27] text-gray-200">{c}</option>
                      ))}
                    </select>
                  </td>

                  {/* Points */}
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                    {rowPoints !== undefined ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        {rowPoints}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="px-5 sm:px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
        <div className="grid grid-cols-3 gap-3">
          {/* Subjects considered */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Subjects</p>
            <p className="text-white font-bold text-lg">{considered}</p>
          </div>

          {/* Total credits */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Credits</p>
            <p className="text-white font-bold text-lg">{totalCredits}</p>
          </div>

          {/* GPA */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">GPA</p>
            <p className={`font-black text-2xl sm:text-3xl tracking-tight ${gpaColor()}`}>
              {gpa > 0 ? gpa.toFixed(2) : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}