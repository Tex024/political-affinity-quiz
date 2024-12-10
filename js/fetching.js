let questionsData = [];

async function fetchQuestions() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        questionsData = data.questions; // Load all questions
        console.log('Domande caricate:', questionsData);
    } catch (error) {
        console.error('Errore nel caricamento delle domande:', error);
    }
}
