// question_manager.js
// Manages a single-question page. Reads ?topic=...&q=... and updates answers in sessionStorage.
// Answer encoding: null = unanswered, -1 = Non Interessato, 0..4 numeric.

document.addEventListener('DOMContentLoaded', () => {
  const PARAM_TOPIC = 'topic';
  const PARAM_Q = 'q';
  const STORAGE_PREFIX = 'quiz_answers::';

  const homeButton = document.getElementById('home-button');
  const questionTextEl = document.getElementById('question-text');
  const answersContainer = document.getElementById('answers');
  const notInterestedButton = document.getElementById('not-interested-button');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');

  const toggleDetails = document.getElementById('toggle-details');
  const detailsBox = document.getElementById('details');
  const descriptionEl = document.getElementById('description');
  const explAgree = document.getElementById('explanation-agree');
  const explNeutral = document.getElementById('explanation-neutral');
  const explDisagree = document.getElementById('explanation-disagree');

  let topicName = getQueryParam(PARAM_TOPIC);
  let qIndex = parseInt(getQueryParam(PARAM_Q) || '0', 10);
  if (!topicName) {
    document.body.innerHTML = `<main style="padding:1rem"><h2>Errore</h2><p>Topic mancante. Apri il quiz dalla home.</p></main>`;
    return;
  }

  const storageKey = STORAGE_PREFIX + topicName;
  let topicJson = null;
  let questions = [];
  let answers = [];

  homeButton.addEventListener('click', () => location.href = 'index.html');

  toggleDetails.addEventListener('click', () => {
    const visible = detailsBox.style.display === '' || detailsBox.style.display === 'block';
    detailsBox.style.display = visible ? 'none' : 'block';
    toggleDetails.textContent = visible ? 'Mostra dettagli' : 'Nascondi dettagli';
  });

  prevButton.addEventListener('click', () => {
    if (qIndex > 0) {
      navigateTo(qIndex - 1);
    }
  });

  nextButton.addEventListener('click', () => {
    if (qIndex < questions.length - 1) {
      navigateTo(qIndex + 1);
    } else {
      // last question -> go to results
      location.href = `results.html?topic=${encodeURIComponent(topicName)}`;
    }
  });

  // Load topic and answers
  fetch(`topics/${encodeURIComponent(topicName)}.json`, { cache: 'no-store' })
    .then(resp => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp.json();
    })
    .then(json => {
      topicJson = json;
      questions = Array.isArray(json.domande) ? json.domande : [];
      const stored = safeParse(sessionStorage.getItem(storageKey));
      if (Array.isArray(stored) && stored.length === questions.length) {
        answers = stored;
      } else {
        answers = new Array(questions.length).fill(null);
        sessionStorage.setItem(storageKey, JSON.stringify(answers));
      }
      // If qIndex out of range, clamp
      if (qIndex < 0) qIndex = 0;
      if (qIndex >= questions.length) qIndex = Math.max(0, questions.length - 1);
      renderQuestion(qIndex);
    })
    .catch(err => {
      console.error(err);
      document.body.innerHTML = `<main style="padding:1rem"><h2>Errore</h2><p>Impossibile caricare il topic (${escapeHtml(err.message)}). Torna alla home.</p></main>`;
    });

  // ---------- functions ----------
  function renderQuestion(index) {
    const q = questions[index];
    if (!q) {
      questionTextEl.textContent = 'Domanda non trovata.';
      return;
    }
    questionTextEl.textContent = `${index+1}. ${q.domanda || 'Domanda senza testo'}`;
    descriptionEl.textContent = q.descrizione || '';

    // Explanations
    const expl = q.spiegazione || {};
    explAgree.textContent = expl.daccordo || 'N/A';
    explNeutral.textContent = expl.neutrale || 'N/A';
    explDisagree.textContent = expl.disaccordo || 'N/A';

    // Render answer buttons (0..4)
    answersContainer.innerHTML = '';
    const labels = [
      {emoji: '😡', text: 'Totalmente in disaccordo', value: 0},
      {emoji: '🙁', text: 'In disaccordo', value: 1},
      {emoji: '😐', text: 'Neutrale', value: 2},
      {emoji: '🙂', text: 'D’accordo', value: 3},
      {emoji: '🤩', text: 'Totalmente d’accordo', value: 4},
    ];

    labels.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.dataset.value = String(item.value);
      btn.innerHTML = `<span class="icon">${item.emoji}</span>`;
      btn.title = item.text;
      if (answers[index] === item.value) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        setAnswer(index, item.value);
        // Visual update
        Array.from(answersContainer.querySelectorAll('.answer-btn')).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
      answersContainer.appendChild(btn);
    });

    // Not interested button state
    if (answers[index] === -1) {
      notInterestedButton.classList.add('selected');
      notInterestedButton.textContent = 'Non Interessato (selezionato)';
    } else {
      notInterestedButton.classList.remove('selected');
      notInterestedButton.textContent = 'Non Interessato';
    }

    notInterestedButton.onclick = () => {
      if (answers[index] === -1) {
        // toggle off -> set to null
        setAnswer(index, null);
        notInterestedButton.classList.remove('selected');
        notInterestedButton.textContent = 'Non Interessato';
      } else {
        setAnswer(index, -1);
        // Clear numeric selections
        Array.from(answersContainer.querySelectorAll('.answer-btn')).forEach(b => b.classList.remove('selected'));
        notInterestedButton.classList.add('selected');
        notInterestedButton.textContent = 'Non Interessato (selezionato)';
      }
    };

    // Navigation buttons visibility
    prevButton.disabled = index === 0;
    nextButton.textContent = (index < questions.length - 1) ? 'Avanti' : 'Vedi Risultati';

    // Update URL without reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set(PARAM_Q, String(index));
    window.history.replaceState({}, '', newUrl.toString());
  }

  function setAnswer(index, value) {
    // value: null | -1 | 0..4
    answers[index] = value;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(answers));
    } catch (e) {
      console.warn('Unable to persist answers', e);
    }
  }

  function navigateTo(index) {
    // navigate to question page with new q param
    location.href = `question.html?topic=${encodeURIComponent(topicName)}&q=${index}`;
  }

  // ---------- helpers ----------
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
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
