// results_manager.js
// Reads topic JSON and answers vector from sessionStorage and computes party affinities.
// Party positions are expected as [mean, std] for each question inside topic.domande[].partiti

document.addEventListener('DOMContentLoaded', () => {
  const PARAM_TOPIC = 'topic';
  const STORAGE_PREFIX = 'quiz_answers::';

  const homeButton = document.getElementById('home-button');
  const resultsList = document.getElementById('results-list');
  const debugJson = document.getElementById('debug-json');

  homeButton.addEventListener('click', () => location.href = 'index.html');

  const topicName = new URLSearchParams(window.location.search).get(PARAM_TOPIC);
  if (!topicName) {
    resultsList.innerHTML = '<p>Topic mancante. Torna alla home.</p>';
    return;
  }

  const storageKey = STORAGE_PREFIX + topicName;
  const answers = safeParse(sessionStorage.getItem(storageKey));
  if (!Array.isArray(answers)) {
    resultsList.innerHTML = '<p>Nessuna risposta trovata per questo quiz.</p>';
    return;
  }

  fetch(`topics/${encodeURIComponent(topicName)}.json`, { cache: 'no-store' })
    .then(resp => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp.json();
    })
    .then(topicJson => {
      const questions = Array.isArray(topicJson.domande) ? topicJson.domande : [];
      // Compute affinities
      const partyScores = {}; // party -> sum of match weights
      let answeredCount = 0;

      for (let qi = 0; qi < questions.length; qi++) {
        const userAnswer = answers[qi]; // null | -1 | 0..4
        if (userAnswer === null || userAnswer === -1) continue;
        answeredCount++;

        const question = questions[qi];
        const partiti = question.partiti || {}; // mapping party -> [mean, std] or possibly precomputed vector

        // For each party compute truncated gaussian vector t[0..4] from [mean,std]
        for (const partyName of Object.keys(partiti)) {
          // ensure initialization
          if (!(partyName in partyScores)) partyScores[partyName] = 0;

          const partyValue = partiti[partyName];
          const t = gaussianToTruncatedVector(partyValue);

          // defensive: if t is invalid, skip
          if (!Array.isArray(t) || t.length !== 5) continue;

          // add match weight at user's selected index
          const weight = t[userAnswer] || 0;
          partyScores[partyName] += weight;
        }
      }

      // Convert to percentage affinity: (sum weights / answeredCount) * 100
      const results = Object.keys(partyScores).map(p => {
        const sum = partyScores[p];
        const pct = answeredCount > 0 ? (sum / answeredCount) * 100 : 0;
        return { party: p, score: sum, percent: Math.round(pct * 10) / 10 };
      });

      // sort descending by percent
      results.sort((a,b) => b.percent - a.percent);

      // Render table
      if (results.length === 0) {
        resultsList.innerHTML = '<p>Nessun partito trovato nel topic.</p>';
      } else {
        const table = document.createElement('table');
        table.className = 'results-table';
        table.innerHTML = `<thead><tr><th>Partito</th><th>Punteggio</th><th>Affinità (%)</th></tr></thead>`;
        const tbody = document.createElement('tbody');
        for (const r of results) {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${escapeHtml(r.party)}</td><td>${(Math.round(r.score*10)/10).toFixed(1)}</td><td>${r.percent.toFixed(1)}%</td>`;
          tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        resultsList.innerHTML = '';
        resultsList.appendChild(table);
      }

      // Optional debug (hidden by default)
      if (debugJson) {
        debugJson.textContent = JSON.stringify({ topic: topicName, answeredCount, results, rawAnswers: answers }, null, 2);
      }
    })
    .catch(err => {
      console.error(err);
      resultsList.innerHTML = `<p>Errore nel caricamento del topic: ${escapeHtml(err.message)}</p>`;
    });

  // ---------- helper functions ----------
  function gaussianToTruncatedVector(partyValue) {
    // partyValue expected: [mean, std] OR an already-provided vector [t0..t4].
    if (Array.isArray(partyValue) && partyValue.length === 5 && partyValue.every(v => typeof v === 'number')) {
      // Already a vector of 5 numbers -> assume it's already truncated weights
      return partyValue.map(v => Math.max(0, Math.min(1, Math.floor(v * 10) / 10)));
    }

    if (!Array.isArray(partyValue) || (partyValue.length < 1)) return [0,0,0,0,0];

    const mu = Number(partyValue[0]);
    const sigma = partyValue.length >= 2 ? Number(partyValue[1]) : 0;

    // If sigma <= 0 treat as dirac centered at nearest integer of mu
    if (!isFinite(mu)) return [0,0,0,0,0];
    if (!isFinite(sigma) || sigma <= 0) {
      const idx = Math.round(Math.max(0, Math.min(4, mu)));
      const vec = [0,0,0,0,0];
      vec[idx] = 1;
      return vec;
    }

    // Evaluate gaussian pdf at x = 0..4
    const values = [];
    for (let x = 0; x <= 4; x++) {
      const g = (1 / (sigma * Math.sqrt(2*Math.PI))) * Math.exp(-((x - mu)*(x - mu)) / (2 * sigma * sigma));
      values.push(g);
    }
    // Rescale so max becomes 1
    const maxv = Math.max(...values);
    if (maxv <= 0) return [0,0,0,0,0];
    const rescaled = values.map(v => v / maxv);
    // Truncate to 1 decimal (floor)
    const truncated = rescaled.map(r => Math.floor(r * 10) / 10);
    return truncated;
  }

  function safeParse(raw) {
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  }
});
