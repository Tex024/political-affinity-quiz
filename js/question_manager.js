let currentQuestionIndex = 0;
let userAnswers = [];

document.addEventListener("DOMContentLoaded", async () => {
  const questionContainer = document.getElementById("question-container");
  const questionText = document.getElementById("question-text");
  const answerButtons = document.querySelectorAll(".answer-btn");
  const nextButton = document.getElementById("next-button");
  const notInterestedButton = document.getElementById("not-interested-button");
  const toggleDetailsButton = document.getElementById("toggle-details");
  const details = document.getElementById("details");
  const description = document.getElementById("description");
  const explanationAgree = document.getElementById("explanation-agree");
  const explanationNeutral = document.getElementById("explanation-neutral");
  const explanationDisagree = document.getElementById("explanation-disagree");

  const questions = await fetchQuestions();

  function renderQuestion() {
    const question = questions[currentQuestionIndex];
    questionText.textContent = question.domanda;
    description.textContent = question.descrizione;
    explanationAgree.textContent = question.spiegazione.daccordo;
    explanationNeutral.textContent = question.spiegazione.neutrale;
    explanationDisagree.textContent = question.spiegazione.disaccordo;
    nextButton.style.display = "none";
    answerButtons.forEach(btn => btn.classList.remove("selected"));
    notInterestedButton.classList.remove("selected");
  }

  function fetchQuestions() {
    return fetch("questions.json")
      .then(response => response.json())
      .then(data => data.domande);
  }

  answerButtons.forEach(button => {
    button.addEventListener("click", () => {
      answerButtons.forEach(btn => btn.classList.remove("selected"));
      notInterestedButton.classList.remove("selected");
      button.classList.add("selected");
      userAnswers[currentQuestionIndex] = parseInt(button.dataset.value);
      nextButton.style.display = "block";
    });
  });

  notInterestedButton.addEventListener("click", () => {
    answerButtons.forEach(btn => btn.classList.remove("selected"));
    notInterestedButton.classList.add("selected");
    userAnswers[currentQuestionIndex] = -1;
    nextButton.style.display = "block";
  });

  nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
    } else {
      localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
      window.location.href = "results.html";
    }
  });

  toggleDetailsButton.addEventListener("click", () => {
    details.style.display = details.style.display === "none" ? "block" : "none";
  });

  renderQuestion();
});