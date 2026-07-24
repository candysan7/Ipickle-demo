import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const TABS = ['Home', 'Locations', 'Leagues', 'Tournaments', 'Socials', 'Coaching', 'Score Uploader'];

export default function Navbar({ active, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => { onChange('Home'); setOpen(false); }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="h-11 px-3 bg-green-900 rounded-xl flex items-center justify-center shadow-sm">
            <img src="/ipickle_icon.png" alt="iPickle" className="h-6 w-auto object-contain" />
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                active === tab
                  ? 'bg-green-800/10 text-green-800 border border-green-800/20'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <button
          className="md:hidden p-2 text-stone-600 cursor-pointer"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-stone-200 px-4 py-3 flex flex-col gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { onChange(tab); setOpen(false); }}
              className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                active === tab
                  ? 'bg-green-800/10 text-green-800 border border-green-800/20'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
