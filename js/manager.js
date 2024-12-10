let currentQuestionIndex = 0;
let userAnswers = [];
let questionsContainer = document.getElementById('questions-container');

document.addEventListener('DOMContentLoaded', async () => {
    await fetchQuestions();
    document.getElementById('start-btn').addEventListener('click', startQuiz);
});

function startQuiz() {
    document.getElementById('intro-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'block';
    showQuestion(currentQuestionIndex);
}

function showQuestion(index) {
    questionsContainer.innerHTML = ''; // Clear previous questions
    const questionTemplate = document.getElementById('questions-template').children[0].cloneNode(true);
    const questionData = getQuestions()[index];
    
    questionTemplate.querySelector('.question-text').innerText = questionData.question;
    questionTemplate.querySelector('.description-btn').addEventListener('click', () => {
        const descriptionText = questionTemplate.querySelector('.description-text');
        descriptionText.style.display = descriptionText.style.display === 'none' ? 'block' : 'none';
        descriptionText.innerText = questionData.description;
    });

    const answersDiv = questionTemplate.querySelectorAll('input');
    answersDiv.forEach(input => {
        input.checked = false;
        input.addEventListener('change', () => {
            document.getElementById('next-btn').style.display = 'inline';
        });
    });

    questionsContainer.appendChild(questionTemplate);

    document.getElementById('back-btn').style.display = index === 0 ? 'none' : 'inline';
    document.getElementById('next-btn').style.display = 'none';

    document.getElementById('back-btn').onclick = () => navigate('back');
    document.getElementById('next-btn').onclick = () => navigate('next');
}

function navigate(direction) {
    if (direction === 'next' && currentQuestionIndex < getQuestions().length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    } else if (direction === 'back' && currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    }
}

function getQuestions() {
    return questionData;
}
