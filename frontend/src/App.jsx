import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Locations from './pages/Locations';
import Leagues from './pages/Leagues';
import Tournaments from './pages/Tournaments';
import Socials from './pages/Socials';
import Coaching from './pages/Coaching';
import ScoreUploader from './pages/ScoreUploader';

const PAGES = {
  Home,
  Locations,
  Leagues,
  Tournaments,
  Socials,
  Coaching,
  'Score Uploader': ScoreUploader,
};

export default function App() {
  const [tab, setTab] = useState('Home');
  const Page = PAGES[tab] ?? Home;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <Navbar active={tab} onChange={setTab} />
      <main className="max-w-6xl mx-auto p-4 sm:p-8">
        <Page onChange={setTab} />
      </main>
    </div>
  );
}
