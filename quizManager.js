let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch("questions.json")
    .then((response) => response.json())
    .then((data) => {
      questions = data.questions;
    })
    .catch((error) => console.error("Errore nel caricamento delle domande:", error));

  document.getElementById("start-section").querySelector("button").addEventListener("click", startQuiz);
});

function startQuiz() {
  document.getElementById("start-section").style.display = "none";
  showQuestion();
}

function showQuestion() {
  const questionSection = document.getElementById("question-section");
  questionSection.style.display = "block";

  const questionTextElement = document.getElementById("question-text");
  const answersDiv = document.getElementById("answers");
  const descriptionDiv = document.getElementById("detailed-explanation");

  // Clear previous question UI
  questionTextElement.innerHTML = "";
  answersDiv.innerHTML = "";
  descriptionDiv.innerHTML = "";

  const question = questions[currentQuestionIndex];

  // Display question number and question
  questionTextElement.innerText = `${currentQuestionIndex + 1}. ${question.question}`;

  // Populate possible responses
  const options = ["strongly_agree", "agree", "moderate", "disagree", "strongly_disagree", "uninterested"];
  options.forEach((option, index) => {
    const button = document.createElement("button");
    button.innerHTML = `<img src="icons/${option}.png" alt="${option}">`;
    button.className = "answer-btn";
    button.dataset.index = index; // Store index in dataset
    button.addEventListener("click", handleAnswerClick);
    answersDiv.appendChild(button);
  });

  // Handle description toggle
  const descriptionToggle = document.createElement("button");
  descriptionToggle.innerText = "Mostra Descrizione";
  descriptionToggle.addEventListener("click", () => {
    if (descriptionDiv.innerHTML) {
      descriptionDiv.innerHTML = "";
      descriptionToggle.innerText = "Mostra Descrizione";
    } else {
      descriptionDiv.innerHTML = `<p>${question.description}</p>`;
      descriptionToggle.innerText = "Nascondi Descrizione";
    }
  });
  answersDiv.appendChild(descriptionToggle);
}

function handleAnswerClick(e) {
  const selectedButton = e.currentTarget;
  const answerButtons = document.querySelectorAll(".answer-btn");

  // Deselect all answers
  answerButtons.forEach((btn) => btn.classList.remove("selected"));
  
  // Select clicked answer
  selectedButton.classList.add("selected");

  const answerIndex = parseInt(selectedButton.dataset.index);

  if (userAnswers[currentQuestionIndex] !== undefined) {
    userAnswers[currentQuestionIndex] = answerIndex;
  } else {
    userAnswers.push(answerIndex);
  }

  // Show next question button
  let nextButton = document.getElementById("next-btn");
  if (!nextButton) {
    nextButton = document.createElement("button");
    nextButton.id = "next-btn";
    nextButton.innerText = "Prossima Domanda";
    nextButton.addEventListener("click", goToNextQuestion);
    document.getElementById("question-section").appendChild(nextButton);
  }
}

function goToNextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  } else {
    endQuiz();
  }

  const nextButton = document.getElementById("next-btn");
  if (nextButton) nextButton.remove();
}

function endQuiz() {
  document.getElementById("question-section").style.display = "none";
  const resultsSection = document.getElementById("results-section");
  resultsSection.style.display = "block";

  const descriptionDiv = document.getElementById("description");
  descriptionDiv.innerHTML = `<p>Risposte Utente: ${JSON.stringify(userAnswers)}</p>`;
}
