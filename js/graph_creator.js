window.addEventListener("load", () => {
    const questionsSection = document.getElementById("questions-section");
    const resultsSection = document.getElementById("results-section");
    const resultsDiv = document.querySelector("#results-section");

    let userAnswers = [];

    // Fetch the questions and map them to axis values
    fetch("questions.json")
        .then(response => response.json())
        .then(data => {
            const questions = data.domande;
            userAnswers = questions.map(() => ({
                progressistaConservativo: 0,
                liberalistaCommunitarista: 0
            }));

            // Function to calculate the graph
            const calculateScores = () => {
                let totalX = 0;
                let totalY = 0;

                questions.forEach((question, index) => {
                    const selectedButton = document.querySelector(`#questions-div > #question[value="${index}"] .answer-btn[data-selected="true"]`);
                    if (selectedButton) {
                        const answerIndex = Array.from(selectedButton.parentElement.children).indexOf(selectedButton);

                        // Add axis values based on selected answer
                        totalX += question.assi["progressista-conservativo"][answerIndex];
                        totalY += question.assi["liberalista-communitarista"][answerIndex];
                    }
                });

                // Generate the graph
                renderGraph(totalX, totalY);
            };

            // Render graph function
            const renderGraph = (totalX, totalY) => {
                resultsDiv.innerHTML = ""; // Clear any previous results

                // Create a container for the graph
                const graphContainer = document.createElement("div");
                graphContainer.style.position = "relative";
                graphContainer.style.width = "400px";
                graphContainer.style.height = "400px";
                graphContainer.style.border = "2px solid black";
                graphContainer.style.marginTop = "20px";
                graphContainer.style.display = "block";
                resultsDiv.appendChild(graphContainer);

                // Define graph's center and scale
                const centerX = 200;
                const centerY = 200;
                const scale = 50; // 1 point = 50 pixels

                // Calculate position for the user's square
                const userX = centerX + totalX * scale;
                const userY = centerY - totalY * scale;

                // Add axes (X and Y)
                const xAxis = document.createElement("div");
                xAxis.style.position = "absolute";
                xAxis.style.width = "100%";
                xAxis.style.height = "2px";
                xAxis.style.top = `${centerY - 1}px`;
                xAxis.style.backgroundColor = "black";
                graphContainer.appendChild(xAxis);

                const yAxis = document.createElement("div");
                yAxis.style.position = "absolute";
                yAxis.style.height = "100%";
                yAxis.style.width = "2px";
                yAxis.style.left = `${centerX - 1}px`;
                yAxis.style.backgroundColor = "black";
                graphContainer.appendChild(yAxis);

                // Add the user's position as a colored square
                const userSquare = document.createElement("div");
                userSquare.style.position = "absolute";
                userSquare.style.width = "10px";
                userSquare.style.height = "10px";
                userSquare.style.backgroundColor = "blue";
                userSquare.style.left = `${userX - 5}px`; // Center the square on the point
                userSquare.style.top = `${userY - 5}px`; // Center the square on the point
                graphContainer.appendChild(userSquare);

                // Add labels for the axes (optional)
                const labelX = document.createElement("div");
                labelX.textContent = "Conservatore";
                labelX.style.position = "absolute";
                labelX.style.top = `${centerY + 10}px`;
                labelX.style.left = `${centerX + 10}px`;
                graphContainer.appendChild(labelX);

                const labelY = document.createElement("div");
                labelY.textContent = "Liberalista";
                labelY.style.position = "absolute";
                labelY.style.left = `${centerX + 10}px`;
                labelY.style.top = `${centerY - 30}px`;
                graphContainer.appendChild(labelY);
            };

            // Trigger graph calculation once the user has completed the quiz
            const finishButton = document.createElement("button");
            finishButton.textContent = "Visualizza Risultati";
            finishButton.addEventListener("click", calculateScores);
            resultsDiv.appendChild(finishButton);
        })
        .catch(error => {
            console.error("Error loading questions: ", error);
        });
});
