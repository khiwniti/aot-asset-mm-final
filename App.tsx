
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PropertyListing from './pages/PropertyListing';
import PropertyDetail from './pages/PropertyDetail';
import FinancialManagement from './pages/FinancialManagement';
import LeasingManagement from './pages/LeasingManagement';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import AskAOT from './pages/AskAOT';
import OperationsAnalytics from './pages/OperationsAnalytics';
import Settings from './pages/Settings';
import { ChatProvider } from './context/ChatContext';
import ChatWidget from './components/ChatWidget';
import InsightModal from './components/InsightModal';

const App = () => {
  return (
    <HashRouter>
      <ChatProvider>
        <div className="flex min-h-screen bg-[#f8f9fc]">
          <Sidebar />
          <div className="flex-1 ml-64 transition-all duration-300 relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/properties" element={<PropertyListing />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/financial" element={<FinancialManagement />} />
              <Route path="/leasing" element={<LeasingManagement />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/operations" element={<OperationsAnalytics />} />
              <Route path="/ask-aot" element={<AskAOT />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* Global Chat Widget (Visible on all pages except /ask-aot) */}
            <ChatWidget />
            
            {/* Contextual Insight Modal */}
            <InsightModal />
          </div>
        </div>
      </ChatProvider>
    </HashRouter>
  );
};

export default App;