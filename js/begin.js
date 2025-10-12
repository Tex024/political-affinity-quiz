// begin.js
// Loads topic file, initializes answers vector in sessionStorage and navigates to question.html when started.
// All functions/variables in English; UI text in Italian.

document.addEventListener('DOMContentLoaded', () => {
  const PARAM_KEY = 'topic';
  const STORAGE_PREFIX = 'quiz_answers::';

  const homeButton = document.getElementById('home-button');
  const topicTitleEl = document.getElementById('topic-title');
  const introTextEl = document.getElementById('intro-text');
  const questionsCountEl = document.getElementById('questions-count');
  const startButton = document.getElementById('start-button');

  homeButton.addEventListener('click', () => location.href = 'index.html');

  let topicName = getQueryParam(PARAM_KEY);
  if (!topicName) {
    // If topic not supplied, show a generic intro and instruct to open from home.
    topicTitleEl.textContent = 'Quiz di Affinità Politica';
    introTextEl.textContent = 'Apri questa pagina dalla lista dei quiz (home).';
    startButton.disabled = true;
    return;
  }

  const humanTopic = humanizeTopicName(topicName);
  document.title = `Quiz — ${humanTopic}`;
  topicTitleEl.textContent = `Quiz: ${humanTopic}`;

  // Load topic file to read number of questions and optional description
  fetchTopicFile(topicName)
    .then(topicJson => {
      const description = topicJson.descrizione || topicJson.description || '';
      if (description) {
        introTextEl.textContent = description;
      } else {
        introTextEl.textContent = 'Questo quiz ti aiuterà a capire il tuo grado di affinità con i partiti su questo topic.';
      }

      const questions = Array.isArray(topicJson.domande) ? topicJson.domande : [];
      questionsCountEl.textContent = `Domande: ${questions.length}`;

      // Initialize or resume answers in sessionStorage
      const storageKey = STORAGE_PREFIX + topicName;
      const stored = safeParse(sessionStorage.getItem(storageKey));
      if (Array.isArray(stored) && stored.length === questions.length) {
        const resume = confirm('Trovate risposte salvate per questo quiz. Vuoi riprendere da dove avevi lasciato? (OK = Riprendi)');
        if (!resume) {
          const empty = createEmptyAnswers(questions.length);
          sessionStorage.setItem(storageKey, JSON.stringify(empty));
        }
      } else {
        const empty = createEmptyAnswers(questions.length);
        sessionStorage.setItem(storageKey, JSON.stringify(empty));
      }

      // Start button navigates to question.html?q=0
      startButton.addEventListener('click', () => {
        location.href = `question.html?topic=${encodeURIComponent(topicName)}&q=0`;
      });
    })
    .catch(err => {
      console.error(err);
      introTextEl.textContent = 'Errore caricamento topic. Torna alla home.';
      startButton.disabled = true;
    });

  // ---------- helpers ----------
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  function humanizeTopicName(name) {
    return String(name).replace(/[-_]+/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
  }
  function fetchTopicFile(name) {
    return fetch(`topics/${encodeURIComponent(name)}.json`, { cache: 'no-store' })
      .then(resp => {
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return resp.json();
      });
  }
  function createEmptyAnswers(n) {
    // null = unanswered; -1 = Non Interessato; 0..4 numerical answers
    return new Array(n).fill(null);
  }
  function safeParse(raw) {
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
});
