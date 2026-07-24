import React from 'react';
import { MapPin, Phone, LandPlot } from 'lucide-react';
import { locations } from '../data/content';

export default function Locations() {
  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-3xl bg-green-900 p-8 sm:p-12 space-y-3">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-700/40 rounded-full blur-3xl" />
        <span className="relative inline-block text-xs font-semibold uppercase tracking-widest text-green-950 bg-white px-3 py-1 rounded-full">Six Clubs, Southern California</span>
        <h1 className="relative text-3xl font-extrabold text-white">Locations</h1>
        <p className="relative text-green-100 max-w-2xl">
          Established in 2018, we have 83 beautifully-maintained, well-lit, dedicated and dual-use
          pickleball courts across Southern California.
        </p>
      </header>

      {locations.map((group) => (
        <section key={group.county} className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-teal-700">{group.county}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {group.clubs.map((club) => (
              <div
                key={club.name}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:border-teal-300 hover:shadow-lg transition"
              >
                <iframe
                  title={club.name}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(club.address)}&output=embed`}
                  className="w-full h-40 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="p-6 space-y-3">
                  <h3 className="font-bold text-stone-900 text-lg">{club.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-teal-700 font-semibold">
                    <LandPlot className="w-4 h-4" /> {club.courts}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-stone-500">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {club.address}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Phone className="w-4 h-4 shrink-0" /> {club.phone}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
