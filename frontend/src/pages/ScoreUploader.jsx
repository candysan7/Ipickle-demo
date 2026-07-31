import React, { useState } from 'react';
import { Upload, Trophy, Table, CheckCircle, Loader2, Sparkles, FileImage, Lock, Download, Search, AlertTriangle, X } from 'lucide-react';
import RefreshPlayerListButton from '../components/RefreshPlayerListButton';

const CSV_HEADERS = [
  'matchType', 'event', 'date',
  'playerA1', 'playerA1DuprId', 'playerA1ExternalId',
  'playerA2', 'playerA2DuprId', 'playerA2ExternalId',
  'playerB1', 'playerB1DuprId', 'playerB1ExternalId',
  'playerB2', 'playerB2DuprId', 'playerB2ExternalId',
  'teamAGame1', 'teamBGame1', 'teamAGame2', 'teamBGame2',
  'teamAGame3', 'teamBGame3', 'teamAGame4', 'teamBGame4',
  'teamAGame5', 'teamBGame5', 'location', 'scoreType',
];

function csvEscape(value) {
  const str = value === undefined || value === null ? '' : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function buildMatchRowsFromScan(data) {
  const teamsByNumber = new Map((data.teams || []).map((t) => [Number(t.teamNumber), t]));
  const rows = [];

  (data.schedule || []).forEach((court) => {
    for (let round = 1; round <= 9; round += 1) {
      const matchup = court[`round${round}`];
      const parsed = typeof matchup === 'string' && matchup.match(/(\d+)\s*v\s*(\d+)/i);
      if (!parsed) continue;

      const teamA = teamsByNumber.get(Number(parsed[1]));
      const teamB = teamsByNumber.get(Number(parsed[2]));
      if (!teamA || !teamB) continue;

      rows.push({
        matchType: teamA.player2 || teamB.player2 ? 'D' : 'S',
        event: data.tournamentInfo?.division || '',
        date: data.tournamentInfo?.date || '',
        playerA1: teamA.player1 || '', playerA1DuprId: teamA.player1DuprId || '', playerA1ExternalId: '',
        playerA2: teamA.player2 || '', playerA2DuprId: teamA.player2DuprId || '', playerA2ExternalId: '',
        playerB1: teamB.player1 || '', playerB1DuprId: teamB.player1DuprId || '', playerB1ExternalId: '',
        playerB2: teamB.player2 || '', playerB2DuprId: teamB.player2DuprId || '', playerB2ExternalId: '',
        teamAGame1: teamA[`rd${round}`] ?? '', teamBGame1: teamB[`rd${round}`] ?? '',
        teamAGame2: '', teamBGame2: '', teamAGame3: '', teamBGame3: '',
        teamAGame4: '', teamBGame4: '', teamAGame5: '', teamBGame5: '',
        location: 'iPickle Whittier Narrows', scoreType: 'SIDEOUT',
      });
    }
  });

  return rows;
}

function sanitizeForFilename(value) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function isIntegerValue(v) {
  return v !== '' && v !== null && v !== undefined && /^-?\d+$/.test(String(v).trim());
}

// Enforces the DUPR bulk-upload CSV schema: required fields, matchType/scoreType enums,
// integer game scores, ISO date, and doubles-only requirements for the second player slot.
function validateRows(rows) {
  const errors = [];
  if (rows.length === 0) {
    errors.push('No matches found to export — check the schedule table matchups.');
    return errors;
  }

  rows.forEach((row, idx) => {
    const label = `Row ${idx + 1} (${row.playerA1 || '?'}${row.playerA2 ? '/' + row.playerA2 : ''} vs ${row.playerB1 || '?'}${row.playerB2 ? '/' + row.playerB2 : ''})`;

    if (!['S', 'D'].includes(row.matchType)) {
      errors.push(`${label}: matchType must be "S" or "D" (got "${row.matchType}")`);
    }
    if (!String(row.event || '').trim()) errors.push(`${label}: event is required`);
    if (!String(row.date || '').trim()) {
      errors.push(`${label}: date is required`);
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(row.date).trim())) {
      errors.push(`${label}: date should be YYYY-MM-DD (got "${row.date}")`);
    }

    if (!String(row.playerA1 || '').trim()) errors.push(`${label}: playerA1 is required`);
    if (!String(row.playerA1DuprId || '').trim()) errors.push(`${label}: playerA1DuprId is required`);
    if (!String(row.playerB1 || '').trim()) errors.push(`${label}: playerB1 is required`);
    if (!String(row.playerB1DuprId || '').trim()) errors.push(`${label}: playerB1DuprId is required`);

    if (row.matchType === 'D') {
      if (!String(row.playerA2 || '').trim()) errors.push(`${label}: playerA2 is required for doubles`);
      if (!String(row.playerA2DuprId || '').trim()) errors.push(`${label}: playerA2DuprId is required for doubles`);
      if (!String(row.playerB2 || '').trim()) errors.push(`${label}: playerB2 is required for doubles`);
      if (!String(row.playerB2DuprId || '').trim()) errors.push(`${label}: playerB2DuprId is required for doubles`);
    }

    if (!isIntegerValue(row.teamAGame1)) errors.push(`${label}: teamAGame1 must be an integer (got "${row.teamAGame1}")`);
    if (!isIntegerValue(row.teamBGame1)) errors.push(`${label}: teamBGame1 must be an integer (got "${row.teamBGame1}")`);

    ['2', '3', '4', '5'].forEach((n) => {
      const a = row[`teamAGame${n}`];
      const b = row[`teamBGame${n}`];
      if (String(a || '').trim() && !isIntegerValue(a)) errors.push(`${label}: teamAGame${n} must be an integer if provided (got "${a}")`);
      if (String(b || '').trim() && !isIntegerValue(b)) errors.push(`${label}: teamBGame${n} must be an integer if provided (got "${b}")`);
    });

    if (!['SIDEOUT', 'RALLY'].includes(row.scoreType)) {
      errors.push(`${label}: scoreType must be "SIDEOUT" or "RALLY" (got "${row.scoreType}")`);
    }
  });

  return errors;
}

