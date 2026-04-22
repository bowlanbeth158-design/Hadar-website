import { Search, MessageSquare, Bell } from 'lucide-react';

export function AdminTopBar() {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="flex items-center gap-4 px-6 py-3">
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden />
          <input
            type="search"
            placeholder="Rechercher un signalement, un utilisateur, un membre…"
            className="w-full rounded-pill bg-gray-50 border border-gray-200 pl-11 pr-4 py-2 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Conversations"
            className="relative h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-brand-navy"
          >
            <MessageSquare className="h-5 w-5" aria-hidden />
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              3
            </span>
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="relative h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-brand-navy"
          >
            <Bell className="h-5 w-5" aria-hidden />
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              8
            </span>
          </button>

          <span className="hidden md:inline-flex items-center rounded-pill border border-brand-navy text-brand-navy px-3 py-1 text-xs font-semibold">
            Admin
          </span>

          <button
            type="button"
            aria-label="Menu du compte administrateur"
            className="h-9 w-9 rounded-full bg-grad-stat-navy text-white font-semibold text-sm flex items-center justify-center"
          >
            HM
          </button>
        </div>
      </div>
    </header>
  );
}
