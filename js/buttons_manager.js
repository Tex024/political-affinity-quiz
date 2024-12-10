// Handling the buttons and question navigation
window.addEventListener("load", () => {
    let currentQuestion = 0;

    // Inizia button functionality
    const startButton = document.getElementById("start-button");
    const introductionSection = document.getElementById("introduction-section");
    const questionsSection = document.getElementById("questions-section");
    const resultsSection = document.getElementById("results-section");
    const backButton = document.getElementById("back-btn");
    const nextButton = document.getElementById("next-btn");

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

        // Update navigation buttons visibility
        backButton.style.display = currentQuestion > 0 ? "inline-block" : "none";
        nextButton.style.display = isAnswerSelected() ? "inline-block" : "none";
    };

    // Function to check if an answer is selected for the current question
    const isAnswerSelected = () => {
        const currentQuestionDiv = document.querySelector(`#questions-div > #question[value="${currentQuestion}"]`);
        if (!currentQuestionDiv) return false;
        return currentQuestionDiv.querySelector(".answer-btn[data-selected]") !== null;
    };

    const goToResults = () => {
        questionsSection.style.display = "none";
        resultsSection.style.display = "block";
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
        if (currentQuestion < document.querySelectorAll("#questions-div > #question").length - 1 && isAnswerSelected()) {
            currentQuestion++;
            updateVisibleQuestion();
        }
        if (currentQuestion === document.querySelectorAll("#questions-div > #question").length - 1 && isAnswerSelected()){
            goToResults();
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