import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import Events from './pages/Events';
import Proctors from './pages/Proctors';
import TahunAjaran from './pages/TahunAjaran';
import Students from './pages/Students';
import ExamSchedule from './pages/ExamSchedule';

const AppContent = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 border-4 border-sunset/10 border-t-sunset rounded-full animate-spin shadow-[0_0_30px_rgba(255,88,65,0.3)] dark:shadow-[0_0_40px_rgba(255,88,65,0.5)]" />
          <p className="text-slate-500 dark:text-slate-400 font-black tracking-widest animate-pulse uppercase">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
      <Route path="/" element={token ? <AdminDashboard /> : <Navigate to="/login" />} />
      <Route path="/users" element={token ? <Users /> : <Navigate to="/login" />} />
      <Route path="/events" element={token ? <Events /> : <Navigate to="/login" />} />
      <Route path="/proctors" element={token ? <Proctors /> : <Navigate to="/login" />} />
      <Route path="/tahun-ajaran" element={token ? <TahunAjaran /> : <Navigate to="/login" />} />
      <Route path="/students" element={token ? <Students /> : <Navigate to="/login" />} />
      <Route path="/exam-schedule" element={token ? <ExamSchedule /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
