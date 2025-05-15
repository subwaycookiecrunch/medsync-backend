class NutrientAI {
  constructor() {
    this.userData = {
      history: [
        { date: '2023-05-01', protein: 65, carbs: 220, fats: 55, fiber: 18, vitaminA: 60, vitaminC: 70, calcium: 65, iron: 50 },
        { date: '2023-05-08', protein: 70, carbs: 210, fats: 58, fiber: 20, vitaminA: 65, vitaminC: 75, calcium: 67, iron: 55 },
        { date: '2023-05-15', protein: 72, carbs: 205, fats: 60, fiber: 22, vitaminA: 68, vitaminC: 80, calcium: 70, iron: 60 },
        { date: '2023-05-22', protein: 75, carbs: 200, fats: 59, fiber: 25, vitaminA: 72, vitaminC: 85, calcium: 75, iron: 62 },
        { date: '2023-05-29', protein: 78, carbs: 195, fats: 62, fiber: 28, vitaminA: 75, vitaminC: 90, calcium: 78, iron: 65 }
      ],
      targets: {
        protein: 80,
        carbs: 200,
        fats: 65,
        fiber: 30,
        vitaminA: 100,
        vitaminC: 100,
        calcium: 100,
        iron: 100
      }
    };
    
    this.insights = this.generateInsights();
  }
  
  // Initialize the AI nutrient monitoring dashboard
  initialize(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = this.createDashboardHTML();
    
    // Initialize the charts
    this.initializeProgressChart();
    this.initializeTrendChart();
    
    // Set up interactive elements
    this.setupInteractivity();
  }
  
  createDashboardHTML() {
    return `
      <div class="ai-nutrient-dashboard">
        <div class="ai-section">
          <div class="ai-header">
            <h3><i class="fas fa-brain"></i> AI Nutrition Insights</h3>
            <span class="ai-badge">Powered by AI</span>
          </div>
          <div class="insights-container">
            ${this.renderInsights()}
          </div>
        </div>
        
        <div class="ai-charts-container">
          <div class="ai-chart-section">
            <h4>Current Nutrition Status</h4>
            <div class="canvas-container">
              <canvas id="nutrientProgressChart"></canvas>
            </div>
          </div>
          
          <div class="ai-chart-section">
            <h4>Improvement Trends</h4>
            <div class="canvas-container">
              <canvas id="nutrientTrendChart"></canvas>
            </div>
          </div>
        </div>
        
        <div class="ai-recommendations">
          <h4><i class="fas fa-lightbulb"></i> Personalized Recommendations</h4>
          <div class="recommendation-cards">
            ${this.renderRecommendations()}
          </div>
        </div>
        
        <div class="ai-interaction">
          <div class="ai-input-container">
            <input type="text" id="nutrientQuestion" placeholder="Ask about your nutrition...">
            <button id="askNutrientAI"><i class="fas fa-paper-plane"></i></button>
          </div>
          <div class="ai-response" id="aiResponse"></div>
        </div>
      </div>
    `;
  }
  
  // Generate AI insights based on user data
  generateInsights() {
    const currentData = this.userData.history[this.userData.history.length - 1];
    const previousData = this.userData.history[this.userData.history.length - 2];
    const targets = this.userData.targets;
    
    const insights = [];
    
    // Deficiency insights
    const deficiencies = [];
    if (currentData.protein < targets.protein * 0.8) deficiencies.push('protein');
    if (currentData.fiber < targets.fiber * 0.7) deficiencies.push('fiber');
    if (currentData.calcium < targets.calcium * 0.7) deficiencies.push('calcium');
    if (currentData.iron < targets.iron * 0.6) deficiencies.push('iron');
    
    if (deficiencies.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Nutrient Deficiencies Detected',
        content: `You're currently not getting enough ${deficiencies.join(', ')} in your diet.`
      });
    }
    
    // Improvement insights
    const improvements = [];
    if (currentData.protein > previousData.protein) improvements.push('protein');
    if (currentData.fiber > previousData.fiber) improvements.push('fiber');
    if (currentData.vitaminC > previousData.vitaminC) improvements.push('vitamin C');
    
    if (improvements.length > 0) {
      insights.push({
        type: 'success',
        title: 'Progress Detected',
        content: `Great job! You've improved your ${improvements.join(', ')} intake since last week.`
      });
    }
    
    // Overall assessment
    const overallScore = (
      (currentData.protein / targets.protein) * 0.25 +
      (currentData.fiber / targets.fiber) * 0.15 +
      (currentData.vitaminA / targets.vitaminA) * 0.15 +
      (currentData.vitaminC / targets.vitaminC) * 0.15 +
      (currentData.calcium / targets.calcium) * 0.15 +
      (currentData.iron / targets.iron) * 0.15
    ) * 100;
    
    insights.push({
      type: 'info',
      title: 'Overall Nutrition Score',
      content: `Your nutrition score is ${Math.round(overallScore)}%. ${
        overallScore < 60 ? 'You have significant room for improvement.' :
        overallScore < 80 ? 'You\'re doing well, but can still improve.' :
        'Excellent! You\'re maintaining optimal nutrition.'
      }`
    });
    
    return insights;
  }
  
  renderInsights() {
    return this.insights.map(insight => `
      <div class="insight-card ${insight.type}">
        <div class="insight-icon">
          <i class="fas fa-${
            insight.type === 'warning' ? 'exclamation-triangle' :
            insight.type === 'success' ? 'check-circle' : 'info-circle'
          }"></i>
        </div>
        <div class="insight-content">
          <h5>${insight.title}</h5>
          <p>${insight.content}</p>
        </div>
      </div>
    `).join('');
  }
  
  renderRecommendations() {
    const currentData = this.userData.history[this.userData.history.length - 1];
    const targets = this.userData.targets;
    const recommendations = [];
    
    if (currentData.protein < targets.protein * 0.8) {
      recommendations.push({
        nutrient: 'Protein',
        icon: 'drumstick-bite',
        color: '#e74c3c',
        content: 'Increase protein intake by adding more lean meats, beans, or protein supplements to your diet.',
        foods: ['Chicken breast', 'Greek yogurt', 'Lentils', 'Tofu']
      });
    }
    
    if (currentData.fiber < targets.fiber * 0.7) {
      recommendations.push({
        nutrient: 'Fiber',
        icon: 'apple-alt',
        color: '#2ecc71',
        content: 'Add more high-fiber foods to improve digestion and gut health.',
        foods: ['Oats', 'Broccoli', 'Berries', 'Chia seeds']
      });
    }
    
    if (currentData.calcium < targets.calcium * 0.7) {
      recommendations.push({
        nutrient: 'Calcium',
        icon: 'bone',
        color: '#3498db',
        content: 'Strengthen your bones by consuming more calcium-rich foods.',
        foods: ['Milk', 'Cheese', 'Sardines', 'Kale']
      });
    }
    
    if (currentData.iron < targets.iron * 0.6) {
      recommendations.push({
        nutrient: 'Iron',
        icon: 'dumbbell',
        color: '#9b59b6',
        content: 'Combat fatigue by increasing your iron intake with these foods.',
        foods: ['Red meat', 'Spinach', 'Liver', 'Pumpkin seeds']
      });
    }
    
    return recommendations.map(rec => `
      <div class="recommendation-card">
        <div class="rec-header" style="background-color: ${rec.color}">
          <i class="fas fa-${rec.icon}"></i>
          <h5>${rec.nutrient}</h5>
        </div>
        <div class="rec-content">
          <p>${rec.content}</p>
          <div class="food-suggestions">
            ${rec.foods.map(food => `
              <span class="food-tag"><i class="fas fa-utensils"></i> ${food}</span>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }
  
  initializeProgressChart() {
    const ctx = document.getElementById('nutrientProgressChart').getContext('2d');
    const currentData = this.userData.history[this.userData.history.length - 1];
    const targets = this.userData.targets;
    
    const nutrients = ['Protein', 'Carbs', 'Fats', 'Fiber', 'Vitamin A', 'Vitamin C', 'Calcium', 'Iron'];
    const percentages = [
      (currentData.protein / targets.protein) * 100,
      (currentData.carbs / targets.carbs) * 100,
      (currentData.fats / targets.fats) * 100,
      (currentData.fiber / targets.fiber) * 100,
      (currentData.vitaminA / targets.vitaminA) * 100,
      (currentData.vitaminC / targets.vitaminC) * 100,
      (currentData.calcium / targets.calcium) * 100,
      (currentData.iron / targets.iron) * 100,
    ];
    
    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: nutrients,
        datasets: [{
          label: 'Current Intake (%)',
          data: percentages,
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(52, 152, 219, 1)',
          pointRadius: 4
        }, {
          label: 'Target (100%)',
          data: [100, 100, 100, 100, 100, 100, 100, 100],
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          borderColor: 'rgba(46, 204, 113, 1)',
          borderWidth: 1,
          pointRadius: 0,
          borderDash: [5, 5]
        }]
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            max: 120,
            ticks: {
              display: false
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${Math.round(context.raw)}%`;
              }
            }
          }
        }
      }
    });
  }
  
  initializeTrendChart() {
    const ctx = document.getElementById('nutrientTrendChart').getContext('2d');
    const history = this.userData.history;
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: history.map(entry => {
          const date = new Date(entry.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
          label: 'Protein',
          data: history.map(entry => entry.protein),
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          tension: 0.4,
          fill: false
        }, {
          label: 'Fiber',
          data: history.map(entry => entry.fiber),
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          tension: 0.4,
          fill: false
        }, {
          label: 'Calcium',
          data: history.map(entry => entry.calcium),
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4,
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Nutrient Progress Over Time',
            font: {
              size: 14
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Percentage of Target'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
  }
  
  setupInteractivity() {
    const questionInput = document.getElementById('nutrientQuestion');
    const askButton = document.getElementById('askNutrientAI');
    const responseContainer = document.getElementById('aiResponse');
    
    if (!questionInput || !askButton || !responseContainer) return;
    
    askButton.addEventListener('click', () => {
      const question = questionInput.value.trim();
      if (!question) return;
      
      responseContainer.innerHTML = '<div class="ai-thinking"><i class="fas fa-spinner fa-spin"></i> Analyzing your nutrition data...</div>';
      
      // Simulate AI response with setTimeout
      setTimeout(() => {
        const response = this.generateResponse(question);
        responseContainer.innerHTML = `
          <div class="ai-response-content">
            <div class="ai-avatar"><i class="fas fa-robot"></i></div>
            <div class="ai-message">${response}</div>
          </div>
        `;
        questionInput.value = '';
      }, 1500);
    });
    
    questionInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        askButton.click();
      }
    });
  }
  
  generateResponse(question) {
    question = question.toLowerCase();
    
    if (question.includes('protein') || question.includes('muscle')) {
      return 'Based on your data, you\'re currently at 78% of your protein target. To improve, try adding more lean meats, eggs, or plant-based proteins like lentils and tofu to your meals. I notice that you\'ve been making steady progress with protein intake over the past month!';
    }
    
    if (question.includes('calcium') || question.includes('bone')) {
      return 'Your calcium levels are at 78% of your target. This is better than last month, but still below optimal levels. Consider adding more dairy products, calcium-fortified plant milks, or leafy greens like kale and broccoli to your diet.';
    }
    
    if (question.includes('improve') || question.includes('better')) {
      return 'To improve your overall nutrition, focus first on your fiber intake (currently at 93% of target) and iron (at 65% of target). For fiber, add more whole grains, fruits, and vegetables. For iron, include more lean red meat, spinach, and lentils. Your vitamin C intake is excellent, which will help with iron absorption!';
    }
    
    if (question.includes('progress') || question.includes('improved')) {
      return 'You\'ve made excellent progress over the past month! Your nutrition score has improved from 65% to 78%, with the biggest improvements in fiber (+55%) and vitamin C (+28%). Keep up the great work!';
    }
    
    return 'Based on your nutrition data, I recommend focusing on a balanced diet with adequate protein, fiber, and micronutrients. Your recent trends show improvement, but there\'s still room to optimize your nutrition further. Would you like specific recommendations for any particular nutrient?';
  }
}

// Initialize the AI when page loads
document.addEventListener('DOMContentLoaded', function() {
  const nutrientAI = new NutrientAI();
  
  // Add styles programmatically
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .ai-nutrient-dashboard {
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 30px;
    }
    
    .ai-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;
    }
    
    .ai-header h3 {
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }
    
    .ai-badge {
      background-color: #3498db;
      color: white;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: bold;
    }
    
    .insights-container {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .insight-card {
      flex: 1;
      min-width: 200px;
      display: flex;
      gap: 10px;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .insight-card.warning {
      background-color: #fff5f5;
      border-left: 4px solid #e74c3c;
    }
    
    .insight-card.success {
      background-color: #f0fff4;
      border-left: 4px solid #2ecc71;
    }
    
    .insight-card.info {
      background-color: #f0f7ff;
      border-left: 4px solid #3498db;
    }
    
    .insight-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .insight-card.warning .insight-icon {
      color: #e74c3c;
    }
    
    .insight-card.success .insight-icon {
      color: #2ecc71;
    }
    
    .insight-card.info .insight-icon {
      color: #3498db;
    }
    
    .insight-content h5 {
      margin: 0 0 5px 0;
      font-size: 1rem;
    }
    
    .insight-content p {
      margin: 0;
      font-size: 0.9rem;
      color: #7f8c8d;
    }
    
    .ai-charts-container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .ai-chart-section {
      flex: 1;
      min-width: 300px;
    }
    
    .ai-chart-section h4 {
      margin-bottom: 10px;
      color: #2c3e50;
    }
    
    .canvas-container {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      height: 300px;
    }
    
    .ai-recommendations h4 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
      color: #2c3e50;
    }
    
    .recommendation-cards {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .recommendation-card {
      flex: 1;
      min-width: 220px;
      max-width: 280px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .rec-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 15px;
      color: white;
    }
    
    .rec-header h5 {
      margin: 0;
      font-size: 1rem;
    }
    
    .rec-content {
      padding: 15px;
      background-color: white;
    }
    
    .rec-content p {
      margin: 0 0 10px 0;
      font-size: 0.9rem;
      color: #7f8c8d;
    }
    
    .food-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    
    .food-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 8px;
      background-color: #f0f4f8;
      border-radius: 20px;
      font-size: 0.8rem;
      color: #2c3e50;
    }
    
    .ai-interaction {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }
    
    .ai-input-container {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .ai-input-container input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 25px;
      font-size: 0.9rem;
    }
    
    .ai-input-container button {
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .ai-input-container button:hover {
      background-color: #2980b9;
    }
    
    .ai-response {
      min-height: 60px;
    }
    
    .ai-thinking {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #7f8c8d;
      font-style: italic;
    }
    
    .ai-response-content {
      display: flex;
      gap: 15px;
      animation: fadeIn 0.5s ease-in-out;
    }
    
    .ai-avatar {
      width: 40px;
      height: 40px;
      background-color: #3498db;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    
    .ai-message {
      flex: 1;
      background-color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleElement);
  
  // Find container to initialize in
  const container = document.querySelector('.nutrient-ai-container');
  if (container) {
    nutrientAI.initialize(container.id);
  } else {
    // If no container exists, try to add it to the nutrients.html page
    const nutrientsSection = document.querySelector('.nutritional-chart');
    if (nutrientsSection) {
      const aiContainer = document.createElement('div');
      aiContainer.id = 'nutrientAiContainer';
      aiContainer.className = 'nutrient-ai-container';
      nutrientsSection.parentNode.insertBefore(aiContainer, nutrientsSection.nextSibling);
      nutrientAI.initialize('nutrientAiContainer');
    }
  }
}); 