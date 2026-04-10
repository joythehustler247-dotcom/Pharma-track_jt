import { Link } from 'react-router-dom';
import { Bell, Copy, Settings, Search } from 'lucide-react';

interface TopNavProps {
  searchPlaceholder?: string;
}

export default function TopNav({ searchPlaceholder = 'Search hash, batch, or destination...' }: TopNavProps) {
  return (
    <header className="h-[60px] bg-[#0b1120]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-8">
        <Link to="/" className="text-[15px] font-bold text-white tracking-wider font-mono hover:text-cyan-300 transition-colors">PHARMA_LEDGER</Link>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-[320px] h-9 pl-9 pr-4 bg-white/5 border border-white/10 rounded-lg text-[13px] text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors">
          <Copy size={16} />
        </button>
        <button className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
        </button>
        <button className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors">
          <Settings size={16} />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 ml-2 pl-3 border-l border-white/10">
          <div className="text-right hidden lg:block">
            <div className="text-[13px] font-medium text-white">Alex Rivera</div>
            <div className="text-[10px] text-red-400 font-semibold tracking-wider">NODE ADMIN</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
            AR
          </div>
        </div>
      </div>
    </header>
  );
}
