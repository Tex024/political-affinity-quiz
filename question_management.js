document.addEventListener('DOMContentLoaded', () => {
    const startSection = document.getElementById('start-section');
    const questionSection = document.getElementById('question-section');
    const questionText = document.getElementById('question-text');
    const answersDiv = document.getElementById('answers');
    const detailedExplanation = document.getElementById('detailed-explanation');
    const resultsSection = document.getElementById('results-section');

    let currentQuestionIndex = 0;
    let userAnswers = [];
    let questions = [];

    // Fetch questions from the JSON file
    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            if (!response.ok) {
                throw new Error('Failed to fetch questions');
            }
            const data = await response.json();
            questions = data.questions;
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    }

    // Start the quiz
    function startQuiz() {
        startSection.style.display = 'none';
        questionSection.style.display = 'block';
        displayQuestion();
    }

    // Display a question
    function displayQuestion() {
        const question = questions[currentQuestionIndex];
        if (!question) return; // Safety check

        questionText.textContent = `Domanda ${currentQuestionIndex + 1}: ${question.question}`;
        answersDiv.innerHTML = ''; // Clear previous answers
        detailedExplanation.textContent = question.description;
        detailedExplanation.style.display = 'none'; // Hide description by default

        // Add answer icons
        const answers = ['strongly_agree', 'agree', 'moderate', 'disagree', 'strongly_disagree', 'uninterested'];
        answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-button';
            button.innerHTML = `<img src="icons/${answer}.png" alt="${answer}">`;
            button.addEventListener('click', () => selectAnswer(index));
            answersDiv.appendChild(button);
        });

        // Add button to show detailed explanation
        const showDescriptionButton = document.createElement('button');
        showDescriptionButton.textContent = 'Mostra dettagli';
        showDescriptionButton.addEventListener('click', () => {
            detailedExplanation.style.display =
                detailedExplanation.style.display === 'none' ? 'block' : 'none';
        });
        questionSection.appendChild(showDescriptionButton);
    }

    // Handle answer selection
    function selectAnswer(answerIndex) {
        // Highlight selected answer
        Array.from(answersDiv.children).forEach((button, index) => {
            button.classList.toggle('selected', index === answerIndex);
        });

        // Show the "Next Question" button
        let nextButton = document.getElementById('next-button');
        if (!nextButton) {
            nextButton = document.createElement('button');
            nextButton.id = 'next-button';
            nextButton.textContent = 'Domanda successiva';
            nextButton.addEventListener('click', nextQuestion);
            questionSection.appendChild(nextButton);
        }
    }

    // Move to the next question
    function nextQuestion() {
        const selectedAnswer = Array.from(answersDiv.children).findIndex((button) =>
            button.classList.contains('selected')
        );

        if (selectedAnswer === -1) {
            alert('Per favore seleziona una risposta!');
            return;
        }

        userAnswers.push({ question: currentQuestionIndex, answer: selectedAnswer });
        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            endQuiz();
        }
    }

    // End the quiz
    function endQuiz() {
        questionSection.style.display = 'none';
        resultsSection.style.display = 'block';
        console.log('Risposte dell\'utente:', userAnswers);

        // Placeholder for displaying results
        resultsSection.innerHTML = '<h2>Grazie per aver completato il quiz!</h2>';
    }

    // Attach event listener to the Start Quiz button
    document.getElementById('start-button').addEventListener('click', startQuiz);

    // Load questions when the page loads
    loadQuestions().then(() => {
        console.log('Domande caricate:', questions);
    });
});
