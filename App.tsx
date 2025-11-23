
import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PropertyListing from './pages/PropertyListing';
import PropertyDetail from './pages/PropertyDetail';
import FinancialManagement from './pages/FinancialManagement';
import LeasingManagement from './pages/LeasingManagement';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import AskAOT from './pages/AskAOT';
import OperationsAnalytics from './pages/OperationsAnalytics';
import Settings from './pages/Settings';
import { ChatProvider } from './context/ChatContext';
import ChatWidget from './components/ChatWidget';
import InsightModal from './components/InsightModal';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <HashRouter>
      <ChatProvider>
        <div className="flex min-h-screen bg-[#f8f9fc] relative">
          {/* Sidebar controls its own internal layout, App controls the margin spacing */}
          <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          {/* Main Content Area - Resizes based on sidebar state */}
          <div 
            className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] relative
              ${isSidebarOpen ? 'ml-[290px]' : 'ml-[110px]'} 
            `}
          >
            <div className="w-full h-full">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/properties" element={<PropertyListing />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/financial" element={<FinancialManagement />} />
                <Route path="/leasing" element={<LeasingManagement />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/:id" element={<ReportDetail />} />
                <Route path="/operations" element={<OperationsAnalytics />} />
                <Route path="/ask-aot" element={<AskAOT />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            
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
