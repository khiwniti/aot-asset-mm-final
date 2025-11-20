import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { WORK_ORDERS } from '../services/mockData';
import { Plus, CheckSquare, Clock, AlertOctagon } from 'lucide-react';
import MaintenanceTracker from '../components/MaintenanceTracker';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Maintenance & Operations" subtitle="Track work orders, repairs, and facility operations." />
      
      <main className="p-8 max-w-[1600px] mx-auto">
        <MaintenanceTracker />
      </main>
    </div>
  );
};

export default Maintenance;