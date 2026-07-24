import React, { useState } from 'react';
import { Upload, Trophy, Table, CheckCircle, Loader2, Sparkles, FileImage } from 'lucide-react';

export default function App() {
  // Dynamic backend URL: Uses Vercel environment variable in production, defaults to localhost locally
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setData(null);
      setSubmitted(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setSubmitted(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Uses the dynamic backend URL here
      const res = await fetch(`${BACKEND_URL}/api/scan`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to parse score sheet');
      const json = await res.json();
      setData(json);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update Standings Table cells
  const handleTeamChange = (teamIndex, field, value) => {
    const updatedTeams = [...data.teams];
    updatedTeams[teamIndex][field] = value;
    setData({ ...data, teams: updatedTeams });
  };

  // Helper function to update Schedule Table cells
  const handleScheduleChange = (scheduleIndex, field, value) => {
    const updatedSchedule = [...data.schedule];
    updatedSchedule[scheduleIndex][field] = value;
    setData({ ...data, schedule: updatedSchedule });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center space-x-4 border-b border-slate-800 pb-6">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">iPickle Score Scanner</h1>
            <p className="text-slate-400 text-sm">Upload paper score sheets to parse match data directly into editable digital tables.</p>
          </div>
        </header>

        {/* Upload & Preview Card Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Custom Dropzone / Upload Box */}
          <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-900/80 transition group cursor-pointer relative">
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            <div className="p-4 bg-slate-800/80 rounded-full mb-4 group-hover:scale-110 transition text-emerald-400">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-base text-slate-200 font-semibold mb-1">Click or drag score sheet here</p>
            <p className="text-xs text-slate-500">Supports PNG, JPG, or JPEG (up to 10MB)</p>
          </div>

          {/* Image Preview & Scan Action */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between min-h-[220px]">
            {preview ? (
              <>
                <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileImage className="w-4 h-4 text-emerald-400" /> Selected Image
                  </span>
                  <span className="text-xs text-slate-500 truncate max-w-[200px]">{file?.name}</span>
                </div>
                <img src={preview} alt="Score sheet preview" className="max-h-40 rounded-xl object-contain mb-4 border border-slate-800" />
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-950/40 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  <span>{loading ? "Analyzing with Gemini Vision..." : "Extract Table Data"}</span>
                </button>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm py-8">
                No image selected yet.
              </div>
            )}
          </div>

        </div>

        {/* Metadata Header */}
        {data?.tournamentInfo && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap gap-8 text-sm">
            <div><span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold mb-0.5">Division</span> <strong className="text-white text-base">{data.tournamentInfo.division}</strong></div>
            <div><span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold mb-0.5">Date</span> <strong className="text-white text-base">{data.tournamentInfo.date}</strong></div>
            <div><span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold mb-0.5">Scorekeeper</span> <strong className="text-white text-base">{data.tournamentInfo.scorekeeper}</strong></div>
          </div>
        )}

        {/* Table 1: Editable Player Scores */}
        {data?.teams && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-emerald-400">
              <Table className="w-5 h-5" /> Standings & Player Scores <span className="text-xs text-slate-500 font-normal">(Click any cell to edit)</span>
            </h2>
            <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl">
              <table className="w-full text-sm text-left text-slate-300 border-collapse">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-16 text-center">Team #</th>
                    <th className="p-3">Player Names</th>
                    {['rd1', 'rd2', 'rd3', 'rd4', 'rd5', 'rd6', 'rd7'].map((rd, idx) => (
                      <th key={rd} className="p-3 text-center w-14">Rd {idx + 1}</th>
                    ))}
                    <th className="p-3 text-center w-16 text-emerald-400">Wins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.teams.map((t, teamIdx) => (
                    <tr key={teamIdx} className="hover:bg-slate-800/30 transition">
                      <td className="p-2 text-center font-semibold text-slate-400">{t.teamNumber}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={t.playerNames || ''}
                          onChange={(e) => handleTeamChange(teamIdx, 'playerNames', e.target.value)}
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded px-2.5 py-1 text-white font-semibold outline-none transition"
                        />
                      </td>
                      {['rd1', 'rd2', 'rd3', 'rd4', 'rd5', 'rd6', 'rd7'].map((rd) => (
                        <td key={rd} className="p-2 text-center">
                          <input
                            type="text"
                            value={t[rd] !== undefined ? t[rd] : ''}
                            onChange={(e) => handleTeamChange(teamIdx, rd, e.target.value)}
                            className="w-12 text-center bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded py-1 text-slate-200 outline-none transition"
                          />
                        </td>
                      ))}
                      <td className="p-2 text-center">
                        <input
                          type="text"
                          value={t.wins !== undefined ? t.wins : ''}
                          onChange={(e) => handleTeamChange(teamIdx, 'wins', e.target.value)}
                          className="w-12 text-center bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded py-1 text-emerald-400 font-bold outline-none transition"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Table 2: Editable Schedule */}
        {data?.schedule && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-indigo-400">
              <Table className="w-5 h-5" /> Court Schedule & Matchups <span className="text-xs text-slate-500 font-normal">(Click any cell to edit)</span>
            </h2>
            <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl">
              <table className="w-full text-sm text-left text-slate-300 border-collapse">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-28">Court</th>
                    {['round1', 'round2', 'round3', 'round4', 'round5', 'round6', 'round7'].map((rd, idx) => (
                      <th key={rd} className="p-3 text-center">Round {idx + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.schedule.map((s, schedIdx) => (
                    <tr key={schedIdx} className="hover:bg-slate-800/30 transition">
                      <td className="p-2 font-semibold text-indigo-400">Court {s.courtNumber}</td>
                      {['round1', 'round2', 'round3', 'round4', 'round5', 'round6', 'round7'].map((rd) => (
                        <td key={rd} className="p-2 text-center">
                          <input
                            type="text"
                            value={s[rd] || ''}
                            onChange={(e) => handleScheduleChange(schedIdx, rd, e.target.value)}
                            className="w-16 text-center bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded py-1 text-slate-200 outline-none transition"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {data && (
          <div className="pt-4">
            {submitted ? (
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400">
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold text-lg">Scores successfully verified and submitted to DUPR!</span>
              </div>
            ) : (
              <button
                onClick={() => setSubmitted(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl transition cursor-pointer text-base tracking-wide"
              >
                🚀 Confirm & Send Scores to DUPR
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}