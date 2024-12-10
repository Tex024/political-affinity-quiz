let allQuestions = [];
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("questions.json");
  const jsonData = await response.json();
  allQuestions = jsonData.questions;

  populateQuestions();
});

function populateQuestions() {
  const container = document.getElementById("questions-container");

  allQuestions.forEach((question, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.className = "question";
    questionDiv.id = `question-${index}`;
    questionDiv.style.display = "none";

    questionDiv.innerHTML = `
      <h3>Domanda ${index + 1}</h3>
      <p>${question.question}</p>
      <p><i>${question.description}</i></p>
      <div class="answers">
        ${Object.keys(question.answers)
          .map(
            (key) =>
              `<button class="answer-btn" data-question="${index}" data-answer="${key}">${key}</button>`
          )
          .join("")}
      </div>
      <button class="next-btn" style="display:none;">Prossima Domanda</button>
      <button class="back-btn" style="display:none;">Indietro</button>
    `;

    container.appendChild(questionDiv);
  });

  showQuestion(0);
}

function showQuestion(index) {
  for (let i = 0; i < allQuestions.length; i++) {
    const qDiv = document.getElementById(`question-${i}`);
    if (i === index) {
      qDiv.style.display = "block";
    } else {
      qDiv.style.display = "none";
    }
  }

  const backButton = document.querySelector(".back-btn");
  const nextButton = document.querySelector(".next-btn");

  if (index === 0) {
    backButton.style.display = "none";
  } else {
    backButton.style.display = "inline-block";
  }

  if (index === allQuestions.length - 1) {
    nextButton.style.display = "none";
  } else {
    nextButton.style.display = "inline-block";
  }

  addButtonListeners();
}

