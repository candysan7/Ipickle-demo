import React, { useMemo, useState } from 'react';
import { GraduationCap, MapPin, DollarSign, Clock, CheckCircle, X } from 'lucide-react';
import { coaches, locationNames } from '../data/content';

export default function Coaching() {
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [booking, setBooking] = useState(null); // { coach, slot }
  const [form, setForm] = useState({ name: '', email: '' });
  const [confirmed, setConfirmed] = useState(null); // { coach, slot }

  const filtered = useMemo(() => {
    if (locationFilter === 'All Locations') return coaches;
    return coaches.filter((c) => c.location === locationFilter);
  }, [locationFilter]);

  const startBooking = (coach, slot) => {
    setBooking({ coach, slot });
    setForm({ name: '', email: '' });
  };

  const confirmBooking = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setConfirmed(booking);
    setBooking(null);
  };

  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-3xl bg-green-900 p-8 sm:p-12 space-y-3">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-700/40 rounded-full blur-3xl" />
        <span className="relative inline-block text-xs font-semibold uppercase tracking-widest text-green-950 bg-white px-3 py-1 rounded-full">Private & Group Lessons</span>
        <h1 className="relative text-3xl font-extrabold text-white">Coaching</h1>
        <p className="relative text-green-100 max-w-2xl">
          Book private or group coaching with an iPickle pro. Filter by location, pick an open time slot,
          and reserve your spot.
        </p>
        <span className="relative inline-block text-xs font-semibold uppercase tracking-widest text-white bg-white/15 border border-white/30 px-3 py-1 rounded-full">
          Demo booking — no payment collected
        </span>
      </header>

      <div className="flex flex-wrap gap-2">
        {['All Locations', ...locationNames].map((loc) => (
          <button
            key={loc}
            onClick={() => setLocationFilter(loc)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition cursor-pointer border ${
              locationFilter === loc
                ? 'bg-green-800/10 text-green-800 border-green-400'
                : 'text-stone-500 border-stone-200 bg-white hover:border-stone-300 hover:text-stone-900'
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      {confirmed && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700">
          <CheckCircle className="w-6 h-6 shrink-0" />
          <span className="font-semibold">
            Booked {confirmed.slot} with {confirmed.coach.name} at {confirmed.coach.location}. A confirmation would be emailed to {form.email || 'you'}.
          </span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((coach) => (
          <div key={coach.id} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm hover:border-teal-300 hover:shadow-lg transition">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-green-800/10 border border-green-800/20 text-green-800 flex items-center justify-center font-bold">
                {coach.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-bold text-stone-900 leading-tight">{coach.name}</h3>
                <p className="text-xs text-stone-400">{coach.specialty}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-stone-500">
              <MapPin className="w-4 h-4 shrink-0" /> {coach.location}
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
              <DollarSign className="w-4 h-4 shrink-0" /> ${coach.rate}/{coach.rateUnit}
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Availability
              </p>
              <div className="flex flex-wrap gap-2">
                {coach.availability.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => startBooking(coach, slot)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-green-800/10 hover:text-green-800 border border-transparent hover:border-green-200 transition cursor-pointer"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4" onClick={() => setBooking(null)}>
          <div
            className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-md space-y-5 relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setBooking(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-800/10 border border-green-800/20 rounded-xl text-green-800">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900">Book {booking.coach.name}</h3>
                <p className="text-xs text-stone-400">{booking.slot} &middot; {booking.coach.location} &middot; ${booking.coach.rate}/{booking.coach.rateUnit}</p>
              </div>
            </div>

            <form onSubmit={confirmBooking} className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-green-600 rounded-xl px-3.5 py-2.5 text-stone-900 outline-none transition"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-green-600 rounded-xl px-3.5 py-2.5 text-stone-900 outline-none transition"
                  placeholder="jane@example.com"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-green-200 cursor-pointer"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
