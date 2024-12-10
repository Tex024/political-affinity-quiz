// File: js/graph_creator.js

function createGraph(results) {
    const canvas = document.createElement('canvas');
    const canvasSize = 400; // Size of the graph (width and height in pixels)
    canvas.width = canvasSize;
    canvas.height = canvasSize;
  
    const ctx = canvas.getContext('2d');
  
    const axisColor = '#000';
    const userPointColor = '#f00';
    const gridColor = '#ddd';
  
    const { totalX, totalY, maxX, minX, maxY, minY } = results;
  
    const scaleX = canvasSize / (maxX - minX); // Pixels per unit on X-axis
    const scaleY = canvasSize / (maxY - minY); // Pixels per unit on Y-axis
    const centerX = canvasSize / 2; // Graph center X-coordinate
    const centerY = canvasSize / 2; // Graph center Y-coordinate
  
    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let x = minX; x <= maxX; x++) {
      const xPos = centerX + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, canvasSize);
      ctx.stroke();
    }
    for (let y = minY; y <= maxY; y++) {
      const yPos = centerY - y * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(canvasSize, yPos);
      ctx.stroke();
    }
  
    // Draw axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, 0); // Y-axis
    ctx.lineTo(centerX, canvasSize);
    ctx.stroke();
  
    ctx.beginPath();
    ctx.moveTo(0, centerY); // X-axis
    ctx.lineTo(canvasSize, centerY);
    ctx.stroke();
  
    // Draw user point
    const userX = centerX + totalX * scaleX;
    const userY = centerY - totalY * scaleY;
  
    ctx.fillStyle = userPointColor;
    ctx.beginPath();
    ctx.arc(userX, userY, 5, 0, 2 * Math.PI);
    ctx.fill();
  
    return canvas;
  }
  
  function calculateResults(questions, userAnswers) {
    const results = {
      totalX: 0,
      totalY: 0,
      maxX: 0,
      minX: 0,
      maxY: 0,
      minY: 0,
    };
  
    questions.forEach((question, index) => {
      const selectedAnswerIndex = userAnswers[index];
  
      if (selectedAnswerIndex === undefined) return;
  
      const axes = question.assi;
  
      results.totalX += axes['progressista-conservativo'][selectedAnswerIndex];
      results.totalY += axes['liberalista-communitarista'][selectedAnswerIndex];
  
      results.maxX += Math.max(...axes['progressista-conservativo']);
      results.minX += Math.min(...axes['progressista-conservativo']);
      results.maxY += Math.max(...axes['liberalista-communitarista']);
      results.minY += Math.min(...axes['liberalista-communitarista']);
    });
  
    return results;
  }
  
  function displayResults(questions, userAnswers) {
    const resultsSection = document.getElementById('results-section');
  
    const results = calculateResults(questions, userAnswers);
    const graph = createGraph(results);
  
    resultsSection.appendChild(graph);
  }
  
  export { displayResults };
  