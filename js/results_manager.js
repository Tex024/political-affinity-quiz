document.addEventListener("DOMContentLoaded", async () => {
    const homeButton = document.getElementById("home-button");
    const resultsContainer = document.querySelector("#results-container");
    const generalResultsList = document.querySelector("#general-results-list");
    const categoryResultsList = document.querySelector("#category-results-list");
    const userAnswers = JSON.parse(localStorage.getItem("userAnswers"));
  
    if (!userAnswers) {
      displayError("Non sono stati trovati risultati.");
      return;
    }
  
    try {
      const questions = await loadQuestions();
  
      const { partyResults, categoryResults } = calculateResults(questions, userAnswers);
  
      renderGeneralResults(partyResults, generalResultsList);
      renderCategoryResults(categoryResults, categoryResultsList);
    } catch (error) {
      displayError("Errore nel caricamento dei dati.");
      console.error("Errore:", error);
    }
  
    homeButton.addEventListener("click", () => {
      let text = "Press a button!\nEither OK or Cancel.";
        if (confirm("Andando alla Home perderai tutte le statistiche. Sei sicuro?") == true) {
            window.location.href = "index.html";
        }
    });
  });
  
  async function loadQuestions() {
    const response = await fetch("questions.json");
    if (!response.ok) {
      throw new Error("Impossibile caricare il file JSON delle domande.");
    }
    const data = await response.json();
    return data.domande;
  }
  
  function calculateResults(questions, userAnswers) {
    const partyScores = initializeScores(questions[0].partiti);
    const categoryScores = initializeCategoryScores(questions[0].categorie, questions[0].partiti);
  
    userAnswers.forEach((answer, index) => {
      if (answer === -1) return;
  
      const question = questions[index];
      updatePartyScores(question.partiti, answer, partyScores);
      updateCategoryScores(question.categorie, question.partiti, answer, categoryScores);
    });
  
    const partyResults = calculatePercentages(partyScores);
    const categoryResults = Object.fromEntries(
      Object.entries(categoryScores).map(([category, scores]) => [
        category,
        calculatePercentages(scores),
      ])
    );
  
    return { partyResults, categoryResults };
  }
  
  function initializeScores(parties) {
    const scores = {};
    Object.keys(parties).forEach((party) => {
      scores[party] = { userScore: 0, maxScore: 0 };
    });
    return scores;
  }
  
  function initializeCategoryScores(categories, parties) {
    const scores = {};
    Object.keys(categories).forEach((category) => {
      scores[category] = initializeScores(parties);
    });
    return scores;
  }
  
  function updatePartyScores(parties, answer, partyScores) {
    Object.entries(parties).forEach(([party, scores]) => {
      const score = scores[answer - 1] || 0;
      partyScores[party].userScore += score;
      partyScores[party].maxScore += Math.max(...scores);
    });
  }
  
  function updateCategoryScores(categories, parties, answer, categoryScores) {
    Object.entries(categories).forEach(([category, weight]) => {
      Object.entries(parties).forEach(([party, scores]) => {
        const score = (scores[answer - 1] || 0) * weight;
        const maxScore = Math.max(...scores) * weight;
        categoryScores[category][party].userScore += score;
        categoryScores[category][party].maxScore += maxScore;
      });
    });
  }
  
  function calculatePercentages(scores) {
    return Object.keys(scores).map((key) => {
      const { userScore, maxScore } = scores[key];
      const percentage = maxScore > 0 ? (userScore / maxScore) * 100 : 0;
      return { name: key, userScore, maxScore, percentage };
    }).sort((a, b) => b.percentage - a.percentage);
  }
  
  function renderGeneralResults(results, container) {
    const table = document.createElement("table");
    table.classList.add("results-table");
  
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
      <th>Partito</th>
      <th>Affinità</th>
      <th>Punteggio</th>
    `;
    table.appendChild(headerRow);
  
    results.forEach((result) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${result.name}</td>
        <td>${result.percentage.toFixed(1)}%</td>
        <td>${result.userScore.toFixed(2)}/${result.maxScore.toFixed(2)}</td>
      `;
      table.appendChild(row);
    });
  
    container.appendChild(table);
  }
  
  function renderCategoryResults(results, container) {
    Object.entries(results).forEach(([category, scores]) => {
      const categorySection = document.createElement("section");
      const categoryTitle = document.createElement("h3");
      categoryTitle.textContent = `Categoria: ${category}`;
      categorySection.appendChild(categoryTitle);
  
      const table = document.createElement("table");
      table.classList.add("results-table");
  
      const headerRow = document.createElement("tr");
      headerRow.innerHTML = `
        <th>Partito</th>
        <th>Affinità</th>
        <th>Punteggio</th>
      `;
      table.appendChild(headerRow);
  
      scores.forEach((result) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${result.name}</td>
          <td>${result.percentage.toFixed(1)}%</td>
          <td>${result.userScore.toFixed(2)}/${result.maxScore.toFixed(2)}</td>
        `;
        table.appendChild(row);
      });
  
      categorySection.appendChild(table);
      container.appendChild(categorySection);
    });
  }
  
  
  function displayError(message) {
    const errorParagraph = document.createElement("p");
    errorParagraph.textContent = message;
    errorParagraph.classList.add("error");
    document.querySelector("#results-container").appendChild(errorParagraph);
  }