export interface StudentInfo {
  HTNO: string;
  'Student Name': string;
  Year: string;
  Semester: string;
  Section: string;
  'Acad. Year': string;
  'Start Date': string;
  'End Date': string;
}

export interface AttendanceResponse {
  student_info: StudentInfo;
  overall_summary: Record<string, string>[];
  subject_summary: Record<string, string>[];
}

export interface SubjectAttendance {
  name: string;
  held: number;
  present: number;
  absent: number;
  extra: number;
  percentage: number;
}

export interface AttendanceSummary {
  type: string;
  totalClasses: number;
  presentees: number;
  extraClasses: number;
  absentees: number;
  percentage: number;
}