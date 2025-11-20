import { Bell, Search, ChevronDown, Globe } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Simulated Search */}
        <div className="hidden md:flex items-center bg-slate-50 rounded-lg px-3 py-2 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all mr-4">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search assets, tenants..." 
            className="bg-transparent border-none outline-none text-sm ml-2 text-slate-700 w-64 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-full hover:bg-slate-50 text-slate-500 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">15</span>
          </button>
          
          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Alex" className="w-full h-full" />
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">Alex</span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>

          <button className="flex items-center gap-1 px-2 py-1 rounded text-slate-500 hover:text-slate-800 text-xs font-medium border border-slate-200">
            <Globe size={14} />
            <span>English</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;