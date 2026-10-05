import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DisclaimerBanner from './components/DisclaimerBanner';
import { getPatients } from './services/api';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import WearablesPage from './pages/WearablesPage';
import PredictionPage from './pages/PredictionPage';
import ExplainabilityPage from './pages/ExplainabilityPage';
import SimulationPage from './pages/SimulationPage';
import ReportsPage from './pages/ReportsPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const [activePatient, setActivePatient] = useState('GT-001');
  const [patients, setPatients] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getPatients()
      .then((res) => {
        setPatients(res.data.patients || []);
      })
      .catch((err) => console.error('Failed to load patient list:', err));
  }, []);

  const handleSelectPatient = (id) => {
    setActivePatient(id);
    // If currently on a patient-specific route, navigate to the updated patient ID
    const currentPath = location.pathname;
    const pathParts = currentPath.split('/');
    if (pathParts.length >= 3) {
      pathParts[2] = id;
      navigate(pathParts.join('/'));
    } else if (currentPath === '/login' || currentPath === '/') {
      navigate(`/dashboard/${id}`);
    }
  };

  const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/about';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Mandatory Disclaimer Banner across top */}
      <DisclaimerBanner />

      {/* Main App Navigation */}
      <Navbar
        activePatient={activePatient}
        patients={patients}
        onSelectPatient={handleSelectPatient}
        isLoggedIn={isLoggedIn}
        onLogout={() => setIsLoggedIn(false)}
      />

      {/* App Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {!isPublicPage && <Sidebar activePatient={activePatient} />}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <LoginPage
                  patients={patients}
                  onSelectPatient={handleSelectPatient}
                  onLogin={() => setIsLoggedIn(true)}
                />
              }
            />
            <Route path="/dashboard" element={<Navigate to={`/dashboard/${activePatient}`} replace />} />
            <Route path="/dashboard/:patientId" element={<DashboardPage patientId={activePatient} />} />
            
            <Route path="/profile" element={<Navigate to={`/profile/${activePatient}`} replace />} />
            <Route path="/profile/:patientId" element={<ProfilePage />} />

            <Route path="/wearables" element={<Navigate to={`/wearables/${activePatient}`} replace />} />
            <Route path="/wearables/:patientId" element={<WearablesPage />} />

            <Route path="/prediction" element={<Navigate to={`/prediction/${activePatient}`} replace />} />
            <Route path="/prediction/:patientId" element={<PredictionPage />} />

            <Route path="/explainability" element={<Navigate to={`/explainability/${activePatient}`} replace />} />
            <Route path="/explainability/:patientId" element={<ExplainabilityPage />} />

            <Route path="/simulation" element={<Navigate to={`/simulation/${activePatient}`} replace />} />
            <Route path="/simulation/:patientId" element={<SimulationPage />} />

            <Route path="/reports" element={<Navigate to={`/reports/${activePatient}`} replace />} />
            <Route path="/reports/:patientId" element={<ReportsPage />} />

            <Route path="/history" element={<Navigate to={`/history/${activePatient}`} replace />} />
            <Route path="/history/:patientId" element={<HistoryPage />} />

            <Route path="/about" element={<AboutPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-400">
        <p>GlucoTwin — AI Digital Twin for Early Prediction of Glucose Spikes • Happiest Health Digital Twin Challenge 2026</p>
        <p className="mt-1 text-[11px] text-slate-400">Research & Educational Proof-of-Concept. Synthetic Data Only. Not for Clinical Medical Use.</p>
      </footer>
    </div>
  );
}
