import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  MessageSquare, 
  Settings,
  LogOut,
  DollarSign,
  Wrench,
  FileText,
  Users,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label, isSpecial }: { to: string; icon: any; label: string; isSpecial?: boolean }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors text-sm font-medium
        ${isActive(to) 
          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }
        ${isSpecial && !isActive(to) ? 'bg-gradient-to-r from-blue-600/5 to-indigo-600/5' : ''}
      `}
    >
      <Icon size={20} className={isActive(to) ? 'text-blue-600' : isSpecial ? 'text-blue-500' : 'text-slate-400'} />
      <span>{label}</span>
      {isSpecial && <Sparkles size={14} className="ml-auto text-amber-400 animate-pulse" />}
    </Link>
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-30 flex flex-col overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path d="M3 21h18M5 21V7l8-4 8 4v14" />
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-xl text-slate-800 tracking-tight">AOT</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Asset Mgmt</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/properties" icon={Home} label="Portfolio" />
        <NavItem to="/financial" icon={DollarSign} label="Financial" />
        <NavItem to="/leasing" icon={Users} label="Leasing" />
        <NavItem to="/maintenance" icon={Wrench} label="Maintenance" />
        <NavItem to="/reports" icon={FileText} label="Reports" />
        
        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          AI Tools
        </div>
        <NavItem to="/ask-aot" icon={MessageSquare} label="Ask AOT" isSpecial={true} />
        
        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          System
        </div>
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-500 transition-colors text-sm font-medium w-full">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;