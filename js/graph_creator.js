// Create the graph for the results section
window.addEventListener("load", () => {
    // DOM references
    const resultsSection = document.getElementById("results-section");

    // Dimensions for the graph canvas
    const graphSize = 400; // Graph is 400x400 pixels
    const gridSize = 20; // Each square in the graph represents 20x20 pixels
    const halfGraphSize = graphSize / 2;

    // Create and append the canvas
    const canvas = document.createElement("canvas");
    canvas.width = graphSize;
    canvas.height = graphSize;
    canvas.style.border = "1px solid black";
    resultsSection.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    // Function to draw the graph grid
    const drawGrid = () => {
        ctx.clearRect(0, 0, graphSize, graphSize);

        // Draw background grid
        ctx.strokeStyle = "#e0e0e0";
        for (let x = 0; x <= graphSize; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, graphSize);
            ctx.stroke();
        }
        for (let y = 0; y <= graphSize; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(graphSize, y);
            ctx.stroke();
        }

        // Draw X and Y axes
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(halfGraphSize, 0);
        ctx.lineTo(halfGraphSize, graphSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, halfGraphSize);
        ctx.lineTo(graphSize, halfGraphSize);
        ctx.stroke();
    };

    // Function to calculate and render the user's position
    const renderUserPosition = (userScores) => {
        const { totalX, totalY } = userScores;

        // Translate graph coordinates to canvas coordinates
        const canvasX = halfGraphSize + totalX * gridSize;
        const canvasY = halfGraphSize - totalY * gridSize;

        // Draw the user's position as a colored square
        ctx.fillStyle = "#ff0000"; // Red for user's position
        ctx.fillRect(canvasX - gridSize / 2, canvasY - gridSize / 2, gridSize, gridSize);
    };

    // Function to calculate scores based on user's answers
    const calculateScores = () => {
        const questionsDiv = document.getElementById("questions-div");
        const questions = questionsDiv.querySelectorAll("#question");
        let totalX = 0;
        let totalY = 0;

        questions.forEach(question => {
            const selectedBtn = question.querySelector(".answer-btn[data-selected]");
            if (selectedBtn) {
                const responseIndex = parseInt(selectedBtn.getAttribute("data-value"), 10);
                const axesValues = JSON.parse(question.getAttribute("data-axes"));

                totalX += axesValues["progressista-conservativo"][responseIndex];
                totalY += axesValues["liberalista-communitarista"][responseIndex];
            }
        });

        return { totalX, totalY };
    };

    // Draw the grid initially
    drawGrid();

    // Calculate the scores and render the graph when results are displayed
    const showResults = () => {
        const userScores = calculateScores();
        renderUserPosition(userScores);
    };

    // Add event listener for when the results section is shown
    document.addEventListener("results:show", showResults);
});
