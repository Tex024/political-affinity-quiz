// quizManager.js

let questions = []; // Placeholder for fetched questions

// Fetch the questions from the JSON file
async function fetchQuestions() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        questions = data.questions; // Populate the questions array
        console.log('Questions loaded successfully', questions);
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// DOM elements
const startSection = document.getElementById('start-section');
const questionSection = document.getElementById('question-section');
const questionText = document.getElementById('question-text');
const answersDiv = document.getElementById('answers');
const detailedExplanation = document.getElementById('detailed-explanation');
const resultsSection = document.getElementById('results-section');

// State management
let currentQuestionIndex = 0;
let userAnswers = [];

// Initialize the quiz
function initialize() {
    fetchQuestions();
    
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', startQuiz);
    } else {
        console.error('Start button not found');
    }
}

// Start the quiz
function startQuiz() {
    startSection.style.display = 'none';
    questionSection.style.display = 'block';
    displayQuestion(currentQuestionIndex);
}

// Display a question
function displayQuestion(index) {
    const question = questions[index];
    if (!question) {
        console.error('No question found at index:', index);
        return;
    }

    questionText.textContent = `Domanda ${index + 1}: ${question.question}`;

    // Clear existing answers and dynamically generate new ones
    answersDiv.innerHTML = '';
    const icons = [
        'strongly_agree',
        'agree',
        'moderate',
        'disagree',
        'strongly_disagree',
        'uninterested'
    ];
    
    icons.forEach((icon, i) => {
        const button = document.createElement('button');
        button.innerHTML = `<img src="icons/${icon}.png" alt="${icon}">`;
        button.onclick = () => selectAnswer(i);
        answersDiv.appendChild(button);
    });

    // Handle the detailed explanation section
    detailedExplanation.innerHTML = '';
    const descriptionButton = document.createElement('button');
    descriptionButton.textContent = 'Mostra Spiegazione';
    descriptionButton.onclick = () => {
        detailedExplanation.textContent = question.description || "Nessuna spiegazione disponibile";
    };
    detailedExplanation.appendChild(descriptionButton);

    // Remove "Next Question" button if already exists
    const nextButton = document.getElementById('next-button');
    if (nextButton) nextButton.remove();
}

// Handle answer selection
function selectAnswer(answerIndex) {
    const buttons = answersDiv.querySelectorAll('button');
    
    buttons.forEach((btn, i) => {
        btn.style.border = i === answerIndex ? '2px solid blue' : 'none';
    });

    const nextButton = document.getElementById('next-button');
    if (!nextButton) {
        const btn = document.createElement('button');
        btn.id = 'next-button';
        btn.textContent = 'Prossima Domanda';
        btn.onclick = () => {
            storeAnswer(answerIndex);
            goToNextQuestion();
        };
        questionSection.appendChild(btn);
    }
}

// Store the selected answer
function storeAnswer(answerIndex) {
    userAnswers[currentQuestionIndex] = answerIndex;
}

// Handle transition to the next question
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
    console.log('User Answers:', userAnswers);
}

// Wait for DOM to fully load before executing scripts
document.addEventListener('DOMContentLoaded', initialize);
