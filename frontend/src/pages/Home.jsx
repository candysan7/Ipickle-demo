import React, { useState } from 'react';
import { Calendar, MapPin, ArrowRight, Trophy, Users, GraduationCap, Swords, CheckCircle } from 'lucide-react';
import { upcomingEvents, programs, locationNames } from '../data/content';
import HomeSlideshow from '../components/HomeSlideshow';
import heroPhoto from '../assets/home/home_2.jpg';

const programIcons = { Tournaments: Trophy, 'Group Classes': Users, 'Private Lessons': GraduationCap, 'Pickleball Leagues': Swords };

export default function Home({ onChange }) {
  const [signedUp, setSignedUp] = useState({});
  const signUp = (title) => setSignedUp((s) => ({ ...s, [title]: true }));

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-14">
        <img
          src={heroPhoto}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-[50%_25%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-green-950/70 to-green-950/40" />
        <div className="relative max-w-2xl space-y-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-950 bg-white px-3 py-1 rounded-full">
            Southern California's Pickleball &amp; Tennis Club
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Obsessed with the game?<br /> Welcome to the club.
          </h1>
          <p className="text-green-100 text-base sm:text-lg leading-relaxed">
            Tournaments, weekly socials, top-tier lessons and group classes, paddle demos, and affordable
            membership — find the most enthusiastic players on beautiful, dedicated courts at our six
            Southern California locations.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onChange('Tournaments')}
              className="flex items-center gap-2 bg-white hover:bg-green-50 text-green-900 font-semibold py-3 px-6 rounded-xl transition shadow-lg cursor-pointer"
            >
              See Tournaments <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChange('Leagues')}
              className="flex items-center gap-2 bg-green-800 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition border border-green-700 cursor-pointer"
            >
              Join a League
            </button>
            <button
              onClick={() => onChange('Coaching')}
              className="flex items-center gap-2 bg-transparent hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-xl transition border border-green-700 cursor-pointer"
            >
              Book Coaching
            </button>
          </div>
        </div>
      </section>

      {/* Slideshow */}
      <HomeSlideshow />

      {/* Upcoming Events */}
      <section className="space-y-5">
        <h2 className="text-xl font-bold flex items-center gap-2.5 text-stone-900">
          <Calendar className="w-5 h-5 text-green-700" /> Upcoming Tournaments &amp; Events
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {upcomingEvents.map((ev) => (
            <div key={ev.title} className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-green-400 hover:shadow-lg transition">
              <div className="shrink-0 w-14 h-14 rounded-xl bg-green-900 text-white flex flex-col items-center justify-center leading-none">
                <span className="text-[10px] font-semibold uppercase tracking-wide">{ev.dateLabel.split(' ')[0]}</span>
                <span className="text-lg font-extrabold">{ev.dateLabel.match(/\d+/)?.[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 text-sm leading-snug">{ev.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> {ev.location} &middot; {ev.dateLabel}
                </div>
              </div>
              {signedUp[ev.title] ? (
                <span className="shrink-0 flex items-center gap-1.5 text-emerald-700 text-xs font-semibold bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <CheckCircle className="w-3.5 h-3.5" /> Signed up
                </span>
              ) : (
                <button
                  onClick={() => signUp(ev.title)}
                  className="shrink-0 bg-green-800 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer"
                >
                  Sign Up!
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section className="space-y-5">
        <h2 className="text-xl font-bold text-stone-900">Our Programs</h2>
        <p className="text-stone-500 text-sm -mt-3">Join us for tournaments, private or group classes, leagues, drop-in play & more.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {programs.map((p) => {
            const Icon = programIcons[p.title] || Trophy;
            return (
              <div key={p.title} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3 shadow-sm hover:border-teal-300 hover:shadow-lg transition">
                <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-700 w-fit">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900">{p.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Locations preview */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2.5 text-stone-900">
            <MapPin className="w-5 h-5 text-green-700" /> Six Locations Across SoCal
          </h2>
          <button onClick={() => onChange('Locations')} className="text-sm text-green-800 hover:text-green-700 font-semibold flex items-center gap-1 cursor-pointer">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {locationNames.map((name) => (
            <span key={name} className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm text-stone-700 shadow-sm">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* Closing CTA banner */}
      <section className="rounded-3xl bg-teal-800 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-extrabold text-white">Ready to join the club?</h2>
          <p className="text-teal-100 mt-1">Register for a league, sign up for a tournament, or book a lesson today.</p>
        </div>
        <button
          onClick={() => onChange('Leagues')}
          className="shrink-0 bg-white hover:bg-teal-50 text-teal-900 font-semibold py-3 px-6 rounded-xl transition shadow-lg cursor-pointer"
        >
          Join a League
        </button>
      </section>

      <footer className="text-center text-stone-500 text-sm pb-4">
        Reach us at <a href="mailto:info@ipickle.com" className="text-green-800 hover:underline">info@ipickle.com</a>
      </footer>
    </div>
  );
}
