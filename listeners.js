let selectedAnswers = [];

function addButtonListeners() {
  const answerBtns = document.querySelectorAll(".answer-btn");
  const backButton = document.querySelector(".back-btn");
  const nextButton = document.querySelector(".next-btn");

  answerBtns.forEach((btn) => {
    btn.onclick = handleAnswerSelection;
  });

  backButton.onclick = handleBack;
  nextButton.onclick = handleNext;
}

function handleAnswerSelection(e) {
  const selectedButton = e.target;
  const questionIndex = parseInt(selectedButton.dataset.question);
  const answerKey = selectedButton.dataset.answer;

  const answerBtns = document.querySelectorAll(
    `[data-question="${questionIndex}"]`
  );

  answerBtns.forEach((btn) => btn.classList.remove("selected"));
  selectedButton.classList.add("selected");

  selectedAnswers[questionIndex] = answerKey;
}

function handleBack() {
  if (currentIndex > 0) {
    currentIndex -= 1;
    showQuestion(currentIndex);
  }
}

function handleNext() {
  if (currentIndex < allQuestions.length - 1) {
    currentIndex += 1;
    showQuestion(currentIndex);
  } else {
    endQuiz();
  }
}

function endQuiz() {
  alert("Quiz terminato! Ecco le tue risposte: " + JSON.stringify(selectedAnswers));
}
