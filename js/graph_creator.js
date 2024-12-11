// graph_creator.js
window.addEventListener("load", () => {
    const renderGraph = (totalX, totalY, numQuestions) => {
        // Grid size based on the number of questions (double for both directions)
        const gridSize = numQuestions * 2;
        const squareSize = 400 / gridSize; // Graph size fixed to 400px for this example
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");

        // Quadrant Colors
        const quadrantColors = {
            topLeft: "rgba(200, 255, 200, 0.5)", // Communitarismo + Progressismo
            topRight: "rgba(200, 200, 255, 0.5)", // Communitarismo + Conservazionismo
            bottomLeft: "rgba(255, 255, 200, 0.5)", // Liberalismo + Progressismo
            bottomRight: "rgba(255, 200, 200, 0.5)", // Liberalismo + Conservazionismo
        };

        // Draw grid and color quadrants
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = col * squareSize;
                const y = row * squareSize;

                // Determine quadrant color
                let color = "";
                if (row < gridSize / 2 && col < gridSize / 2) {
                    color = quadrantColors.topLeft;
                } else if (row < gridSize / 2 && col >= gridSize / 2) {
                    color = quadrantColors.topRight;
                } else if (row >= gridSize / 2 && col < gridSize / 2) {
                    color = quadrantColors.bottomLeft;
                } else {
                    color = quadrantColors.bottomRight;
                }

                ctx.fillStyle = color;
                ctx.fillRect(x, y, squareSize, squareSize);
                ctx.strokeStyle = "black";
                ctx.strokeRect(x, y, squareSize, squareSize);
            }
        }

        // Draw axes
        const center = 200; // Center at (200, 200) in a 400px canvas
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, center);
        ctx.lineTo(400, center);
        ctx.stroke();

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(center, 0);
        ctx.lineTo(center, 400);
        ctx.stroke();

        // Add axes labels
        ctx.font = "14px Arial";
        ctx.fillStyle = "black";

        // X-axis labels
        ctx.fillText("Progressismo", 5, center - 10);
        ctx.fillText("Conservazionismo", 350, center - 10);

        // Y-axis labels
        ctx.fillText("Communitarismo", center + 10, 15);
        ctx.fillText("Liberalismo", center + 10, 390);

        // Calculate user position in the grid
        const userX = center + totalX * squareSize;
        const userY = center - totalY * squareSize;

        // Draw user's position
        ctx.fillStyle = "black";
        ctx.fillRect(userX - squareSize / 2, userY - squareSize / 2, squareSize, squareSize);

        // Append canvas to the results section
        const resultsSection = document.getElementById("results-section");
        resultsSection.innerHTML = ""; // Clear existing content
        resultsSection.appendChild(canvas);
    };

    // Compute scores and render graph
    const calculateResults = () => {
        const questions = document.querySelectorAll("#questions-div > #question");
        let totalX = 0;
        let totalY = 0;

        questions.forEach((question, index) => {
            const selectedAnswer = question.querySelector(".answer-btn[data-selected]");
            if (selectedAnswer) {
                const responseIndex = parseInt(selectedAnswer.getAttribute("data-value"));

                // Assuming the JSON data with axes values is accessible
                const questionData = window.questionsData[index];
                totalX += questionData.assi["progressista-conservativo"][responseIndex];
                totalY += questionData.assi["liberalista-communitarista"][responseIndex];
            }
        });

        renderGraph(totalX, totalY, questions.length);
    };

    // Attach the results calculation to the results section
    const resultsSection = document.getElementById("results-section");
    const observer = new MutationObserver(() => {
        if (resultsSection.style.display === "block") {
            calculateResults();
        }
    });
    observer.observe(resultsSection, { attributes: true });
});
