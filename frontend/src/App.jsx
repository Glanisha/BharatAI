import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import { LanguageProvider } from "./context/LanguageContext";
import Signup from "./components/Signup";
import StudentDashboard from "./components/StudentDashboard";
import CourseViewer from "./components/CourseViewer";
import StudentStats from "./components/StudentStats";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import CreateCourse from "./components/teacher/CreateCourse";
import Landing from "./components/landing/Landing";
import AllAchievements from "./components/AllAchievements";
import MyAchievements from "./components/MyAchievements";
import PDFTranslator from "./components/translatePart/PDFTranslator";

function App() {
  return (
     <LanguageProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/course/:courseId" element={<CourseViewer />} />
        <Route path="/student-stats" element={<StudentStats />} />
        <Route path="/my-achievements" element={<MyAchievements />} />
        <Route path="/achievements" element={<AllAchievements />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/pdf-translator" element={<PDFTranslator />} />
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
    </LanguageProvider>
  );
}

export default App;
