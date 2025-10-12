// home.js
// Loads topics.json (new structure) and populates <ul id="quiz-list"> with links to begin.html?topic=...
// Topic schema:
// {
//   "topics": [
//     { "name": "nucleare", "description": "quiz sul nucleare", "active": true },
//     ...
//   ]
// }

document.addEventListener('DOMContentLoaded', () => {
  const LIST_ID = 'quiz-list';
  const TOPICS_FILE = 'topics.json';

  const listElement = document.getElementById(LIST_ID);
  if (!listElement) return;

  loadTopics();

  async function loadTopics() {
    try {
      const resp = await fetch(TOPICS_FILE, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`Failed to fetch ${TOPICS_FILE} (status ${resp.status})`);
      const data = await resp.json();

      const rawTopics = Array.isArray(data.topics) ? data.topics : [];
      // Normalize: keep only objects with name; default active = true
      const topics = rawTopics
        .map(t => ({
          name: String(t.name || '').trim(),
          description: String(t.description || '').trim(),
          active: (typeof t.active === 'boolean') ? t.active : true
        }))
        .filter(t => t.name.length > 0 && t.active)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

      if (topics.length === 0) {
        renderEmpty('Nessun topic disponibile.');
        return;
      }

      listElement.innerHTML = '';
      for (const topic of topics) {
        listElement.appendChild(createTopicItem(topic));
      }
    } catch (err) {
      console.error('Error loading topics.json:', err);
      renderEmpty(`Errore caricamento topics: ${escapeHtml(err.message)}`);
    }
  }

  function createTopicItem(topic) {
    const li = document.createElement('li');

    const link = document.createElement('a');
    link.className = 'topic-card';
    link.href = `begin.html?topic=${encodeURIComponent(topic.name)}`;
    link.setAttribute('aria-label', `Apri quiz ${topic.name}`);

    const title = document.createElement('div');
    title.className = 'topic-title';
    title.textContent = humanizeTopicName(topic.name);

    const sub = document.createElement('div');
    sub.className = 'topic-sub';
    sub.textContent = topic.description || 'Nessuna descrizione.';

    link.appendChild(title);
    link.appendChild(sub);
    li.appendChild(link);
    return li;
  }

  function renderEmpty(message) {
    listElement.innerHTML = '';
    const li = document.createElement('li');
    li.className = 'placeholder';
    li.textContent = message;
    listElement.appendChild(li);
  }

  function humanizeTopicName(name) {
    return String(name)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, ch => ch.toUpperCase());
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[c])
    );
  }
});
