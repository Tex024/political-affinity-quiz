let questionData = [];

async function fetchQuestions() {
    try {
        const response = await fetch('/data/questions.json');
        const data = await response.json();
        questionData = data.questions;
    } catch (error) {
        console.error('Errore nel caricamento delle domande:', error);
    }
}

function getQuestions() {
    return questionData;
}

// Ensure the fetch happens on page load
document.addEventListener('DOMContentLoaded', fetchQuestions);
