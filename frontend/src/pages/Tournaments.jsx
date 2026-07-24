import React, { useState } from 'react';
import { Trophy, ChevronDown, Medal, Gift, Shirt, MapPin, Clock, CheckCircle } from 'lucide-react';
import { tournaments } from '../data/content';

const highlights = [
  { icon: Medal, text: 'Medals for each division and a podium to capture the moment' },
  { icon: Gift, text: 'Raffles and giveaways' },
  { icon: Shirt, text: 'Free commemorative t-shirts' },
];

export default function Tournaments() {
  const [openYear, setOpenYear] = useState(tournaments.past[0]?.year ?? null);
  const [signedUp, setSignedUp] = useState({});

  const signUp = (name) => setSignedUp((s) => ({ ...s, [name]: true }));

  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-3xl bg-green-900 p-8 sm:p-12 space-y-3">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-700/40 rounded-full blur-3xl" />
        <span className="relative inline-block text-xs font-semibold uppercase tracking-widest text-green-950 bg-white px-3 py-1 rounded-full">USAP-Sanctioned Play</span>
        <h1 className="relative text-3xl font-extrabold text-white">Tournaments</h1>
        <p className="relative text-green-100 max-w-2xl">
          An iPickle tournament is more than a competition — it's a vibe. Since 2019, iPickle has run some
          of the biggest and most fun pickleball tournaments in Southern California, with continuous
          round robin play, guaranteed minimum games, and USAP-sanctioned, DUPR-reported scores.
        </p>
      </header>

      <div className="flex flex-wrap gap-4">
        {highlights.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-sm text-stone-600 bg-white border border-stone-200 rounded-full px-4 py-2 shadow-sm">
            <Icon className="w-4 h-4 text-green-700" /> {text}
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-green-800">Upcoming Tournaments</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {tournaments.upcoming.map((t) => (
            <div key={t.name} className="bg-white border border-green-200 rounded-2xl p-6 space-y-3 shadow-sm">
              <div className="p-2.5 bg-green-800/10 border border-green-800/20 rounded-xl text-green-800 w-fit">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900">{t.name}</h3>
              <div className="space-y-1.5 text-sm text-stone-500">
                <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {t.location} &middot; {t.address}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" /> {t.date} &middot; {t.time}</div>
              </div>
              {signedUp[t.name] ? (
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                  <CheckCircle className="w-4 h-4" /> You're signed up!
                </div>
              ) : (
                <button
                  onClick={() => signUp(t.name)}
                  className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Sign Up
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400">Past Tournaments</h2>
        <div className="space-y-3">
          {tournaments.past.map((yearGroup) => (
            <div key={yearGroup.year} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenYear(openYear === yearGroup.year ? null : yearGroup.year)}
                className="w-full flex items-center justify-between p-5 cursor-pointer"
              >
                <span className="font-bold text-stone-900">{yearGroup.year}</span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${openYear === yearGroup.year ? 'rotate-180' : ''}`} />
              </button>
              {openYear === yearGroup.year && (
                <div className="border-t border-stone-100 divide-y divide-stone-100">
                  {yearGroup.events.map((ev) => (
                    <div key={ev} className="p-4 text-sm text-stone-600">{ev}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
