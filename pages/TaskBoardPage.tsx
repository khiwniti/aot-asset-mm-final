import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { Plus, CheckSquare } from 'lucide-react';
import TaskBoard from '../components/TaskBoard';

const TaskBoardPage = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Task Board" subtitle="Manage individual tasks and track progress." />
      
      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Task Board</h2>
            <p className="text-slate-600 mt-1">Visualize and manage tasks across different stages of completion</p>
          </div>
          
          <div className="flex items-center gap-3">
            <AIAssistButton prompt="Show me all tasks assigned to me that are due this week." />
            <AIAssistButton prompt="Create a new task for property inspection." />
          </div>
        </div>
        
        <TaskBoard />
      </main>
    </div>
  );
};

export default TaskBoardPage;
