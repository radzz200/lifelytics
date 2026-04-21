import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Simulate from './pages/Simulate';
import Upload from './pages/Upload';
import DoctorPortal from './pages/DoctorPortal';
import Timeline from './pages/Timeline';
import ActionPlan from './pages/ActionPlan';
import ManualHistory from './pages/ManualHistory';
import Science from './pages/Science';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-navy text-white">
        {/* Navigation could go here later if needed globally */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulate" element={<Simulate />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/doctor-portal" element={<DoctorPortal />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/action-plan" element={<ActionPlan />} />
          <Route path="/history" element={<ManualHistory />} />
          <Route path="/science" element={<Science />} />
        </Routes>
        <footer className="w-full text-center py-4 bg-navy/80 backdrop-blur-sm border-t border-border text-xs text-gray-500 fixed bottom-0 z-50 print:hidden">
          This tool is for educational purposes only and not medical advice.
        </footer>
      </div>
    </Router>
  );
}

export default App;
