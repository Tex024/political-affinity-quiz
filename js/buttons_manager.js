// Handling the buttons and question navigation
window.addEventListener("load", () => {
    let currentQuestion = 0;

    // Inizia button functionality
    const startButton = document.getElementById("start-button");
    const introductionSection = document.getElementById("introduction-section");
    const questionsSection = document.getElementById("questions-section");
    const backButton = document.getElementById("back-btn");
    const nextButton = document.getElementById("next-btn");

    startButton.addEventListener("click", () => {
        introductionSection.style.display = "none";
        questionsSection.style.display = "block";
        updateVisibleQuestion();
    });

    // Function to update the visible question
    function updateVisibleQuestion() {
        const allQuestions = document.querySelectorAll('#questions-div > div[id="question"]');
        allQuestions.forEach((question) => {
            question.style.display = "none";
        });
    
        const currentQuestionDiv = document.querySelector(`#questions-div > div[id="question"][value="${currentQuestion}"]`);
        if (currentQuestionDiv) { // Add null check
            currentQuestionDiv.style.display = "block";
            updateButtonVisibility();
        }
    }
    
    function isAnswerSelected() {
        const currentQuestionDiv = document.querySelector(`#questions-div > div[id="question"][value="${currentQuestion}"]`);
        if (!currentQuestionDiv) return false; // Add null check to avoid errors
    
        const selectedAnswer = currentQuestionDiv.querySelector('.answer-btn[selected]');
        return !!selectedAnswer; // Return true if an answer is selected, false otherwise
    }    

    // Add event listeners for each answer button
    document.querySelectorAll("#questions-div").forEach(questionDiv => {
        questionDiv.addEventListener("click", (event) => {
            if (event.target.classList.contains("answer-btn")) {
                // Clear the selected state for all buttons in the current question
                const buttons = event.target.parentElement.querySelectorAll(".answer-btn");
                buttons.forEach(button => button.removeAttribute("data-selected"));

                // Set the selected state for the clicked button
                event.target.setAttribute("data-selected", "true");

                // Update the visibility of the Next button
                updateVisibleQuestion();
            }
        });
    });

    // Next button functionality
    nextButton.addEventListener("click", () => {
        console.log(isAnswerSelected())
        console.log(currentQuestion)
        console.log(document.querySelectorAll("#questions-div > #question").length - 1)
        if (currentQuestion < document.querySelectorAll("#questions-div > #question").length - 1 && isAnswerSelected()) {
            currentQuestion++;
            updateVisibleQuestion();
        }
    });

    // Back button functionality
    backButton.addEventListener("click", () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            updateVisibleQuestion();
        }
    });

    // Initialize navigation buttons visibility
    updateVisibleQuestion();
});