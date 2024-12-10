// uiManager.js

export const UIManager = (() => {
    // DOM elements
    const startSection = document.getElementById('start-section');
    const questionSection = document.getElementById('question-section');
    const questionText = document.getElementById('question-text');
    const answersDiv = document.getElementById('answers');
    const detailedExplanation = document.getElementById('detailed-explanation');
    const resultsSection = document.getElementById('results-section');

    return {
        // Show the quiz's start page
        showStartScreen() {
            startSection.style.display = 'block';
            questionSection.style.display = 'none';
            resultsSection.style.display = 'none';
        },

        // Show the question screen
        showQuestionScreen() {
            startSection.style.display = 'none';
            questionSection.style.display = 'block';
        },

        // Display a question
        renderQuestion(question, index) {
            questionText.textContent = `Domanda ${index + 1}: ${question.question}`;
            answersDiv.innerHTML = '';
            
            const icons = ['strongly_agree', 'agree', 'moderate', 'disagree', 'strongly_disagree', 'uninterested'];
            icons.forEach((icon, i) => {
                const button = document.createElement('button');
                button.innerHTML = `<img src='icons/${icon}.png' alt='${icon}'>`;
                button.onclick = () => {
                    this.highlightAnswer(i);
                    window.selectAnswer(i);
                };
                answersDiv.appendChild(button);
            });

            // Handle detailed explanation logic
            detailedExplanation.innerHTML = '';
            const descriptionButton = document.createElement('button');
            descriptionButton.textContent = 'Mostra Spiegazione';
            descriptionButton.onclick = () => {
                detailedExplanation.textContent = question.description;
            };
            detailedExplanation.appendChild(descriptionButton);
        },

        // Highlight selected answer in UI
        highlightAnswer(answerIndex) {
            const buttons = answersDiv.querySelectorAll('button');
            buttons.forEach((btn, i) => {
                btn.style.border = i === answerIndex ? '2px solid blue' : 'none';
            });
        },

        // End the quiz and show the result screen
        showResults() {
            questionSection.style.display = 'none';
            resultsSection.style.display = 'block';
        }
    };
})();

