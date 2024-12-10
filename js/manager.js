document.addEventListener('DOMContentLoaded', () => {
  fetchQuestions(); // Fetch questions on page load

  const startButton = document.getElementById('start-button');
  const introSection = document.getElementById('introduction-section');
  const quizSection = document.getElementById('quiz-section');
  const questionsContainer = document.getElementById('questions-container');

  let currentQuestionIndex = 0;
  let selectedAnswers = [];

  // Handle the start button click
  startButton.addEventListener('click', () => {
      introSection.style.display = 'none';
      quizSection.style.display = 'block';
      renderQuestion();
  });

  function renderQuestion() {
      const questionData = questionsData[currentQuestionIndex];
      questionsContainer.innerHTML = generateQuestionHTML(questionData, currentQuestionIndex);
      attachEventListeners();
  }

  function generateQuestionHTML(question, index) {
      return `
          <div class="question">
              <h2>${question.question}</h2>
              <p style="cursor:pointer; color:blue;" onclick="alert('${question.description}')">Mostra Descrizione</p>
              <div class="answers">
                  <button class="answer-btn" data-value="strongly_disagree">Fortemente in disaccordo</button>
                  <button class="answer-btn" data-value="disagree">In disaccordo</button>
                  <button class="answer-btn" data-value="neutral">Neutro</button>
                  <button class="answer-btn" data-value="agree">D'accordo</button>
                  <button class="answer-btn" data-value="strongly_agree">Fortemente d'accordo</button>
                  <button class="answer-btn" data-value="uninterested">Non interessato</button>
              </div>
              <div class="navigation">
                  <button id="back-btn" style="display:none;">Indietro</button>
                  <button id="next-btn" style="display:none;">Avanti</button>
              </div>
          </div>
      `;
  }

  function attachEventListeners() {
      const answerButtons = document.querySelectorAll('.answer-btn');
      answerButtons.forEach(btn => {
          btn.addEventListener('click', () => {
              selectAnswer(btn.dataset.value);
          });
      });

      const nextBtn = document.getElementById('next-btn');
      const backBtn = document.getElementById('back-btn');

      backBtn.addEventListener('click', () => navigateQuestion(-1));
      nextBtn.addEventListener('click', () => navigateQuestion(1));
  }

  function selectAnswer(answer) {
      selectedAnswers[currentQuestionIndex] = answer; // Store selection
      const nextBtn = document.getElementById('next-btn');
      const backBtn = document.getElementById('back-btn');
      nextBtn.style.display = 'block';
      backBtn.style.display = 'block';
  }

  function navigateQuestion(direction) {
      currentQuestionIndex += direction;
      if (currentQuestionIndex >= 0 && currentQuestionIndex < questionsData.length) {
          renderQuestion();
      } else {
          alert('Fine del quiz!');
      }
  }
});
