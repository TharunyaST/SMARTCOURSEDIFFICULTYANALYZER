import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddSubjectPage from './pages/AddSubjectPage';
import RateSubjectPage from './pages/RateSubjectPage';
import MaterialsPage from './pages/MaterialsPage';
import SearchPage from './pages/SearchPage';
import ReportsPage from './pages/ReportsPage';
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                
                <Route path="/*" element={
                    <ProtectedRoute>
                        <Layout>
                            <Routes>
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/add-subject" element={<AddSubjectPage />} />
                                <Route path="/rate-subject" element={<RateSubjectPage />} />
                                <Route path="/materials" element={<MaterialsPage />} />
                                <Route path="/search" element={<SearchPage />} />
                                <Route path="/reports" element={<ReportsPage />} />
                                <Route path="*" element={<Navigate to="/dashboard" />} />
                            </Routes>
                        </Layout>
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;
