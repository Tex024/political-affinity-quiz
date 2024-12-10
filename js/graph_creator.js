// Function to create the graph
export function createGraph(totalX, totalY) {
    const canvas = document.getElementById("graph");
    const ctx = canvas.getContext("2d");
    
    // Graph size and coordinates
    const graphSize = 400; // Make graph size fixed to 400x400
    const offset = graphSize / 2; // Centering the graph at (0, 0)
    
    // Axis values (range: -1 to 1 for each axis)
    const axisLimits = {
        xMin: -1,
        xMax: 1,
        yMin: -1,
        yMax: 1
    };

    // Scale factor for fitting the range into the canvas
    const scaleX = graphSize / (axisLimits.xMax - axisLimits.xMin);
    const scaleY = graphSize / (axisLimits.yMax - axisLimits.yMin);

    // Function to draw the graph background with colored sections
    const drawBackground = () => {
        // Divide the graph into four quadrants and color them
        ctx.fillStyle = "#add8e6"; // Liberal-Left: soft Blue
        ctx.fillRect(0, 0, offset, offset);
        
        ctx.fillStyle = "#f8f8a5"; // Liberal-Right: soft Yellow
        ctx.fillRect(offset, 0, offset, offset);
        
        ctx.fillStyle = "#98fb98"; // Communitarian-Left: soft Green
        ctx.fillRect(0, offset, offset, offset);
        
        ctx.fillStyle = "#ffcccb"; // Communitarian-Right: soft Red
        ctx.fillRect(offset, offset, offset, offset);
        
        // Add axis labels
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText("Liberal-Left", 20, 20);
        ctx.fillText("Liberal-Right", graphSize - 100, 20);
        ctx.fillText("Communitarian-Left", 20, graphSize - 20);
        ctx.fillText("Communitarian-Right", graphSize - 120, graphSize - 20);
    };

    // Draw the axes
    const drawAxes = () => {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        // X-axis (Progressista - Conservativo)
        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset, graphSize);
        ctx.stroke();

        // Y-axis (Liberalista - Communitarista)
        ctx.beginPath();
        ctx.moveTo(0, offset);
        ctx.lineTo(graphSize, offset);
        ctx.stroke();
    };

    // Function to draw the user's position on the graph
    const drawUserPosition = () => {
        // Convert totalX and totalY to graph coordinates
        const userX = offset + (totalX * scaleX);
        const userY = offset - (totalY * scaleY); // Invert Y-axis for canvas coordinates

        // Draw the user square (dark color)
        ctx.fillStyle = "darkgrey"; // Dark color for the user's square
        ctx.fillRect(userX - 5, userY - 5, 10, 10); // 10x10 square centered on the user's position
    };

    // Clear and redraw the graph
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawAxes();
    drawUserPosition();
}
