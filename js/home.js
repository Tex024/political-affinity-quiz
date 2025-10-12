// home.js
// Loads topics.json and populates <ul id="quiz-list"> with links to begin.html?topic=...

document.addEventListener('DOMContentLoaded', () => {
  const listElement = document.getElementById('quiz-list');
  if (!listElement) return;

  loadTopics();

  async function loadTopics() {
    try {
      const response = await fetch('topics.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to fetch topics.json (status ${response.status})`);
      const json = await response.json();

      // Accept either { "topics": [ ... ] } or a raw array
      const topics = Array.isArray(json.topics) ? json.topics : Array.isArray(json) ? json : [];

      if (topics.length === 0) {
        renderEmpty('Nessun topic disponibile.');
        return;
      }

      listElement.innerHTML = ''; // clear placeholder
      topics.forEach(topicName => {
        const safeTopic = String(topicName);
        const listItem = document.createElement('li');

        const link = document.createElement('a');
        // Link to begin.html with query parameter "topic"
        link.href = `begin.html?topic=${encodeURIComponent(safeTopic)}`;
        link.textContent = humanizeTopicName(safeTopic);
        link.setAttribute('aria-label', `Apri quiz ${safeTopic}`);

        listItem.appendChild(link);
        listElement.appendChild(listItem);
      });

    } catch (error) {
      console.error('Error loading topics.json:', error);
      renderEmpty(`Errore caricamento topics: ${escapeHtml(error.message)}`);
    }
  }

  function renderEmpty(message) {
    listElement.innerHTML = '';
    const item = document.createElement('li');
    item.textContent = message;
    listElement.appendChild(item);
  }

  // Convert "nucleare" or "some-topic_name" -> "Nucleare" / "Some Topic Name"
  function humanizeTopicName(name) {
    return String(name)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, ch => ch.toUpperCase());
  }

  // Basic HTML escape for error text shown to user
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  }
});
