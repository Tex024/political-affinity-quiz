document.addEventListener("DOMContentLoaded", () => {
  let questions = [];
  let currentIndex = 0;

  const questionDiv = document.getElementById("question");
  const questionTextDiv = document.getElementById("question-text");
  const questionDescriptionDiv = document.getElementById("question-description");
  const nextButton = document.getElementById("next-btn");
  const backButton = document.getElementById("back-btn");

  // Fetch questions from questions.json
  async function fetchQuestions() {
    try {
      const response = await fetch("questions.json");
      const data = await response.json();
      questions = data.questions;
      displayQuestion(0);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }

  // Display question based on index
  function displayQuestion(index) {
    if (index < 0 || index >= questions.length) return;

    currentIndex = index;
    const questionData = questions[index];

    questionTextDiv.textContent = questionData.question;
    questionDescriptionDiv.textContent = questionData.description;

    // Ensure correct question section is visible
    questionDiv.setAttribute("value", index);

    // Handle navigation buttons' visibility
    backButton.style.display = index > 0 ? "block" : "none";
    nextButton.style.display = index < questions.length - 1 ? "block" : "none";
  }

  // Handle "Next" button click
  nextButton.addEventListener("click", () => {
    if (currentIndex < questions.length - 1) {
      displayQuestion(currentIndex + 1);
    }
  });

  // Handle "Back" button click
  backButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      displayQuestion(currentIndex - 1);
    }
  });

  // Start by fetching questions
  fetchQuestions();
});
