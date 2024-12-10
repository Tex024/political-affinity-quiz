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
                graphContainer.style.width = "500px";  // Adjust the size
                graphContainer.style.height = "500px"; // Adjust the size
                graphContainer.style.border = "2px solid black";
                graphContainer.style.marginTop = "20px";
                graphContainer.style.display = "block";
                resultsDiv.appendChild(graphContainer);

                // Define graph's center and scale
                const centerX = 250;
                const centerY = 250;
                const scale = 40; // 1 point = 40 pixels for better sizing

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

                // Add the user's position as a colored square (dark blue)
                const userSquare = document.createElement("div");
                userSquare.style.position = "absolute";
                userSquare.style.width = "10px";
                userSquare.style.height = "10px";
                userSquare.style.backgroundColor = "darkblue";
                userSquare.style.left = `${userX - 5}px`; // Center the square on the point
                userSquare.style.top = `${userY - 5}px`; // Center the square on the point
                graphContainer.appendChild(userSquare);

                // Color the four quadrants
                const quadrantColors = [
                    { top: 0, left: 0, backgroundColor: "lightblue" },  // Liberal-Left
                    { top: 0, left: centerX, backgroundColor: "lightyellow" },  // Liberal-Right
                    { top: centerY, left: 0, backgroundColor: "lightgreen" },  // Communitarian-Left
                    { top: centerY, left: centerX, backgroundColor: "lightcoral" }  // Communitarian-Right
                ];

                quadrantColors.forEach(({ top, left, backgroundColor }) => {
                    const quadrant = document.createElement("div");
                    quadrant.style.position = "absolute";
                    quadrant.style.width = `${centerX}px`;
                    quadrant.style.height = `${centerY}px`;
                    quadrant.style.backgroundColor = backgroundColor;
                    quadrant.style.top = `${top}px`;
                    quadrant.style.left = `${left}px`;
                    graphContainer.appendChild(quadrant);
                });

                // Add labels for the axes and quadrants
                const labelX1 = document.createElement("div");
                labelX1.textContent = "Conservatore";
                labelX1.style.position = "absolute";
                labelX1.style.top = `${centerY + 10}px`;
                labelX1.style.left = `${centerX + 10}px`;
                graphContainer.appendChild(labelX1);

                const labelX2 = document.createElement("div");
                labelX2.textContent = "Progressista";
                labelX2.style.position = "absolute";
                labelX2.style.top = `${centerY + 10}px`;
                labelX2.style.left = `${centerX - 110}px`;
                graphContainer.appendChild(labelX2);

                const labelY1 = document.createElement("div");
                labelY1.textContent = "Liberalista";
                labelY1.style.position = "absolute";
                labelY1.style.left = `${centerX + 10}px`;
                labelY1.style.top = `${centerY - 30}px`;
                graphContainer.appendChild(labelY1);

                const labelY2 = document.createElement("div");
                labelY2.textContent = "Communitarista";
                labelY2.style.position = "absolute";
                labelY2.style.left = `${centerX - 100}px`;
                labelY2.style.top = `${centerY - 30}px`;
                graphContainer.appendChild(labelY2);
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
