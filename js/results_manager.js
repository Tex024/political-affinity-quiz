document.addEventListener("DOMContentLoaded", async () => {
    const resultsContainer = document.querySelector("#results-list");
    const userAnswers = JSON.parse(localStorage.getItem("userAnswers"));
  
    if (!userAnswers) {
      resultsContainer.textContent = "Non sono stati trovati risultati.";
      return;
    }
  
    try {
      // Carica i dati dal JSON
      const response = await fetch("questions.json");
      const data = await response.json();
      const questions = data.domande;
  
      const partyScores = {};
      const partyMaxScores = {};
      const categoryScores = {};
      const categoryMaxScores = {};
  
      // Inizializza i partiti e le categorie
      Object.keys(questions[0].partiti).forEach((party) => {
        partyScores[party] = 0;
        partyMaxScores[party] = 0;
      });
  
      Object.keys(questions[0].categorie).forEach((category) => {
        categoryScores[category] = {};
        categoryMaxScores[category] = {};
  
        Object.keys(questions[0].partiti).forEach((party) => {
          categoryScores[category][party] = 0;
          categoryMaxScores[category][party] = 0;
        });
      });
  
      // Itera su tutte le domande e calcola i punteggi
      userAnswers.forEach((answer, index) => {
        if (answer === -1) return; // Skippa le domande non risposte
  
        const question = questions[index];
        const partiti = question.partiti;
        const categorie = question.categorie;
  
        // Calcola i punteggi generali
        Object.entries(partiti).forEach(([party, scores]) => {
          partyScores[party] += scores[answer-1] || 0;
          partyMaxScores[party] += Math.max(...scores);
        });
  
        // Calcola i punteggi per categoria
        Object.entries(categorie).forEach(([category, weight]) => {
          Object.entries(partiti).forEach(([party, scores]) => {
            const weightedScore = (scores[answer-1] || 0) * weight;
            const weightedMaxScore = Math.max(...scores) * weight;
  
            categoryScores[category][party] += weightedScore;
            categoryMaxScores[category][party] += weightedMaxScore;
          });
        });
      });
  
      // Calcola le percentuali generali e ordina i risultati
      const partyResults = Object.keys(partyScores).map((party) => {
        const userScore = partyScores[party];
        const maxScore = partyMaxScores[party];
        const percentage = maxScore > 0 ? (userScore / maxScore) * 100 : 0;
  
        return { party, userScore, maxScore, percentage };
      });
  
      partyResults.sort((a, b) => b.percentage - a.percentage);
  
      // Calcola le percentuali per categorie
      const categoryResults = {};
      Object.keys(categoryScores).forEach((category) => {
        categoryResults[category] = Object.keys(categoryScores[category]).map(
          (party) => {
            const userScore = categoryScores[category][party];
            const maxScore = categoryMaxScores[category][party];
            const percentage = maxScore > 0 ? (userScore / maxScore) * 100 : 0;
  
            return { party, userScore, maxScore, percentage };
          }
        );
  
        categoryResults[category].sort((a, b) => b.percentage - a.percentage);
      });
  
      // Aggiorna il DOM con i risultati generali
      const generalTitle = document.createElement("h2");
      generalTitle.textContent = "Risultati Generali";
      resultsContainer.appendChild(generalTitle);
  
      partyResults.forEach((result) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${result.party}: ${result.percentage.toFixed(
          1
        )}% (Punteggio: ${result.userScore}/${result.maxScore})`;
        resultsContainer.appendChild(listItem);
      });
  
      // Aggiorna il DOM con i risultati per categorie
      Object.entries(categoryResults).forEach(([category, results]) => {
        const categoryTitle = document.createElement("h2");
        categoryTitle.textContent = `Risultati per Categoria: ${category}`;
        resultsContainer.appendChild(categoryTitle);
  
        results.forEach((result) => {
          const listItem = document.createElement("li");
          listItem.textContent = `${result.party}: ${result.percentage.toFixed(
            1
          )}% (Punteggio: ${result.userScore}/${result.maxScore})`;
          resultsContainer.appendChild(listItem);
        });
      });
    } catch (error) {
      resultsContainer.textContent = "Errore nel caricamento dei dati.";
      console.error("Errore:", error);
    }
  });
  