// begin.js
// Loads topics/<topic>.json, initializes sessionStorage answers,
// and redirects to error.html on fatal problems.
// UI text remains Italian; variables/functions use English names.

document.addEventListener('DOMContentLoaded', () => {
  const PARAM_KEY = 'topic';
  const STORAGE_PREFIX = 'quiz_answers::';
  const TOPICS_PATH = 'topics/';
  const ERROR_PAGE = 'error.html';
  const MAX_ERROR_LENGTH = 200; // truncate error text for URL safety

  const homeButton = document.getElementById('home-button');
  const topicTitleEl = document.getElementById('topic-title');
  const introTextEl = document.getElementById('intro-text');
  const questionsCountEl = document.getElementById('questions-count');
  const startButton = document.getElementById('start-button');

  if (homeButton) {
    homeButton.addEventListener('click', () => { window.location.href = 'index.html'; });
  }

  // Ensure required UI elements exist
  if (!topicTitleEl || !introTextEl || !questionsCountEl || !startButton) {
    console.error('Required DOM elements missing in begin.html');
    redirectToError('Configurazione pagina non valida (elementi mancanti).');
    return;
  }

  // set footer year dynamically
  (function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  })();

  (async function main() {
    const rawTopic = getQueryParam(PARAM_KEY);
    if (!rawTopic) {
      redirectToError('Parametro "topic" mancante.');
      return;
    }

    const topicName = sanitizeTopicName(rawTopic);
    if (!topicName) {
      redirectToError('Nome quiz non valido.');
      return;
    }

    const humanTopic = humanizeTopicName(topicName);
    document.title = `Quiz — ${humanTopic}`;
    topicTitleEl.textContent = `Quiz: ${humanTopic}`;

    try {
      const topicJson = await fetchAndValidateTopic(topicName);

      // Support italian 'descrizione' or english 'description'
      const description = (topicJson.descrizione || topicJson.description || '').trim();
      introTextEl.textContent = description || 'Questo quiz ti aiuterà a capire il tuo grado di affinità con i partiti su questo argomento.';

      const questions = Array.isArray(topicJson.domande) ? topicJson.domande : [];
      questionsCountEl.textContent = `Domande: ${questions.length}`;

      initializeAnswers(topicName, questions.length);

      startButton.disabled = false;
      startButton.addEventListener('click', () => {
        window.location.href = `question.html?topic=${encodeURIComponent(topicName)}&q=0`;
      });
    } catch (err) {
      console.error('Error loading topic:', err);
      redirectToError(err && err.message ? err.message : 'Errore caricamento quiz');
    }
  })();

  // ---------- Helpers ----------

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function sanitizeTopicName(raw) {
    if (!raw) return null;
    const s = String(raw).trim();
    // Only allow letters, numbers, dash and underscore to avoid traversal or strange names
    return /^[a-zA-Z0-9_-]+$/.test(s) ? s : null;
  }

  function humanizeTopicName(name) {
    return String(name).replace(/[-_]+/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
  }

  async function fetchAndValidateTopic(name) {
    const path = `${TOPICS_PATH}${encodeURIComponent(name)}.json`;
    const resp = await fetch(path, { cache: 'no-store' });

    if (!resp.ok) {
      // If 404 or other non-OK, throw with meaningful message
      throw new Error(`Quiz non trovato (HTTP ${resp.status})`);
    }

    let json;
    try {
      json = await resp.json();
    } catch (e) {
      throw new Error('Quiz non valido (JSON malformato)');
    }

    if (!json || typeof json !== 'object' || !Array.isArray(json.domande)) {
      throw new Error('Quiz malformato o non valido (manca "domande").');
    }

    return json;
  }

  function initializeAnswers(topicName, questionCount) {
    const storageKey = STORAGE_PREFIX + topicName;
    sessionStorage.setItem(storageKey, JSON.stringify(createEmptyAnswers(questionCount)));
  }

  function createEmptyAnswers(n) {
    return new Array(n).fill(null);
  }

  function redirectToError(message) {
    const normalized = String(message || 'Errore sconosciuto').trim().replace(/\s+/g, ' ');
    const truncated = normalized.length > MAX_ERROR_LENGTH
      ? normalized.slice(0, MAX_ERROR_LENGTH - 3) + '...'
      : normalized;
    const url = `${ERROR_PAGE}?error=${encodeURIComponent(truncated)}`;
    setTimeout(() => { window.location.href = url; }, 50);
  }
});
