// quizManager.js

import { UIManager } from './uiManager.js';
import { fetchQuestions } from './fetchQuestions.js';

export const QuizManager = (() => {
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];

    async function initialize() {
        questions = await fetchQuestions();
        if (questions.length > 0) {
            UIManager.showStartScreen();
            attachEventListeners();
        } else {
            console.error('No questions loaded');
        }
    }

    function attachEventListeners() {
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.onclick = startQuiz;
        }
    }

    function startQuiz() {
        UIManager.showQuestionScreen();
        displayQuestion();
    }

    function displayQuestion() {
        if (currentQuestionIndex < questions.length) {
            UIManager.renderQuestion(questions[currentQuestionIndex], currentQuestionIndex);
        } else {
            endQuiz();
        }
    }

    function handleAnswer(answerIndex) {
        userAnswers[currentQuestionIndex] = answerIndex;
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            endQuiz();
        }
    }

    function endQuiz() {
        UIManager.showResults();
        console.log('User Answers:', userAnswers);
    }

    return {
        initialize,
        handleAnswer
    };
})();
