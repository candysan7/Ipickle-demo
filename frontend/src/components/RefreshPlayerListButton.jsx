import React, { useEffect, useRef } from 'react';
import { Bookmark } from 'lucide-react';

const CLUB_ID = '7845747259'; // iPickle Club

// Runs from the user's own logged-in dashboard.dupr.com tab, so it reuses their
// session cookie (`dupr_access_token`) instead of needing a stored API token.
// It paginates the club members endpoint (25/page max) and POSTs the results to
// this app's backend, which overwrites data/iPickle_Club_Members_Master.csv.
function buildBookmarkletHref(backendUrl) {
  const src = `
    (function () {
      function getCookie(name) {
        var m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
        return m ? decodeURIComponent(m[2]) : null;
      }
      var token = getCookie('dupr_access_token');
      if (!token) { alert('iPickle refresh: log into dashboard.dupr.com in this tab first.'); return; }

      var headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
      function fetchPage(offset) {
        return fetch('https://api.dupr.gg/club/${CLUB_ID}/members/v1.0/all', {
          method: 'POST', headers: headers,
          body: JSON.stringify({ exclude: [], limit: 25, filter: { lat: 34.0522342, lng: -118.2436849 }, offset: offset }),
        }).then(function (r) { return r.json(); }).then(function (j) { return j.result; });
      }

      fetchPage(0).then(function (first) {
        var total = first.total;
        var hits = first.hits.slice();
        var offsets = [];
        for (var o = 25; o < total; o += 25) offsets.push(o);
        var idx = 0;
        function worker() {
          if (idx >= offsets.length) return Promise.resolve();
          var myOffset = offsets[idx++];
          return fetchPage(myOffset).then(function (pg) { hits = hits.concat(pg.hits); return worker(); });
        }
        var workers = [];
        for (var i = 0; i < 8; i++) workers.push(worker());
        return Promise.all(workers).then(function () { return { total: total, hits: hits }; });
      }).then(function (res) {
        return fetch('${backendUrl}/api/players/refresh-from-browser', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ members: res.hits }),
        }).then(function (r) { return r.json(); }).then(function (j) {
          alert('iPickle: refreshed ' + (j.count || res.hits.length) + ' of ' + res.total + ' members.');
        });
      }).catch(function (e) {
        alert('iPickle refresh failed: ' + e.message);
      });
    })();
  `.replace(/\s+/g, ' ').trim();

  return `javascript:${src}`;
}

export default function RefreshPlayerListButton() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const linkRef = useRef(null);

  useEffect(() => {
    // Set imperatively via the DOM, not JSX `href`, because React strips
    // javascript: URLs passed through props as an XSS guard.
    if (linkRef.current) {
      linkRef.current.setAttribute('href', buildBookmarkletHref(BACKEND_URL));
    }
  }, [BACKEND_URL]);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <a
        ref={linkRef}
        onClick={(e) => e.preventDefault()}
        draggable
        className="flex items-center gap-2 bg-white border-2 border-green-700 hover:bg-green-50 text-green-800 font-bold py-2.5 px-5 rounded-xl transition cursor-grab select-none"
        title="Drag this to your bookmarks bar"
      >
        <Bookmark className="w-4 h-4" />
        <span>Refresh Master List</span>
      </a>
      <p className="text-xs text-stone-400 max-w-xs text-right">
        Drag to your bookmarks bar once. Then, while logged into a DUPR page, click it to pull the
        latest club roster into /data — no API token needed.
      </p>
    </div>
  );
}

