// question_manager.js
// Manages a single-question page. Reads ?topic=...&q=... and updates answers in sessionStorage.
// Answer encoding: null = unanswered, -1 = Non Interessato, 0..4 numeric.

document.addEventListener('DOMContentLoaded', () => {
  const PARAM_TOPIC = 'topic';
  const PARAM_Q = 'q';
  const STORAGE_PREFIX = 'quiz_answers::';
  const TOPICS_PATH = 'topics/';
  const ERROR_PAGE = 'error.html';
  const MAX_ERROR_LENGTH = 200;

  // UI elements (required)
  const homeButton = document.getElementById('home-button');
  const questionTextEl = document.getElementById('question-text');
  const answersContainer = document.getElementById('answers');
  const notInterestedButton = document.getElementById('not-interested-button');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');
  const progressBar = document.getElementById('progress-bar');

  // Optional details UI
  const toggleDetails = document.getElementById('toggle-details');
  const detailsBox = document.getElementById('details');
  const topicTitleEl = document.getElementById('topic-title');
  const descriptionEl = document.getElementById('description');
  const explAgree = document.getElementById('explanation-agree');
  const explNeutral = document.getElementById('explanation-neutral');
  const explDisagree = document.getElementById('explanation-disagree');

  // set footer year
  (function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  })();

  // Basic validation: required UI elements must be present
  if (!questionTextEl || !answersContainer || !notInterestedButton || !prevButton || !nextButton) {
    console.error('Required DOM elements missing on question page');
    redirectToError('Configurazione pagina non valida (elementi mancanti).');
    return;
  }

  // Wire home button if present
  if (homeButton) {
    homeButton.addEventListener('click', () => { window.location.href = 'index.html'; });
  }

  // Toggle details if UI exists — keep aria-expanded in sync with visibility
  if (toggleDetails && detailsBox) {
    toggleDetails.addEventListener('click', () => {
      const isHidden = detailsBox.hasAttribute('hidden');
      if (isHidden) {
        detailsBox.removeAttribute('hidden');
        toggleDetails.setAttribute('aria-expanded', 'true');
        toggleDetails.textContent = 'Nascondi dettagli';
      } else {
        detailsBox.setAttribute('hidden', '');
        toggleDetails.setAttribute('aria-expanded', 'false');
        toggleDetails.textContent = 'Mostra dettagli';
      }
    });
  }

  // Parse params
  const rawTopic = getQueryParam(PARAM_TOPIC);
  let qIndex = parseInt(getQueryParam(PARAM_Q) || '0', 10);
  if (!rawTopic) {
    redirectToError('Parametro "topic" mancante.');
    return;
  }

  const topicName = sanitizeTopicName(rawTopic);
  if (!topicName) {
    redirectToError('Nome quiz non valido.');
    return;
  }

  const storageKey = STORAGE_PREFIX + topicName;
  let topicJson = null;
  let questions = [];
  let answers = [];

  // Navigation handlers
  prevButton.addEventListener('click', () => {
    if (qIndex > 0) navigateTo(qIndex - 1);
  });

  nextButton.addEventListener('click', () => {
    if (qIndex < questions.length - 1) {
      navigateTo(qIndex + 1);
    } else {
      // Last question → results
      window.location.href = `results.html?topic=${encodeURIComponent(topicName)}`;
    }
  });

  (async function main() {
    const humanTopic = humanizeTopicName(topicName);
    document.title = `Quiz — ${humanTopic}`;
    topicTitleEl.textContent = `Quiz: ${humanTopic}`;
  })();

  // Load topic and answers
  (async function load() {
    try {
      const json = await fetchAndValidateTopic(topicName);
      topicJson = json;
      questions = Array.isArray(json.domande) ? json.domande : [];

      // Load or create answers array
      const stored = safeParse(sessionStorage.getItem(storageKey));
      if (Array.isArray(stored) && stored.length === questions.length) {
        answers = stored.slice(); // copy
      } else {
        answers = new Array(questions.length).fill(null);
        persistAnswers();
      }

      // Clamp qIndex
      if (!Number.isFinite(qIndex) || qIndex < 0) qIndex = 0;
      if (qIndex >= questions.length) qIndex = Math.max(0, questions.length - 1);

      renderQuestion(qIndex);
    } catch (err) {
      console.error('Error loading topic:', err);
      redirectToError(err && err.message ? err.message : 'Errore caricamento quiz');
    }
  })();

  // ---------- Render / Actions ----------

  function renderQuestion(index) {
    const q = questions[index];
    if (!q) {
      questionTextEl.textContent = 'Domanda non trovata.';
      if (descriptionEl) descriptionEl.textContent = '';
      answersContainer.innerHTML = '';
      updateNavigationUI();
      return;
    }

    // Title & description
    questionTextEl.textContent = q.domanda || 'Domanda senza testo';
    if (descriptionEl) descriptionEl.textContent = q.descrizione || '';

    // Explanations (optional)
    const expl = q.spiegazione || {};
    if (explAgree) explAgree.textContent = expl.daccordo || '';
    if (explNeutral) explNeutral.textContent = expl.neutrale || '';
    if (explDisagree) explDisagree.textContent = expl.disaccordo || '';

    // Render answer buttons (0..4)
    answersContainer.innerHTML = '';
    const choices = [
      { emoji: '😡', title: 'Totalmente in disaccordo', value: 0 },
      { emoji: '🙁', title: 'In disaccordo', value: 1 },
      { emoji: '😐', title: 'Neutrale', value: 2 },
      { emoji: '🙂', title: 'D’accordo', value: 3 },
      { emoji: '🤩', title: 'Totalmente d’accordo', value: 4 },
    ];

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer-btn';
      btn.dataset.value = String(choice.value);
      btn.setAttribute('aria-label', choice.title);
      btn.title = choice.title;
      btn.innerHTML = `<span class="icon" aria-hidden="true">${choice.emoji}</span>`;
      if (answers[index] === choice.value) btn.classList.add('selected');

      btn.addEventListener('click', () => {
        setAnswer(index, choice.value);
        // Visual update
        Array.from(answersContainer.querySelectorAll('.answer-btn')).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        notInterestedButton.classList.remove('selected');
        notInterestedButton.setAttribute('aria-pressed', 'false');
        notInterestedButton.textContent = 'Non Interessato';
      });

      answersContainer.appendChild(btn);
    });

    // Not interested toggle
    updateNotInterestedUI(index);
    notInterestedButton.onclick = () => {
      if (answers[index] === -1) {
        setAnswer(index, null);
        notInterestedButton.classList.remove('selected');
        notInterestedButton.setAttribute('aria-pressed', 'false');
        notInterestedButton.textContent = 'Non Interessato';
      } else {
        setAnswer(index, -1);
        Array.from(answersContainer.querySelectorAll('.answer-btn')).forEach(b => b.classList.remove('selected'));
        notInterestedButton.classList.add('selected');
        notInterestedButton.setAttribute('aria-pressed', 'true');
        notInterestedButton.textContent = 'Non Interessato (selezionato)';
      }
    };

    updateNavigationUI();
    updateProgressBar();
    // Update URL parameter q without reloading
    updateUrlParam(PARAM_Q, String(index));
  }

  function updateNotInterestedUI(index) {
    if (answers[index] === -1) {
      notInterestedButton.classList.add('selected');
      notInterestedButton.setAttribute('aria-pressed', 'true');
      notInterestedButton.textContent = 'Non Interessato (selezionato)';
    } else {
      notInterestedButton.classList.remove('selected');
      notInterestedButton.setAttribute('aria-pressed', 'false');
      notInterestedButton.textContent = 'Non Interessato';
    }
  }

  function updateNavigationUI() {
    prevButton.disabled = qIndex <= 0;
    nextButton.textContent = (qIndex < questions.length - 1) ? 'Avanti' : 'Vedi Risultati';
  }

  function setAnswer(index, value) {
    // value: null | -1 | 0..4
    answers[index] = value;
    persistAnswers();
  }

  function persistAnswers() {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(answers));
    } catch (e) {
      console.warn('Unable to persist answers to sessionStorage', e);
    }
  }

  function navigateTo(index) {
    qIndex = index;
    renderQuestion(qIndex);
  }

  function updateProgressBar() {
    if (!progressBar || questions.length === 0) return;
    const percent = ((qIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${percent}%`;

    const progressText = document.getElementById('progress-text');
    if (progressText) {
      progressText.textContent = `Domanda ${qIndex + 1} di ${questions.length}`;
    }
  }

  // ---------- Utilities & network ----------

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function sanitizeTopicName(raw) {
    if (!raw) return null;
    const s = String(raw).trim();
    return /^[a-zA-Z0-9_-]+$/.test(s) ? s : null;
  }

  function safeParse(raw) {
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function humanizeTopicName(name) {
    return String(name).replace(/[-_]+/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
  }

  async function fetchAndValidateTopic(name) {
    const path = `${TOPICS_PATH}${encodeURIComponent(name)}.json`;
    const resp = await fetch(path, { cache: 'no-store' });

    if (!resp.ok) {
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

  function updateUrlParam(key, value) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set(key, value);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      // ignore non-fatal
    }
  }

  function redirectToError(message) {
    const normalized = String(message || 'Errore sconosciuto').trim().replace(/\s+/g, ' ');
    const truncated = normalized.length > MAX_ERROR_LENGTH ? normalized.slice(0, MAX_ERROR_LENGTH - 3) + '...' : normalized;
    const url = `${ERROR_PAGE}?error=${encodeURIComponent(truncated)}`;
    setTimeout(() => { window.location.href = url; }, 50);
  }
});
