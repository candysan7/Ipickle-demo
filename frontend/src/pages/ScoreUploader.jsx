import React, { useState } from 'react';
import { Upload, Trophy, Table, CheckCircle, Loader2, Sparkles, FileImage, Lock } from 'lucide-react';

const SESSION_KEY = 'ipickle_score_uploader_unlocked';
const PASSWORD = 'andyxiang';

function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white border border-stone-200 rounded-2xl p-8 space-y-5 text-center shadow-sm">
      <div className="p-3 bg-green-800/10 border border-green-800/20 rounded-2xl text-green-800 w-fit mx-auto">
        <Lock className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-stone-900">Score Uploader is protected</h2>
        <p className="text-sm text-stone-400 mt-1">Enter the password to continue.</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          autoFocus
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          className={`w-full bg-stone-50 border rounded-xl px-3.5 py-2.5 text-stone-900 outline-none transition text-center ${
            error ? 'border-red-400' : 'border-stone-200 focus:border-green-600'
          }`}
          placeholder="Password"
        />
        {error && <p className="text-xs text-red-500">Incorrect password.</p>}
        <button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition cursor-pointer"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}

function ScannerTool() {
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
      const res = await fetch(`${BACKEND_URL}/api/scan`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let detail = `Request failed (${res.status})`;
        try {
          const errJson = await res.json();
          detail = errJson.detail || detail;
        } catch {
          // response body wasn't JSON; fall back to the status-based message
        }
        throw new Error(detail);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = (teamIndex, field, value) => {
    const updatedTeams = [...data.teams];
    updatedTeams[teamIndex][field] = value;
    setData({ ...data, teams: updatedTeams });
  };

  const handleScheduleChange = (scheduleIndex, field, value) => {
    const updatedSchedule = [...data.schedule];
    updatedSchedule[scheduleIndex][field] = value;
    setData({ ...data, schedule: updatedSchedule });
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center space-x-4 border-b border-stone-200 pb-6">
        <div className="p-3 bg-green-800/10 border border-green-800/20 rounded-2xl text-green-800">
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">iPickle Score Scanner</h1>
          <p className="text-stone-500 text-sm">Upload paper score sheets to parse match data directly into editable digital tables.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-dashed border-stone-300 hover:border-green-600 rounded-2xl p-8 flex flex-col items-center justify-center bg-white hover:bg-green-50/40 transition group cursor-pointer relative shadow-sm">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="p-4 bg-stone-100 rounded-full mb-4 group-hover:scale-110 transition text-green-800">
            <Upload className="w-8 h-8" />
          </div>
          <p className="text-base text-stone-800 font-semibold mb-1">Click or drag score sheet here</p>
          <p className="text-xs text-stone-400">Supports PNG, JPG, or JPEG (up to 10MB)</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-between min-h-[220px] shadow-sm">
          {preview ? (
            <>
              <div className="w-full flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <FileImage className="w-4 h-4 text-green-800" /> Selected Image
                </span>
                <span className="text-xs text-stone-400 truncate max-w-[200px]">{file?.name}</span>
              </div>
              <img src={preview} alt="Score sheet preview" className="max-h-40 rounded-xl object-contain mb-4 border border-stone-100" />
              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-green-700 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-green-200 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>{loading ? 'Analyzing with Gemini Vision...' : 'Extract Table Data'}</span>
              </button>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-stone-300 text-sm py-8">
              No image selected yet.
            </div>
          )}
        </div>
      </div>

      {data?.tournamentInfo && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-wrap gap-8 text-sm shadow-sm">
          <div><span className="text-stone-400 block text-xs uppercase tracking-wider font-semibold mb-0.5">Division</span> <strong className="text-stone-900 text-base">{data.tournamentInfo.division}</strong></div>
          <div><span className="text-stone-400 block text-xs uppercase tracking-wider font-semibold mb-0.5">Date</span> <strong className="text-stone-900 text-base">{data.tournamentInfo.date}</strong></div>
          <div><span className="text-stone-400 block text-xs uppercase tracking-wider font-semibold mb-0.5">Scorekeeper</span> <strong className="text-stone-900 text-base">{data.tournamentInfo.scorekeeper}</strong></div>
        </div>
      )}

      {data?.teams && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5 text-green-800">
            <Table className="w-5 h-5" /> Standings & Player Scores <span className="text-xs text-stone-400 font-normal">(Click any cell to edit)</span>
          </h2>
          <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-sm">
            <table className="w-full text-sm text-left text-stone-700 border-collapse">
              <thead className="bg-stone-50 text-stone-400 uppercase text-xs tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3 w-16 text-center">Team #</th>
                  <th className="p-3">Player 1</th>
                  <th className="p-3">Player 2</th>
                  {['rd1', 'rd2', 'rd3', 'rd4', 'rd5', 'rd6', 'rd7', 'rd8', 'rd9'].map((rd, idx) => (
                    <th key={rd} className="p-3 text-center w-14">Rd {idx + 1}</th>
                  ))}
                  <th className="p-3 text-center w-16 text-green-800">Wins</th>
                  <th className="p-3 text-center w-16 text-red-700">Losses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.teams.map((t, teamIdx) => (
                  <tr key={teamIdx} className="hover:bg-stone-50 transition">
                    <td className="p-2 text-center font-semibold text-stone-400">{t.teamNumber}</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={t.player1 || ''}
                        onChange={(e) => handleTeamChange(teamIdx, 'player1', e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-green-600 rounded px-2.5 py-1 text-stone-900 font-semibold outline-none transition"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={t.player2 || ''}
                        onChange={(e) => handleTeamChange(teamIdx, 'player2', e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-green-600 rounded px-2.5 py-1 text-stone-900 font-semibold outline-none transition"
                      />
                    </td>
                    {['rd1', 'rd2', 'rd3', 'rd4', 'rd5', 'rd6', 'rd7', 'rd8', 'rd9'].map((rd) => (
                      <td key={rd} className="p-2 text-center">
                        <input
                          type="text"
                          value={t[rd] !== undefined && t[rd] !== null ? t[rd] : ''}
                          onChange={(e) => handleTeamChange(teamIdx, rd, e.target.value)}
                          className="w-12 text-center bg-stone-50 border border-stone-200 focus:border-green-600 rounded py-1 text-stone-700 outline-none transition"
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={t.wins !== undefined && t.wins !== null ? t.wins : ''}
                        onChange={(e) => handleTeamChange(teamIdx, 'wins', e.target.value)}
                        className="w-12 text-center bg-stone-50 border border-stone-200 focus:border-green-600 rounded py-1 text-green-800 font-bold outline-none transition"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={t.losses !== undefined && t.losses !== null ? t.losses : ''}
                        onChange={(e) => handleTeamChange(teamIdx, 'losses', e.target.value)}
                        className="w-12 text-center bg-stone-50 border border-stone-200 focus:border-red-500 rounded py-1 text-red-700 font-bold outline-none transition"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data?.schedule && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5 text-teal-700">
            <Table className="w-5 h-5" /> Court Schedule & Matchups <span className="text-xs text-stone-400 font-normal">(Click any cell to edit)</span>
          </h2>
          <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-sm">
            <table className="w-full text-sm text-left text-stone-700 border-collapse">
              <thead className="bg-stone-50 text-stone-400 uppercase text-xs tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3 w-28">Court</th>
                  {['round1', 'round2', 'round3', 'round4', 'round5', 'round6', 'round7', 'round8', 'round9'].map((rd, idx) => (
                    <th key={rd} className="p-3 text-center">Round {idx + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.schedule.map((s, schedIdx) => (
                  <tr key={schedIdx} className="hover:bg-stone-50 transition">
                    <td className="p-2 font-semibold text-teal-700">Court {s.courtNumber}</td>
                    {['round1', 'round2', 'round3', 'round4', 'round5', 'round6', 'round7', 'round8', 'round9'].map((rd) => (
                      <td key={rd} className="p-2 text-center">
                        <input
                          type="text"
                          value={s[rd] || ''}
                          onChange={(e) => handleScheduleChange(schedIdx, rd, e.target.value)}
                          className="w-16 text-center bg-stone-50 border border-stone-200 focus:border-teal-400 rounded py-1 text-stone-700 outline-none transition"
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

      {data && (
        <div className="pt-4">
          {submitted ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold text-lg">Scores successfully verified and submitted to DUPR!</span>
            </div>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              className="w-full bg-teal-700 hover:bg-teal-600 text-white font-bold py-4 rounded-2xl shadow-xl transition cursor-pointer text-base tracking-wide"
            >
              🚀 Confirm & Send Scores to DUPR
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ScoreUploader() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');

  return unlocked ? <ScannerTool /> : <PasswordGate onUnlock={() => setUnlocked(true)} />;
}