function downloadScoresCsv(data) {
  const rows = buildMatchRowsFromScan(data);
  const errors = validateRows(rows);
  if (errors.length > 0) return { success: false, errors };

  const lines = [CSV_HEADERS.join(',')];
  rows.forEach((row) => {
    lines.push(CSV_HEADERS.map((h) => csvEscape(row[h])).join(','));
  });

  const division = sanitizeForFilename(data.tournamentInfo?.division) || 'DIVISION';
  const date = sanitizeForFilename(data.tournamentInfo?.date) || 'DATE';

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${division}_${date}_DUPR_UPLOAD.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return { success: true };
}

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
  const [matching, setMatching] = useState(false);
  const [matchSuccessMessage, setMatchSuccessMessage] = useState('');
  const [matchIssue, setMatchIssue] = useState(null); // { type: 'missing', names: string[] }
  const [duplicateQueue, setDuplicateQueue] = useState([]); // [{ teamIndex, field, name, candidates }]
  const [pendingMissingNames, setPendingMissingNames] = useState([]);
  const [exportErrors, setExportErrors] = useState([]);

  const handleExportCsv = () => {
    const result = downloadScoresCsv(data);
    if (!result.success) setExportErrors(result.errors);
  };

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

  const teamTotal = (team) => {
    return ['rd1', 'rd2', 'rd3', 'rd4', 'rd5', 'rd6', 'rd7', 'rd8', 'rd9']
      .reduce((sum, rd) => sum + (Number(team[rd]) || 0), 0);
  };

  const handleTournamentInfoChange = (field, value) => {
    setData({ ...data, tournamentInfo: { ...data.tournamentInfo, [field]: value } });
  };

  const handleScheduleChange = (scheduleIndex, field, value) => {
    const updatedSchedule = [...data.schedule];
    updatedSchedule[scheduleIndex][field] = value;
    setData({ ...data, schedule: updatedSchedule });
  };

  const handleFindDuprIds = async () => {
    if (!data?.teams) return;
    setMatching(true);
    setMatchSuccessMessage('');
    setMatchIssue(null);
    setDuplicateQueue([]);

    try {
      const res = await fetch(`${BACKEND_URL}/api/players`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const { players } = await res.json();

      const registryByName = new Map();
      players.forEach((p) => {
        const key = p.name.trim().toLowerCase().replace(/\*$/, '').trim();
        if (!registryByName.has(key)) registryByName.set(key, []);
        registryByName.get(key).push(p);
      });

      const missingNames = new Set();
      const duplicates = [];
      const updatedTeams = data.teams.map((team) => ({ ...team }));

      updatedTeams.forEach((team, teamIndex) => {
        ['player1', 'player2'].forEach((field) => {
          const name = team[field];
          if (!name) return;
          const key = name.trim().toLowerCase();
          const matches = registryByName.get(key);

          if (!matches || matches.length === 0) {
            missingNames.add(name.trim());
          } else if (matches.length > 1) {
            duplicates.push({ teamIndex, field, name: name.trim(), candidates: matches });
          } else {
            team[`${field}DuprId`] = matches[0].duprId;
          }
        });
      });

      setData({ ...data, teams: updatedTeams });
      setPendingMissingNames([...missingNames]);
      setDuplicateQueue(duplicates);

      if (duplicates.length === 0) {
        if (missingNames.size > 0) {
          setMatchIssue({ type: 'missing', names: [...missingNames] });
        } else {
          setMatchSuccessMessage('All DUPR IDs matched and populated successfully!');
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setMatching(false);
    }
  };

  const resolveDuplicate = (candidate) => {
    const current = duplicateQueue[0];
    if (!current) return;

    const updatedTeams = [...data.teams];
    updatedTeams[current.teamIndex] = {
      ...updatedTeams[current.teamIndex],
      [`${current.field}DuprId`]: candidate ? candidate.duprId : '',
    };
    setData({ ...data, teams: updatedTeams });

    const rest = duplicateQueue.slice(1);
    setDuplicateQueue(rest);

    if (rest.length === 0) {
      if (pendingMissingNames.length > 0) {
        setMatchIssue({ type: 'missing', names: pendingMissingNames });
      } else {
        setMatchSuccessMessage('All DUPR IDs matched and populated successfully!');
      }
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between space-x-4 border-b border-stone-200 pb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-800/10 border border-green-800/20 rounded-2xl text-green-800">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">iPickle Score Scanner</h1>
            <p className="text-stone-500 text-sm">Upload paper score sheets to parse match data directly into editable digital tables.</p>
          </div>
        </div>
        <RefreshPlayerListButton />
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
          <div>
            <span className="text-stone-400 block text-xs uppercase tracking-wider font-semibold mb-0.5">Division</span>
            <input
              type="text"
              value={data.tournamentInfo.division || ''}
              onChange={(e) => handleTournamentInfoChange('division', e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-stone-200 focus:border-green-600 rounded-none text-stone-900 text-base font-bold outline-none transition px-0 py-0.5"
            />
          </div>
          <div>
            <span className="text-stone-400 block text-xs uppercase tracking-wider font-semibold mb-0.5">Date</span>
            <input
              type="text"
              value={data.tournamentInfo.date || ''}
              onChange={(e) => handleTournamentInfoChange('date', e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-stone-200 focus:border-green-600 rounded-none text-stone-900 text-base font-bold outline-none transition px-0 py-0.5"
            />
          </div>
          <div>
            <span className="text-stone-400 block text-xs uppercase tracking-wider font-semibold mb-0.5">Scorekeeper</span>
            <input
              type="text"
              value={data.tournamentInfo.scorekeeper || ''}
              onChange={(e) => handleTournamentInfoChange('scorekeeper', e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-stone-200 focus:border-green-600 rounded-none text-stone-900 text-base font-bold outline-none transition px-0 py-0.5"
            />
          </div>
        </div>
      )}

      {data?.teams && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5 text-green-800">
            <Table className="w-5 h-5" /> Standings & Player Scores <span className="text-xs text-stone-400 font-normal">(Click any cell to edit)</span>
          </h2>
          <div className="border border-stone-200 rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-stone-700 border-collapse">
              <thead className="bg-stone-50 text-stone-400 uppercase text-xs tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3 w-16 text-center whitespace-nowrap">Team #</th>
                  <th className="p-3 whitespace-nowrap">Player 1</th>
                  <th className="p-3 whitespace-nowrap text-teal-700">Player 1 DUPR ID</th>
                  <th className="p-3 whitespace-nowrap">Player 2</th>
                  <th className="p-3 whitespace-nowrap text-teal-700">Player 2 DUPR ID</th>
                  {['rd1', 'rd2', 'rd3', 'rd4', 'rd5', 'rd6', 'rd7', 'rd8', 'rd9'].map((rd, idx) => (
                    <th key={rd} className="p-3 text-center whitespace-nowrap">Rd {idx + 1}</th>
                  ))}
                  <th className="p-3 text-center whitespace-nowrap text-green-800">Wins</th>
                  <th className="p-3 text-center whitespace-nowrap text-red-700">Losses</th>
                  <th className="p-3 text-center whitespace-nowrap text-stone-900">Total</th>
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
                        className="w-36 bg-stone-50 border border-stone-200 focus:border-green-600 rounded px-2.5 py-1 text-stone-900 font-semibold outline-none transition"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={t.player1DuprId || ''}
                        onChange={(e) => handleTeamChange(teamIdx, 'player1DuprId', e.target.value)}
                        className="w-28 bg-teal-50/50 border border-teal-200 focus:border-teal-600 rounded px-2.5 py-1 text-teal-800 font-semibold outline-none transition"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={t.player2 || ''}
                        onChange={(e) => handleTeamChange(teamIdx, 'player2', e.target.value)}
                        className="w-36 bg-stone-50 border border-stone-200 focus:border-green-600 rounded px-2.5 py-1 text-stone-900 font-semibold outline-none transition"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={t.player2DuprId || ''}
                        onChange={(e) => handleTeamChange(teamIdx, 'player2DuprId', e.target.value)}
                        className="w-28 bg-teal-50/50 border border-teal-200 focus:border-teal-600 rounded px-2.5 py-1 text-teal-800 font-semibold outline-none transition"
                      />
                    </td>
                    {['rd1', 'rd2', 'rd3', 'rd4', 'rd5', 'rd6', 'rd7', 'rd8', 'rd9'].map((rd) => (
                      <td key={rd} className="p-2 text-center">
                        <input
                          type="text"
                          value={t[rd] !== undefined && t[rd] !== null ? t[rd] : ''}
                          onChange={(e) => handleTeamChange(teamIdx, rd, e.target.value)}
                          className="w-14 text-center bg-stone-50 border border-stone-200 focus:border-green-600 rounded py-1 text-stone-700 outline-none transition"
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={t.wins !== undefined && t.wins !== null ? t.wins : ''}
                        onChange={(e) => handleTeamChange(teamIdx, 'wins', e.target.value)}
                        className="w-14 text-center bg-stone-50 border border-stone-200 focus:border-green-600 rounded py-1 text-green-800 font-bold outline-none transition"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={t.losses !== undefined && t.losses !== null ? t.losses : ''}
                        onChange={(e) => handleTeamChange(teamIdx, 'losses', e.target.value)}
                        className="w-14 text-center bg-stone-50 border border-stone-200 focus:border-red-500 rounded py-1 text-red-700 font-bold outline-none transition"
                      />
                    </td>
                    <td className="p-2 text-center font-bold text-stone-900 whitespace-nowrap">{teamTotal(t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {data?.schedule && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5 text-teal-700">
            <Table className="w-5 h-5" /> Court Schedule & Matchups <span className="text-xs text-stone-400 font-normal">(Click any cell to edit)</span>
          </h2>
          <div className="border border-stone-200 rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-stone-700 border-collapse">
              <thead className="bg-stone-50 text-stone-400 uppercase text-xs tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3 w-28 whitespace-nowrap">Court</th>
                  {['round1', 'round2', 'round3', 'round4', 'round5', 'round6', 'round7', 'round8', 'round9'].map((rd, idx) => (
                    <th key={rd} className="p-3 text-center whitespace-nowrap">Round {idx + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.schedule.map((s, schedIdx) => (
                  <tr key={schedIdx} className="hover:bg-stone-50 transition">
                    <td className="p-2 font-semibold text-teal-700 whitespace-nowrap">Court {s.courtNumber}</td>
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
        </div>
      )}

      {data && (
        <div className="pt-4 space-y-4">
          {submitted && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold text-lg">Scores successfully verified and submitted to DUPR!</span>
            </div>
          )}
          {matchSuccessMessage && (
            <div className="p-5 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-3 text-teal-700">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold text-lg">{matchSuccessMessage}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleFindDuprIds}
              disabled={matching}
              className="flex-1 flex items-center justify-center space-x-2 bg-white border-2 border-teal-700 hover:bg-teal-50 text-teal-700 font-bold py-4 rounded-2xl transition cursor-pointer text-base tracking-wide disabled:opacity-50"
            >
              {matching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              <span>{matching ? 'Matching Players...' : 'Find DUPR IDs'}</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="flex-1 flex items-center justify-center space-x-2 bg-teal-500 hover:bg-teal-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-200 transition cursor-pointer text-base tracking-wide"
            >
              <Download className="w-5 h-5" />
              <span>Export to CSV</span>
            </button>
            {!submitted && (
              <button
                onClick={() => setSubmitted(true)}
                className="flex-1 bg-teal-700 hover:bg-teal-600 text-white font-bold py-4 rounded-2xl shadow-xl transition cursor-pointer text-base tracking-wide"
              >
                🚀 Confirm & Send Scores to DUPR
              </button>
            )}
          </div>
        </div>
      )}

      {duplicateQueue.length > 0 && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-amber-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-stone-900">Which "{duplicateQueue[0].name}"?</h3>
              </div>
              <button onClick={() => resolveDuplicate(null)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-stone-500">
              Multiple registry entries match this name ({duplicateQueue.length} name{duplicateQueue.length > 1 ? 's' : ''} left to resolve). Pick the correct player:
            </p>
            <ul className="max-h-80 overflow-y-auto space-y-2">
              {duplicateQueue[0].candidates.map((c) => (
                <li key={c.duprId}>
                  <button
                    onClick={() => resolveDuplicate(c)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-stone-200 hover:border-teal-500 hover:bg-teal-50/50 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{c.duprId || 'No DUPR ID'}</span>
                      <span className="text-xs text-stone-400">{c.gender}{c.gender && c.age ? ' • ' : ''}{c.age ? `${c.age}yo` : ''}</span>
                    </div>
                    <div className="text-sm text-stone-500 mt-0.5">{c.location || 'Location unknown'}</div>
                    <div className="flex gap-4 mt-1.5 text-xs font-semibold">
                      <span className="text-teal-700">Doubles: {c.doublesRating || 'NR'}</span>
                      <span className="text-green-700">Singles: {c.singlesRating || 'NR'}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => resolveDuplicate(null)}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold py-2.5 rounded-xl transition cursor-pointer"
            >
              Skip (leave blank)
            </button>
          </div>
        </div>
      )}

      {matchIssue && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-amber-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-stone-900">No name found</h3>
              </div>
              <button onClick={() => setMatchIssue(null)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-stone-500">
              These names weren't found in the DUPR player registry, so their DUPR ID was left blank:
            </p>
            <ul className="max-h-48 overflow-y-auto space-y-1.5">
              {matchIssue.names.map((name) => (
                <li key={name} className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-700">
                  {name}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setMatchIssue(null)}
              className="w-full bg-stone-800 hover:bg-stone-700 text-white font-semibold py-2.5 rounded-xl transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {exportErrors.length > 0 && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-stone-900">Can't export yet</h3>
              </div>
              <button onClick={() => setExportErrors([])} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-stone-500">
              The DUPR upload schema requires these to be fixed before exporting:
            </p>
            <ul className="max-h-80 overflow-y-auto space-y-1.5">
              {exportErrors.map((err, i) => (
                <li key={i} className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-700">
                  {err}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setExportErrors([])}
              className="w-full bg-stone-800 hover:bg-stone-700 text-white font-semibold py-2.5 rounded-xl transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScoreUploader() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');

  return unlocked ? <ScannerTool /> : <PasswordGate onUnlock={() => setUnlocked(true)} />;
}
