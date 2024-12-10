// Handling the buttons and question navigation
window.addEventListener("load", () => {
  let currentQuestion = 0;

  // Inizia button functionality
  const startButton = document.getElementById("start-button");
  const introductionSection = document.getElementById("introduction-section");
  const questionsSection = document.getElementById("questions-section");

  startButton.addEventListener("click", () => {
      introductionSection.style.display = "none";
      questionsSection.style.display = "block";
      updateVisibleQuestion();
  });

  // Function to update the visible question
  const updateVisibleQuestion = () => {
      const allQuestions = document.querySelectorAll("#questions-div > #question");
      allQuestions.forEach((question, index) => {
          question.style.display = index === currentQuestion ? "block" : "none";
      });
  };

  // Add event listeners for each answer button
  document.querySelectorAll("#questions-div").forEach(questionDiv => {
      questionDiv.addEventListener("click", (event) => {
          if (event.target.classList.contains("answer-btn")) {
              // Clear the selected state for all buttons in the current question
              const buttons = event.target.parentElement.querySelectorAll(".answer-btn");
              buttons.forEach(button => button.removeAttribute("data-selected"));

              // Set the selected state for the clicked button
              event.target.setAttribute("data-selected", "true");
          }
      });
  });

  // Optional: Add navigation functionality (if needed for further improvement)
  // Example: Add event listeners for back and next buttons if implemented
});
