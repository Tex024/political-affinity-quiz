// Fetching the questions from the JSON file and updating the HTML
window.addEventListener("load", () => {
  fetch("questions.json")
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          const questions = data.domande;
          const questionsDiv = document.getElementById("questions-div");

          questions.forEach((question, index) => {
              // Create a new question container
              const questionContainer = document.createElement("div");
              questionContainer.id = "question";
              questionContainer.setAttribute("value", index);

              // Add question text
              const questionText = document.createElement("div");
              questionText.id = "question-text";
              questionText.textContent = question.domanda;
              questionContainer.appendChild(questionText);

              // Add answers buttons
              const answersDiv = document.createElement("div");
              answersDiv.id = "answers";

              const answerTexts = [
                  "Fortemente d'accordo",
                  "D'accordo",
                  "Neutro",
                  "In disaccordo",
                  "Fortemente in disaccordo",
                  "Non interessato"
              ];

              answerTexts.forEach((text, value) => {
                  const answerBtn = document.createElement("button");
                  answerBtn.className = "answer-btn";
                  answerBtn.setAttribute("data-value", value);
                  answerBtn.textContent = text;
                  answersDiv.appendChild(answerBtn);
              });

              questionContainer.appendChild(answersDiv);

              // Add question description
              const questionDescription = document.createElement("div");
              questionDescription.id = "question-description";
              questionDescription.textContent = question.descrizione;
              questionContainer.appendChild(questionDescription);

              // Append the complete question to the questionsDiv
              questionsDiv.appendChild(questionContainer);
          });
      })
      .catch(error => {
          console.error("Error loading questions: ", error);
      });
});
