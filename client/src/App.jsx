import { Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/Layout/Shell';
import Home from './pages/Home';
import DashboardPage from './pages/DashboardPage';
import AssessmentPage from './pages/AssessmentPage';
import ReportView from './pages/ReportView';
import LearningPlanPage from './pages/LearningPlanPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Shell />}>
        <Route index element={<Home />} />
        <Route path="assessment" element={<AssessmentPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="report" element={<ReportView />} />
        <Route path="learning-plan" element={<LearningPlanPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
