let userAnswers = [];
let questions = [];

// Load the JSON and initialize the recap calculation
document.addEventListener("DOMContentLoaded", () => {
  fetch("questions.json")
    .then((response) => response.json())
    .then((data) => {
      questions = data.questions;
      userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || [];
      calculateRecap();
    })
    .catch((error) => console.error("Errore nel caricamento delle domande:", error));
});

// Function to calculate distances for each partito
function calculateRecap() {
  const partitoScores = {
    destra: 0,
    sinistra: 0,
    partito1: 0,
    partito2: 0,
    partito3: 0
  };

  // Loop over user answers and corresponding question answers
  for (let i = 0; i < userAnswers.length; i++) {
    const userAnswerIndex = userAnswers[i];
    const question = questions[i];

    if (!question || !question.answers) continue;

    // Extract the answers for comparison
    const answers = question.answers;
    const userAnswerWeight = userAnswerIndex; // User's choice directly corresponds to index

    for (let partito in answers) {
      const partyProfile = answers[partito];

      if (partyProfile[userAnswerWeight] !== undefined) {
        const difference = Math.abs(1 - partyProfile[userAnswerWeight]); // Distance between user's choice and party's answer
        partitoScores[partito] += difference; // Accumulate the difference
      }
    }
  }

  // Log the computed values in the console
  console.log("Calcolo dei risultati dei partiti:");
  console.log("Differenze totali con ciascun partito:");
  console.log(partitoScores);
}

