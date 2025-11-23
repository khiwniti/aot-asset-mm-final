
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
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar = ({ isOpen, toggle }: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label, isSpecial }: { to: string; icon: any; label: string; isSpecial?: boolean }) => (
    <Link
      to={to}
      className={`group relative flex items-center gap-3 px-3 py-3 mb-1.5 rounded-xl transition-all duration-300 font-medium text-[13px] tracking-wide overflow-hidden whitespace-nowrap
        ${isActive(to) 
          ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
          : 'text-slate-500 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm'
        }
        ${isSpecial && !isActive(to) ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600' : ''}
        ${!isOpen ? 'justify-center' : ''}
      `}
      title={!isOpen ? label : ''}
    >
      <Icon 
        size={18} 
        className={`transition-transform duration-300 shrink-0 
          ${isActive(to) ? 'text-blue-400' : isSpecial ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
          ${!isOpen ? 'scale-110' : 'group-hover:scale-110'}
        `} 
        strokeWidth={isActive(to) ? 2.5 : 2} 
      />
      
      <span className={`transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 w-0 hidden'}`}>
        {label}
      </span>
      
      {isSpecial && isOpen && <Sparkles size={14} className="ml-auto text-blue-500 animate-pulse" />}
      
      {/* Active Indicator Dot */}
      {isActive(to) && (
        <div className={`absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] transition-opacity duration-300 ${!isOpen ? 'hidden' : ''}`}></div>
      )}
    </Link>
  );

  return (
    <aside 
      className={`fixed left-4 top-4 bottom-4 z-30 flex flex-col 
        bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] 
        rounded-[32px] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
        ${isOpen ? 'w-[260px]' : 'w-[80px]'}
      `}
    >
      {/* Toggle Button */}
      <button 
        onClick={toggle}
        className="absolute -right-3 top-8 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all z-40"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Logo Area */}
      <div className={`p-6 flex items-center gap-3 mb-2 transition-all duration-300 ${!isOpen ? 'justify-center px-0' : ''}`}>
        <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200 shrink-0 rotate-3">
          <Layers size={20} strokeWidth={3} className="text-blue-400" />
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
          <h1 className="font-bold text-xl text-slate-900 tracking-tight leading-none whitespace-nowrap">AOT</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1 whitespace-nowrap">Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="space-y-1">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/properties" icon={Home} label="Portfolio" />
            <NavItem to="/financial" icon={DollarSign} label="Financial" />
            <NavItem to="/leasing" icon={Users} label="Leasing" />
            <NavItem to="/operations" icon={Wrench} label="Operations" />
            <NavItem to="/reports" icon={FileText} label="Reports" />
        </div>
        
        <div className={`mt-8 mb-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-opacity duration-300 ${!isOpen ? 'opacity-0 hidden' : 'opacity-100'}`}>
          AI & Tools
        </div>
        <div className={`space-y-1 ${!isOpen ? 'mt-8' : ''}`}>
            <NavItem to="/ask-aot" icon={MessageSquare} label="Ask AOT" isSpecial={true} />
            <NavItem to="/settings" icon={Settings} label="Settings" />
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 m-2">
        <div className={`flex items-center gap-3 p-2 bg-white/50 rounded-2xl border border-white/60 shadow-sm transition-all duration-300 ${!isOpen ? 'justify-center' : ''}`}>
           <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="User" />
           </div>
           <div className={`min-w-0 transition-all duration-300 overflow-hidden ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>
              <p className="text-xs font-bold text-slate-900 truncate">Alex Morgan</p>
              <p className="text-[10px] text-slate-400 truncate">Asset Manager</p>
           </div>
           {isOpen && (
             <button className="ml-auto text-slate-400 hover:text-red-500 transition-colors">
               <LogOut size={16} />
             </button>
           )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
