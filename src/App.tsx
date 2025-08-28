import React from 'react';
import { useState } from 'react';
import LoginPage from './components/LoginPage';
import AttendanceDashboard from './components/AttendanceDashboard';
import { fetchStudentData } from './services/api';
import { parseSubjectAttendance, parseAttendanceSummary } from './utils/attendanceParser';
import { StudentInfo, SubjectAttendance, AttendanceSummary } from './types/attendance';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [subjects, setSubjects] = useState<SubjectAttendance[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (htno: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await fetchStudentData(htno, password);
      
      setStudentInfo(data.student_info);
      setSubjects(parseSubjectAttendance(data));
      setSummary(parseAttendanceSummary(data));
      setIsLoggedIn(true);
    } catch (error) {
      throw error; // Re-throw to be handled by LoginPage
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudentInfo(null);
    setSubjects([]);
    setSummary([]);
  };

  if (isLoggedIn && studentInfo) {
    return (
      <AttendanceDashboard
        studentInfo={studentInfo}
        subjects={subjects}
        summary={summary}
        onLogout={handleLogout}
      />
    );
  }

  return <LoginPage onLogin={handleLogin} />;
}

export default App;