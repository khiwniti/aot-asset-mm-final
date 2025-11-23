import { Bell, Search, ChevronDown, Globe } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-20 px-8 py-5 flex items-center justify-between bg-[#f8fafc]/80 backdrop-blur-md border-b border-slate-200/50 transition-all">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-5">
        {/* Simulated Search */}
        <div className="hidden md:flex items-center bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all w-72 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search properties, data..." 
            className="bg-transparent border-none outline-none text-sm ml-3 text-slate-700 w-full placeholder:text-slate-400 font-medium"
          />
          <div className="flex gap-1">
             <span className="text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 bg-slate-50">⌘</span>
             <span className="text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 bg-slate-50">K</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2.5 rounded-xl hover:bg-white hover:shadow-sm text-slate-500 transition-all border border-transparent hover:border-slate-100">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f8fafc]"></span>
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all text-slate-600">
            <Globe size={18} />
            <span className="text-sm font-semibold">EN</span>
            <ChevronDown size={14} className="text-slate-400 opacity-70" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;