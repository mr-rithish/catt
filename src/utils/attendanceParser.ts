import { AttendanceResponse, SubjectAttendance, AttendanceSummary } from '../types/attendance';

export function parseSubjectAttendance(data: AttendanceResponse): SubjectAttendance[] {
  const subjects: SubjectAttendance[] = [];
  const summary = data.overall_summary;
  
  if (summary.length < 4) return subjects;
  
  const subjectNames = summary[0];
  const heldClasses = summary[1];
  const presentees = summary[2];
  const absentees = summary[3];
  const extraClasses = summary[4] || {};
  
  // Start from index 1 to skip the header column
  for (let i = 1; i < Object.keys(subjectNames).length; i++) {
    const name = subjectNames[i.toString()];
    const held = parseInt(heldClasses[i.toString()] || '0');
    const present = parseInt(presentees[i.toString()] || '0');
    const absent = parseInt(absentees[i.toString()] || '0');
    const extra = parseInt(extraClasses[i.toString()] || '0');
    
    if (name && held > 0) {
      const percentage = held > 0 ? Math.round((present / held) * 100 * 100) / 100 : 0;
      
      subjects.push({
        name,
        held,
        present,
        absent,
        extra,
        percentage
      });
    }
  }
  
  return subjects;
}

export function parseAttendanceSummary(data: AttendanceResponse): AttendanceSummary[] {
  const summaries: AttendanceSummary[] = [];
  const summary = data.subject_summary;
  
  if (summary.length < 2) return summaries;
  
  // Start from index 1 to skip the header row
  for (let i = 1; i < summary.length; i++) {
    const row = summary[i];
    
    summaries.push({
      type: row['1'] || '',
      totalClasses: parseInt(row['2'] || '0'),
      presentees: parseInt(row['3'] || '0'),
      extraClasses: parseInt(row['4'] || '0'),
      absentees: parseInt(row['5'] || '0'),
      percentage: parseFloat(row['6'] || '0')
    });
  }
  
  return summaries;
}

export function getAttendanceStatus(percentage: number): {
  status: 'excellent' | 'good' | 'warning' | 'critical';
  color: string;
  bgColor: string;
} {
  if (percentage >= 90) {
    return { status: 'excellent', color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
  } else if (percentage >= 80) {
    return { status: 'good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
  } else if (percentage >= 75) {
    return { status: 'warning', color: 'text-amber-600', bgColor: 'bg-amber-50' };
  } else {
    return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-50' };
  }
}