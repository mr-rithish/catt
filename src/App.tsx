import { useState } from 'react';
import LoginPage from './components/LoginPage';
import AttendanceDashboard from './components/AttendanceDashboard';
import { parseSubjectAttendance, parseAttendanceSummary } from './utils/attendanceParser';
import { StudentInfo, SubjectAttendance, AttendanceSummary } from './types/attendance';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [subjects, setSubjects] = useState<SubjectAttendance[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary[]>([]);
  

  const handleLoginSuccess = (data: any) => {
    setStudentInfo(data.student_info);
    setSubjects(parseSubjectAttendance(data));
    setSummary(parseAttendanceSummary(data));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudentInfo(null);
    setSubjects([]);
    setSummary([]);
  };


  if (isLoggedIn && studentInfo) {
    return (
      <div>
        <AttendanceDashboard
          studentInfo={studentInfo}
          subjects={subjects}
          summary={summary}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  // Landing is the bunk calculator (default `LoginPage`). When the ERP works again, import
  // `LegacyLoginPage` from `./components/LoginPage` and render it here with `onLoginSuccess`.
  return (
    <div>
      <LoginPage onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

export default App;