// DOM elements
const startSection = document.getElementById('start-section');
const questionSection = document.getElementById('question-section');
const questionText = document.getElementById('question-text');
const answersDiv = document.getElementById('answers');
const detailedExplanation = document.getElementById('detailed-explanation');
const resultsSection = document.getElementById('results-section');

// State management
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

// Fetch questions from JSON file
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        questions = data.questions;
        console.log('Questions loaded:', questions);
    } catch (error) {
        console.error('Failed to load questions:', error);
        alert('Errore durante il caricamento delle domande.');
    }
}

// Initialize the quiz
async function initializeQuiz() {
    await loadQuestions();
    if (questions.length > 0) {
        startSection.style.display = 'block';
    } else {
        alert('Nessuna domanda trovata nel file JSON.');
    }
}

// Start the quiz
function startQuiz() {
    startSection.style.display = 'none';
    questionSection.style.display = 'block';
    displayQuestion(currentQuestionIndex);
}

// Display a specific question
function displayQuestion(index) {
    const question = questions[index];
    questionText.textContent = `Domanda ${index + 1}: ${question.question}`;

    // Clear existing answers and append new ones
    answersDiv.innerHTML = '';
    const icons = ['strongly_agree', 'agree', 'moderate', 'disagree', 'strongly_disagree', 'uninterested'];
    icons.forEach((icon, i) => {
        const button = document.createElement('button');
        button.innerHTML = `<img src='icons/${icon}.png' alt='${icon}'>`;
        button.onclick = () => selectAnswer(i);
        answersDiv.appendChild(button);
    });

    // Clear and set detailed explanation
    detailedExplanation.innerHTML = '';
    const descriptionButton = document.createElement('button');
    descriptionButton.textContent = 'Mostra Spiegazione';
    descriptionButton.onclick = () => {
        detailedExplanation.textContent = question.description;
    };
    detailedExplanation.appendChild(descriptionButton);

    // Remove Next Question button if present
    const nextButton = document.getElementById('next-button');
    if (nextButton) nextButton.remove();
}

// Handle answer selection
function selectAnswer(answerIndex) {
    // Highlight the selected answer
    const buttons = answersDiv.querySelectorAll('button');
    buttons.forEach((btn, i) => {
        btn.style.border = i === answerIndex ? '2px solid blue' : 'none';
    });

    // Add Next Question button if not already present
    if (!document.getElementById('next-button')) {
        const nextButton = document.createElement('button');
        nextButton.id = 'next-button';
        nextButton.textContent = 'Prossima Domanda';
        nextButton.onclick = () => {
            storeAnswer(answerIndex);
            goToNextQuestion();
        };
        questionSection.appendChild(nextButton);
    }
}

// Store the selected answer
function storeAnswer(answerIndex) {
    userAnswers[currentQuestionIndex] = answerIndex;
}

// Go to the next question
function goToNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion(currentQuestionIndex);
    } else {
        endQuiz();
    }
}

// End the quiz
function endQuiz() {
    questionSection.style.display = 'none';
    resultsSection.style.display = 'block';
    // Placeholder for result processing logic
    console.log('User Answers:', userAnswers);
}

// Start the initialization process
initializeQuiz();
