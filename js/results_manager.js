// results_manager.js
// Professional results page manager.
// - Reads topic JSON and answers vector from sessionStorage
// - Computes party affinities (per-question distributions expected in topic.domande[].partiti)
// - Renders: top party (large), next two (smaller), then full table
// - Fatal errors redirect to error.html?error=...

document.addEventListener('DOMContentLoaded', () => {
  const PARAM_TOPIC = 'topic';
  const STORAGE_PREFIX = 'quiz_answers::';
  const TOPICS_PATH = 'topics/';
  const ERROR_PAGE = 'error.html';
  const ICONS_PATH = 'icons/';
  const FALLBACK_ICON = 'favicons/favicon-32x32.png';
  const MAX_ERROR_LENGTH = 200;

  // DOM
  const homeButton = document.getElementById('home-button');
  const resultsList = document.getElementById('results-list');
  const debugJson = document.getElementById('debug-json');

  if (!resultsList) {
    console.error('Missing results container element.');
    redirectToError('Configurazione pagina non valida (elemento risultati mancante).');
    return;
  }

  if (homeButton) homeButton.addEventListener('click', () => { window.location.href = 'index.html'; });

  // Get topic param and validate
  const rawTopic = new URLSearchParams(window.location.search).get(PARAM_TOPIC);
  if (!rawTopic) {
    renderMessage('Parametro "topic" mancante. Torna alla home.');
    return;
  }
  const topicName = sanitizeTopicName(rawTopic);
  if (!topicName) {
    redirectToError('Nome topic non valido.');
    return;
  }

  const storageKey = STORAGE_PREFIX + topicName;
  const answers = safeParse(sessionStorage.getItem(storageKey));
  if (!Array.isArray(answers)) {
    renderMessage('Nessuna risposta trovata per questo quiz. Assicurati di aver completato il quiz.');
    return;
  }

  // Load topic file and compute results
  (async function main() {
    try {
      const topicJson = await fetchAndValidateTopic(topicName);
      const questions = Array.isArray(topicJson.domande) ? topicJson.domande : [];
      const topicPartyDescriptions = (topicJson.partiti && typeof topicJson.partiti === 'object')
        ? topicJson.partiti
        : {};

      // Compute party scores
      const partyScores = {}; // party -> sum of match weights
      const partiesSet = new Set(); // to collect all parties mentioned
      let answeredCount = 0;

      for (let qi = 0; qi < questions.length; qi++) {
        const userAnswer = answers[qi]; // null | -1 | 0..4
        if (userAnswer === null || userAnswer === -1) continue;
        answeredCount++;

        const question = questions[qi] || {};
        const questionPartiti = question.partiti || {};

        // add parties from this question to set
        Object.keys(questionPartiti).forEach(p => partiesSet.add(p));

        for (const partyName of Object.keys(questionPartiti)) {
          if (!(partyName in partyScores)) partyScores[partyName] = 0;
          const partyValue = questionPartiti[partyName];
          const t = gaussianToTruncatedVector(partyValue);
          if (!Array.isArray(t) || t.length !== 5) continue;
          const weight = Number(t[userAnswer]) || 0;
          partyScores[partyName] += weight;
        }
      }
      
      // If all questions skipped
      if (answeredCount === 0) {
        resultsList.innerHTML = '<p>Hai saltato tutte le domande. Non ci sono risultati da mostrare.</p>';
        return;
      }

      // Ensure parties mentioned at topic level are included (even if no question provided party data)
      Object.keys(topicPartyDescriptions).forEach(p => partiesSet.add(p));
      for (const p of partiesSet) {
        if (!(p in partyScores)) partyScores[p] = 0;
      }

      // Build results array
      const results = Array.from(Object.keys(partyScores)).map(p => {
        const sum = Number(partyScores[p]) || 0;
        const percent = answeredCount > 0 ? (sum / answeredCount) * 100 : 0;
        return { party: p, score: sum, percent: Math.round(percent * 10) / 10 };
      });

      // Sort descending by percent
      results.sort((a, b) => b.percent - a.percent);

      // Render UI
      resultsList.innerHTML = '';
      if (results.length === 0) {
        renderMessage('Nessun partito trovato nel quiz.');
        return;
      }

      // Top 1 big card
      const top = results[0];
      const topDesc = topicPartyDescriptions[top.party] || 'Nessuna descrizione disponibile.';
      const topCard = renderTopCard(top, topDesc);
      resultsList.appendChild(topCard);

      // Next two
      const nextTwo = results.slice(1, 3);
      if (nextTwo.length > 0) {
        const row = createElement('div', { style: 'display:flex;gap:12px;margin-top:14px;flex-wrap:wrap;' });
        nextTwo.forEach(r => {
          const desc = topicPartyDescriptions[r.party] || 'Nessuna descrizione disponibile.';
          row.appendChild(renderSmallCard(r, desc));
        });
        resultsList.appendChild(row);
      }

      // Full table (all parties)
      resultsList.appendChild(createElement('hr', { style: 'margin:18px 0;border:none;border-top:1px solid #eee;' }));
      const tableWrapper = createElement('div', { style: 'overflow:auto' });
      tableWrapper.appendChild(renderFullTable(results, topicPartyDescriptions));
      resultsList.appendChild(tableWrapper);

      // Debug output (optional)
      if (debugJson) {
        debugJson.textContent = JSON.stringify({ topic: topicName, answeredCount, results, rawAnswers: answers }, null, 2);
        debugJson.parentElement && (debugJson.parentElement.style.display = 'none'); // keep hidden by default
      }
    } catch (err) {
      console.error('Error computing results:', err);
      redirectToError(err && err.message ? err.message : 'Errore elaborazione risultati');
    }
  })();

  // ---------- Rendering helpers ----------

  function renderTopCard(resultObj, partyDescription) {
    const card = createElement('section', {
      style: 'display:flex;gap:16px;align-items:center;padding:18px;border-radius:10px;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,0.06);'
    });

    const img = createPartyIcon(resultObj.party, 96);
    const content = createElement('div', { style: 'flex:1' });
    const titleRow = createElement('div', { style: 'display:flex;align-items:center;gap:12px;justify-content:space-between' },
      createElement('h2', { style: 'margin:0;font-size:1.4rem;color:#2d3e50' }, escapeHtml(resultObj.party)),
      createElement('div', { style: 'font-size:1.6rem;font-weight:700;color:#2d3e50' }, `${resultObj.percent.toFixed(1)}%`)
    );

    const desc = createElement('p', { style: 'margin:8px 0;color:#555' }, escapeHtml(partyDescription));

    content.appendChild(titleRow);
    content.appendChild(desc);

    card.appendChild(img);
    card.appendChild(content);
    return card;
  }

  function renderSmallCard(resultObj, partyDescription) {
    const card = createElement('article', {
      style: 'flex:1 1 220px;display:flex;gap:12px;align-items:center;padding:12px;border-radius:8px;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,0.04);'
    });
    const img = createPartyIcon(resultObj.party, 56);
    const content = createElement('div', { style: 'flex:1' },
      createElement('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px' },
        createElement('strong', { style: 'font-size:1rem;color:#2d3e50' }, escapeHtml(resultObj.party)),
        createElement('span', { style: 'font-weight:700' }, `${resultObj.percent.toFixed(1)}%`)
      ),
      createElement('p', { style: 'margin:6px 0;color:#666;font-size:0.95rem' }, escapeHtml(shorten(partyDescription, 180)))
    );

    card.appendChild(img);
    card.appendChild(content);
    return card;
  }

  function renderFullTable(resultsArr, partyDescriptions) {
    const table = createElement('table', { className: 'results-table', style: 'width:100%;' });
    const thead = createElement('thead', {}, 
      createElement('tr', {},
        createElement('th', {}, '#'),
        createElement('th', {}, 'Partito'),
        createElement('th', {}, 'Affinità (%)'),
        createElement('th', {}, 'Posizione sul topic')
      )
    );
    table.appendChild(thead);

    const tbody = createElement('tbody', {});
    resultsArr.forEach((r, idx) => {
      const tr = createElement('tr', {},
        createElement('td', {}, String(idx + 1)),
        createElement('td', { style: 'display:flex;align-items:center;gap:10px;padding:10px' },
          createPartyIcon(r.party, 28, { style: 'flex:0 0 28px;height:28px' }),
          createElement('span', {}, escapeHtml(r.party))
        ),
        createElement('td', {}, `${r.percent.toFixed(1)}%`),
        createElement('td', { style: 'text-align:left;padding:10px' }, escapeHtml(partyDescriptions[r.party] || 'Nessuna descrizione disponibile.'))
      );
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
  }

  // ---------- Utilities ----------

  function createElement(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(k => {
        if (k === 'className') el.className = attrs[k];
        else if (k === 'style') el.setAttribute('style', attrs[k]);
        else el.setAttribute(k, attrs[k]);
      });
    }
    children.forEach(c => {
      if (c === null || c === undefined) return;
      if (typeof c === 'string') el.appendChild(document.createTextNode(c));
      else el.appendChild(c);
    });
    return el;
  }

  function createPartyIcon(partyName, size = 48, extraAttrs = {}) {
    const img = document.createElement('img');
    img.width = size;
    img.height = size;
    img.alt = `${partyName} logo`;
    img.style.borderRadius = '6px';
    img.style.objectFit = 'contain';
    // try slug-based filename
    const slug = slugify(partyName);
    img.src = `${ICONS_PATH}${slug}.png`;
    // fallback on error
    img.onerror = () => {
      img.onerror = null;
      img.src = FALLBACK_ICON;
    };
    // apply extra attrs
    if (extraAttrs) {
      Object.keys(extraAttrs).forEach(k => img.setAttribute(k, extraAttrs[k]));
    }
    return img;
  }

  function slugify(s) {
    return String(s || '')
      .normalize ? String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '') : String(s || '')
      ;
  }

  // Implement a simple slug (lowercase, spaces->-, remove non-alnum/-)
  // we could rely on normalize above; provide robust fallback
  function slugify(s) {
    let t = String(s || '').toLowerCase().trim();
    // remove diacritics if possible
    try { t = t.normalize('NFKD').replace(/[\u0300-\u036f]/g, ''); } catch (e) {}
    t = t.replace(/[\s\/\\]+/g, '-');
    t = t.replace(/[^a-z0-9-_]/g, '');
    return t;
  }

  function shorten(s, maxLen) {
    const str = String(s || '');
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 1) + '…';
  }

  // Gaussian -> truncated 5-vector (0..1)
  function gaussianToTruncatedVector(partyValue) {
    // If already 5-number vector: normalize (cap 0..1)
    if (Array.isArray(partyValue) && partyValue.length === 5 && partyValue.every(v => typeof v === 'number')) {
      return partyValue.map(v => Math.max(0, Math.min(1, v)));
    }

    if (!Array.isArray(partyValue) || partyValue.length < 1) return [0,0,0,0,0];

    const mu = Number(partyValue[0]);
    const sigma = partyValue.length >= 2 ? Number(partyValue[1]) : 0;

    if (!isFinite(mu)) return [0,0,0,0,0];

    // If sigma <= 0: dirac at nearest integer
    if (!isFinite(sigma) || sigma <= 0) {
      const idx = Math.round(Math.max(0, Math.min(4, mu)));
      const v = [0,0,0,0,0];
      v[idx] = 1;
      return v;
    }

    // Evaluate gaussian pdf at discrete points 0..4
    const values = [];
    for (let x = 0; x <= 4; x++) {
      const diff = x - mu;
      const g = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(- (diff*diff) / (2 * sigma * sigma));
      values.push(g);
    }
    const maxv = Math.max(...values);
    if (maxv <= 0) return [0,0,0,0,0];
    const rescaled = values.map(v => v / maxv);
    // Truncate to one decimal (floor) to keep consistent with other scripts
    return rescaled.map(r => Math.floor(r * 10) / 10);
  }

  function fetchAndValidateTopic(name) {
    const path = `${TOPICS_PATH}${encodeURIComponent(name)}.json`;
    return fetch(path, { cache: 'no-store' }).then(resp => {
      if (!resp.ok) throw new Error(`File topic non trovato (HTTP ${resp.status})`);
      return resp.json();
    }).then(json => {
      if (!json || typeof json !== 'object' || !Array.isArray(json.domande)) {
        throw new Error('File topic malformato o non valido (manca "domande").');
      }
      return json;
    });
  }

  // ---------- UI utilities ----------
  function renderMessage(msg) {
    resultsList.innerHTML = '';
    const box = createElement('div', { style: 'padding:18px;background:#fff;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.06);' },
      createElement('p', { style: 'margin:0;color:#555' }, escapeHtml(msg)),
      createElement('div', { style: 'margin-top:12px' },
        createElement('a', { href: 'index.html', style: 'display:inline-block;padding:10px 14px;background:#007bff;color:#fff;border-radius:8px;text-decoration:none' }, 'Torna alla Home')
      )
    );
    resultsList.appendChild(box);
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  }

  function safeParse(raw) {
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function sanitizeTopicName(raw) {
    if (!raw) return null;
    const s = String(raw).trim();
    return /^[a-zA-Z0-9_-]+$/.test(s) ? s : null;
  }

  function redirectToError(message) {
    const normalized = String(message || 'Errore sconosciuto').trim().replace(/\s+/g, ' ');
    const truncated = normalized.length > MAX_ERROR_LENGTH ? normalized.slice(0, MAX_ERROR_LENGTH - 3) + '...' : normalized;
    const url = `${ERROR_PAGE}?error=${encodeURIComponent(truncated)}`;
    setTimeout(() => { window.location.href = url; }, 50);
  }
});
