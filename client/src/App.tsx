import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { AddCourse } from './pages/admin/AddCourse';
import { ManageUsers } from './pages/admin/ManageUsers';
import { LessonPlayer } from './pages/LessonPlayer';
import Achievements from './pages/Achievements';
import { QuizPage } from './pages/Quiz';

import LandingPage from './pages/LandingPage';

import { LessonQuiz } from './pages/LessonQuiz';
import ProfilePage from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* public routes */}
         
          <Route path="/" element={<LandingPage/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses/new" element={<AddCourse/>}/>
          {/* protected routes - all authenticated users */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/courses" 
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz"
            element={
                <QuizPage />
            }
          />
          
          <Route 
            path="/lesson-quiz/:lessonId"
            element={
              <ProtectedRoute>
                <LessonQuiz />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/achievements" 
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />

          {/* lesson player */}
          <Route 
            path="/learn/:courseId" 
            element={
              <ProtectedRoute>
                <LessonPlayer />
              </ProtectedRoute>
            } 
          />

          {/* admin routes */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageUsers />
              </ProtectedRoute>
            } 
          />

          {/* 404 catch-all route - must be last */}
          <Route path="*" element={<NotFound />} />

        

          {/* TODO: add these routes when components are created
          <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/lessons/:id" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/challenges" element={<ProtectedRoute allowedRoles={['student']}><PeerChallenge /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
          */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
