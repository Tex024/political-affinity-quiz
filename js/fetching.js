document.addEventListener("DOMContentLoaded", () => {
  let questions = [];
  let currentIndex = 0;

  const introductionSection = document.getElementById("introduction-section");
  const questionSection = document.getElementById("questions-section");
  const questionDiv = document.getElementById("question");
  const questionTextDiv = document.getElementById("question-text");
  const questionDescriptionDiv = document.getElementById("question-description");
  const descriptionToggleBtn = document.createElement("button");
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

  // Handle introduction button click
  const handleStart = () => {
    introductionSection.style.display = "none";
    questionSection.style.display = "block";
    fetchQuestions();
  };

  document.getElementById("start-button").addEventListener("click", handleStart);

  // Display question based on index
  function displayQuestion(index) {
    if (index < 0 || index >= questions.length) return;

    currentIndex = index;
    const questionData = questions[index];

    questionTextDiv.textContent = questionData.question;
    questionDescriptionDiv.textContent = questionData.description || ""; // Handle optional descriptions
    questionDiv.setAttribute("value", index);

    // Handle visibility of question description toggle
    if (questionData.description) {
      if (!descriptionToggleBtn.parentElement) {
        descriptionToggleBtn.textContent = "Mostra descrizione";
        descriptionToggleBtn.addEventListener("click", () => {
          if (questionDescriptionDiv.style.display === "none") {
            questionDescriptionDiv.style.display = "block";
            descriptionToggleBtn.textContent = "Nascondi descrizione";
          } else {
            questionDescriptionDiv.style.display = "none";
            descriptionToggleBtn.textContent = "Mostra descrizione";
          }
        });
        questionDiv.appendChild(descriptionToggleBtn);
        questionDescriptionDiv.style.display = "none";
      }
    } else {
      descriptionToggleBtn.style.display = "none";
    }

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
});
