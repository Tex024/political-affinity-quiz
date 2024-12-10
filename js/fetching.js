let questions = [];
let currentQuestionIndex = 0;

// Funzione per caricare il JSON di domande
async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    const data = await response.json();
    questions = data.questions;
    renderQuestion();
  } catch (error) {
    console.error('Errore nel caricamento delle domande:', error);
  }
}

// Funzione per visualizzare la domanda corrente
function renderQuestion() {
  const questionText = document.getElementById('question-text');
  const answerButtons = document.querySelectorAll('.answer-btn');
  const backButton = document.getElementById('back-btn');
  const nextButton = document.getElementById('next-btn');

  questionText.innerHTML = `<p>${questions[currentQuestionIndex].question}</p>`;
  answerButtons.forEach(btn => {
    btn.onclick = () => {
      answerButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      nextButton.style.display = 'inline';
    };
  });

  backButton.style.display = currentQuestionIndex > 0 ? 'inline' : 'none';
  nextButton.style.display = 'none';

  // Funzione per il pulsante Avanti
  nextButton.onclick = () => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
    } else {
      alert('Quiz completato!');
    }
  };

  // Funzione per il pulsante Indietro
  backButton.onclick = () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuestion();
    }
  };
}

// Avvia il quiz caricando le domande
document.addEventListener('DOMContentLoaded', () => {
  loadQuestions();
});

