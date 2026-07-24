import React from 'react';
import { Clock, MapPin, User } from 'lucide-react';
import { socialSchedule } from '../data/content';

export default function Socials() {
  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-3xl bg-green-900 p-8 sm:p-12 space-y-3">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-700/40 rounded-full blur-3xl" />
        <span className="relative inline-block text-xs font-semibold uppercase tracking-widest text-green-950 bg-white px-3 py-1 rounded-full">Weekly Open Play</span>
        <h1 className="relative text-3xl font-extrabold text-white">Socials</h1>
        <p className="relative text-green-100 max-w-2xl">
          It's more than just open play. iPickle socials are led by our certified pickleball professionals
          who greet newcomers, organize games, and make sure play is running smoothly. Come with friends
          or come by yourself — meet players at your level or test your skills on the challenge courts.
        </p>
        <p className="relative text-sm text-white font-semibold">
          Free for members &middot; $10 for non-members ($15 at S. Pasadena, The Narrows, and Arcadia)
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {socialSchedule.map((day) => (
          <div key={day.day} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm hover:border-green-300 hover:shadow-lg transition">
            <h2 className="font-bold text-stone-900 text-lg">{day.day}</h2>
            <div className="space-y-4">
              {day.slots.map((slot, i) => (
                <div key={i} className="border-t border-stone-100 pt-3 first:border-t-0 first:pt-0 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-green-800 font-semibold">
                    <Clock className="w-4 h-4 shrink-0" /> {slot.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <MapPin className="w-4 h-4 shrink-0" /> {slot.location}
                  </div>
                  {slot.label && <p className="text-sm text-stone-700 font-medium">{slot.label}</p>}
                  {slot.host && (
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <User className="w-3.5 h-3.5 shrink-0" /> Host: {slot.host}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
