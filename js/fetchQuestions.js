// fetchService.js
export async function fetchQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.questions;
    } catch (error) {
        console.error('Errore nel caricamento delle domande:', error);
        return [];
    }
}
