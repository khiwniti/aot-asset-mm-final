import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { Plus, BarChart3 } from 'lucide-react';
import WorkflowStatusManager from '../components/WorkflowStatusManager';

const WorkflowManagement = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Workflow Management" subtitle="Manage workflows, tasks, and project coordination." />
      
      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Workflow Management</h2>
            <p className="text-slate-600 mt-1">Coordinate workflows and track progress across your organization</p>
          </div>
          
          <div className="flex items-center gap-3">
            <AIAssistButton prompt="Show me all active workflows and their completion status." />
            <AIAssistButton prompt="Create a new workflow for Q1 planning." />
          </div>
        </div>
        
        <WorkflowStatusManager />
      </main>
    </div>
  );
};

export default WorkflowManagement;
