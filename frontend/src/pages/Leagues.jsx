import React, { useState } from 'react';
import { Swords, AtSign, Mail, CheckCircle, Clock, MapPin, Users } from 'lucide-react';
import { leagues } from '../data/content';

export default function Leagues() {
  const [registered, setRegistered] = useState({});

  const register = (name) => setRegistered((r) => ({ ...r, [name]: true }));

  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-3xl bg-green-900 p-8 sm:p-12 space-y-3">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-700/40 rounded-full blur-3xl" />
        <span className="relative inline-block text-xs font-semibold uppercase tracking-widest text-green-950 bg-white px-3 py-1 rounded-full">Find Your Squad</span>
        <h1 className="relative text-3xl font-extrabold text-white">iPickle Leagues</h1>
        <p className="relative text-green-100 max-w-2xl">
          Meet new friends, get consistent play at the right level, and improve your game by joining an
          iPickle League. Follow us on Instagram{' '}
          <span className="text-white font-semibold inline-flex items-center gap-1">
            <AtSign className="w-4 h-4" /> ipickle.us
          </span>{' '}
          for the latest news!
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-green-800">Open Registration</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {leagues.open.map((l) => (
            <div key={l.name} className="bg-white border border-green-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="p-2.5 bg-green-800/10 border border-green-800/20 rounded-xl text-green-800">
                  <Swords className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Open
                </span>
              </div>
              <h3 className="font-bold text-stone-900 leading-snug">{l.name}</h3>
              <div className="space-y-1.5 text-sm text-stone-500">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> {l.location}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" /> Register by {l.deadline}</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4 shrink-0" /> {l.spotsLeft} spots left &middot; {l.format}</div>
              </div>
              {registered[l.name] ? (
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                  <CheckCircle className="w-4 h-4" /> You're registered!
                </div>
              ) : (
                <button
                  onClick={() => register(l.name)}
                  className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Register Now
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-teal-700">Registration Opening Soon</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {leagues.upcoming.map((l) => (
            <div key={l.name} className="bg-teal-50/60 border border-teal-200 rounded-2xl p-6 space-y-2">
              <h3 className="font-semibold text-stone-900">{l.name}</h3>
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <MapPin className="w-4 h-4 shrink-0" /> {l.location}
              </div>
              <p className="text-sm text-teal-700 font-semibold">Registration opens {l.opensOn}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400">Completed Leagues</h2>
        <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100 shadow-sm">
          {leagues.completed.map((l) => (
            <div key={l} className="p-4 text-sm text-stone-600 hover:bg-stone-50 transition">{l}</div>
          ))}
        </div>
      </section>

      <footer className="text-center text-stone-500 text-sm pb-4 flex items-center justify-center gap-2">
        <Mail className="w-4 h-4" /> Reach us at <a href="mailto:4x4pickleball@ipickle.com" className="text-green-800 hover:underline">4x4pickleball@ipickle.com</a>
      </footer>
    </div>
  );
}
