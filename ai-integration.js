/**
 * AI Integration for MedSync Dashboards
 * This script adds AI functionality to both medical staff and family dashboards
 */

class AIIntegration {
  constructor() {
    this.aiModels = {
      nutrition: null,
      emergency: null,
      vitals: null,
      prediction: null
    };
    
    this.initialized = false;
    this.dashboardType = this.detectDashboardType();
  }
  
  // Detect which dashboard we're on
  detectDashboardType() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('medical')) {
      return 'medical';
    } else if (path.includes('family')) {
      return 'family';
    } else {
      // Default to medical if can't determine
      return 'medical';
    }
  }
  
  // Initialize AI integration
  async initialize() {
    if (this.initialized) return;
    
    console.log(`Initializing AI integration for ${this.dashboardType} dashboard...`);
    
    // Add the AI status indicator to the dashboard
    this.addAIStatusIndicator();
    
    // Initialize AI models based on dashboard type
    await this.initializeAIModels();
    
    // Add AI-specific UI elements to the dashboard
    this.enhanceDashboardWithAI();
    
    // Setup event listeners for AI interactions
    this.setupEventListeners();
    
    this.initialized = true;
    console.log('AI integration complete');
    
    // Update AI status to ready
    this.updateAIStatus('ready');
  }
  
  // Add AI status indicator to show when AI is working
  addAIStatusIndicator() {
    const statusHTML = `
      <div class="ai-status-indicator">
        <div class="ai-status-icon">
          <i class="fas fa-brain"></i>
        </div>
        <div class="ai-status-text">AI: Initializing...</div>
      </div>
    `;
    
    // Create and add styles
    const style = document.createElement('style');
    style.textContent = `
      .ai-status-indicator {
        position: fixed;
        top: 70px;
        right: 20px;
        background-color: rgba(44, 62, 80, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 100;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
      }
      
      .ai-status-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ai-status-indicator.ready {
        background-color: rgba(46, 204, 113, 0.9);
      }
      
      .ai-status-indicator.working {
        background-color: rgba(52, 152, 219, 0.9);
      }
      
      .ai-status-indicator.error {
        background-color: rgba(231, 76, 60, 0.9);
      }
      
      .ai-pulse {
        animation: ai-pulse 1.5s infinite;
      }
      
      @keyframes ai-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      
      .ai-feature-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin-bottom: 20px;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .ai-feature-header {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .ai-feature-title {
        font-weight: 600;
        font-size: 1.2rem;
        margin: 0;
        color: var(--primary);
      }
      
      .ai-badge {
        background-color: #3498db;
        color: white;
        padding: 3px 8px;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: 600;
      }
      
      .ai-feature-content {
        padding: 10px 0;
      }
      
      .ai-prediction {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
      }
      
      .ai-prediction-card {
        flex: 1;
        min-width: 200px;
        background-color: #f5f7fa;
        border-radius: 8px;
        padding: 15px;
        border-left: 4px solid #3498db;
      }
      
      .ai-prediction-title {
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 10px;
        color: var(--dark);
      }
      
      .ai-prediction-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary);
      }
      
      .ai-prediction-accuracy {
        font-size: 0.8rem;
        color: #777;
        margin-top: 5px;
      }
      
      .ai-action-button {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s ease;
      }
      
      .ai-action-button:hover {
        background-color: #2980b9;
      }
    `;
    
    document.head.appendChild(style);
    
    // Add the indicator to body
    const indicatorContainer = document.createElement('div');
    indicatorContainer.innerHTML = statusHTML;
    document.body.appendChild(indicatorContainer);
  }
  
  // Update AI status indicator
  updateAIStatus(status, message = null) {
    const statusIndicator = document.querySelector('.ai-status-indicator');
    const statusIcon = document.querySelector('.ai-status-icon i');
    const statusText = document.querySelector('.ai-status-text');
    
    if (!statusIndicator) return;
    
    // Remove all status classes
    statusIndicator.classList.remove('ready', 'working', 'error');
    statusIcon.classList.remove('ai-pulse');
    
    // Set new status
    switch (status) {
      case 'ready':
        statusIndicator.classList.add('ready');
        statusText.textContent = 'AI: Ready';
        break;
      case 'working':
        statusIndicator.classList.add('working');
        statusIcon.classList.add('ai-pulse');
        statusText.textContent = message || 'AI: Working...';
        break;
      case 'error':
        statusIndicator.classList.add('error');
        statusText.textContent = message || 'AI: Error';
        break;
      default:
        statusText.textContent = `AI: ${status}`;
    }
  }
  
  // Initialize AI models based on dashboard type
  async initializeAIModels() {
    // In a real app, you would load model weights or connect to an API
    // For demo purposes, we'll just simulate model loading
    
    this.updateAIStatus('working', 'AI: Loading models...');
    
    await this.simulateModelLoading('nutrition', 'Nutrition Analysis Model');
    
    if (this.dashboardType === 'medical') {
      await this.simulateModelLoading('prediction', 'Health Prediction Model');
      await this.simulateModelLoading('vitals', 'Vital Signs Analysis Model');
    }
    
    await this.simulateModelLoading('emergency', 'Emergency Assessment Model');
    
    console.log('All AI models loaded');
  }
  
  // Simulate loading a model with a delay
  async simulateModelLoading(modelName, displayName) {
    return new Promise(resolve => {
      this.updateAIStatus('working', `AI: Loading ${displayName}...`);
      
      setTimeout(() => {
        console.log(`Loaded ${displayName}`);
        this.aiModels[modelName] = true;
        resolve();
      }, 800 + Math.random() * 1200); // Random delay between 0.8-2 seconds
    });
  }
  
  // Enhance dashboard with AI-specific UI elements
  enhanceDashboardWithAI() {
    // Add modal containers for AI details
    this.addAIModalsToDOM();
    
    if (this.dashboardType === 'medical') {
      this.enhanceMedicalDashboard();
    } else {
      this.enhanceFamilyDashboard();
    }
    
    // Add common AI features to both dashboards
    this.addAINotificationsPanel();
  }
  
  // Add modals to the DOM
  addAIModalsToDOM() {
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
      .ai-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      
      .ai-modal-overlay.active {
        opacity: 1;
        visibility: visible;
      }
      
      .ai-modal {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        transform: translateY(20px);
        transition: all 0.3s ease;
        opacity: 0;
      }
      
      .ai-modal-overlay.active .ai-modal {
        transform: translateY(0);
        opacity: 1;
      }
      
      .ai-modal-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .ai-modal-title {
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--primary);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .ai-modal-close {
        background: none;
        border: none;
        font-size: 1.4rem;
        color: #777;
        cursor: pointer;
        transition: color 0.2s;
      }
      
      .ai-modal-close:hover {
        color: var(--primary);
      }
      
      .ai-modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }
      
      .ai-modal-footer {
        padding: 15px 20px;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      
      .ai-modal-button {
        padding: 8px 15px;
        border-radius: 4px;
        border: none;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .ai-modal-button.secondary {
        background-color: #f5f7fa;
        color: var(--primary);
      }
      
      .ai-modal-button.primary {
        background-color: var(--secondary);
        color: white;
      }
      
      .ai-modal-button:hover {
        transform: translateY(-2px);
      }
      
      .ai-prediction-detail {
        background-color: #f5f7fa;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        border-left: 4px solid var(--secondary);
      }
      
      .ai-prediction-detail-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      
      .ai-prediction-detail-title {
        font-weight: 600;
        font-size: 1.1rem;
      }
      
      .ai-prediction-detail-value {
        font-weight: 700;
        color: var(--primary);
      }
      
      .ai-prediction-detail-meta {
        display: flex;
        gap: 15px;
        font-size: 0.85rem;
        color: #777;
        margin-bottom: 10px;
      }
      
      .ai-prediction-detail-meta span {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .ai-prediction-detail-factors {
        margin-top: 15px;
      }
      
      .ai-prediction-detail-factors h4 {
        font-size: 0.9rem;
        margin-bottom: 8px;
        color: var(--primary);
      }
      
      .ai-factor-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      }
      
      .ai-factor-impact {
        font-weight: 600;
        width: 80px;
      }
      
      .ai-factor-impact.positive {
        color: #2ecc71;
      }
      
      .ai-factor-impact.negative {
        color: #e74c3c;
      }
      
      .ai-factor-impact.neutral {
        color: #f39c12;
      }
      
      .ai-recommendation-detail {
        background-color: #f5f7fa;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        border-left: 4px solid var(--success);
      }
      
      .ai-recommendation-priority {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      
      .ai-recommendation-priority.high {
        background-color: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
      }
      
      .ai-recommendation-priority.medium {
        background-color: rgba(243, 156, 18, 0.2);
        color: #f39c12;
      }
      
      .ai-recommendation-priority.low {
        background-color: rgba(52, 152, 219, 0.2);
        color: #3498db;
      }
      
      .ai-recommendation-text {
        margin: 10px 0;
        line-height: 1.5;
      }
      
      .ai-recommendation-rationale {
        font-size: 0.9rem;
        color: #777;
        padding: 10px;
        background-color: rgba(255, 255, 255, 0.7);
        border-radius: 4px;
      }
    `;
    
    document.head.appendChild(modalStyles);
    
    // Add modal containers
    const modalHTML = `
      <!-- AI Predictions Modal -->
      <div id="ai-predictions-modal" class="ai-modal-overlay">
        <div class="ai-modal">
          <div class="ai-modal-header">
            <h3 class="ai-modal-title"><i class="fas fa-brain"></i> AI Health Predictions</h3>
            <button class="ai-modal-close">&times;</button>
          </div>
          <div class="ai-modal-body" id="ai-predictions-content">
            <!-- Predictions content will be injected here -->
          </div>
          <div class="ai-modal-footer">
            <button class="ai-modal-button secondary close-modal">Close</button>
            <button class="ai-modal-button primary">Export Report</button>
          </div>
        </div>
      </div>
      
      <!-- AI Recommendations Modal -->
      <div id="ai-recommendations-modal" class="ai-modal-overlay">
        <div class="ai-modal">
          <div class="ai-modal-header">
            <h3 class="ai-modal-title"><i class="fas fa-robot"></i> AI Care Recommendations</h3>
            <button class="ai-modal-close">&times;</button>
          </div>
          <div class="ai-modal-body" id="ai-recommendations-content">
            <!-- Recommendations content will be injected here -->
          </div>
          <div class="ai-modal-footer">
            <button class="ai-modal-button secondary close-modal">Close</button>
            <button class="ai-modal-button primary">Apply Recommendations</button>
          </div>
        </div>
      </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
  }
  
  // Add AI features specific to the medical staff dashboard
  enhanceMedicalDashboard() {
    // Find the dashboard grid to add our AI cards
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (!dashboardGrid) return;
    
    // Add AI health prediction card
    const aiPredictionCard = document.createElement('div');
    aiPredictionCard.className = 'dashboard-card ai-enhanced';
    aiPredictionCard.innerHTML = `
      <div class="card-header">
        <i class="fas fa-brain"></i>
        <h2>AI Health Predictions</h2>
      </div>
      <p>Advanced machine learning predictions based on patient data.</p>
      <div class="ai-prediction">
        <div class="ai-prediction-card">
          <div class="ai-prediction-title">Hospital Readmission Risk</div>
          <div class="ai-prediction-value">12%</div>
          <div class="ai-prediction-accuracy">Confidence: 92%</div>
        </div>
        <div class="ai-prediction-card">
          <div class="ai-prediction-title">Medication Adherence</div>
          <div class="ai-prediction-value">87%</div>
          <div class="ai-prediction-accuracy">Confidence: 89%</div>
        </div>
      </div>
      <a class="card-link" href="#" id="view-ai-predictions">View Full Predictions →</a>
    `;
    
    // Add AI care recommendations card
    const aiRecommendationsCard = document.createElement('div');
    aiRecommendationsCard.className = 'dashboard-card ai-enhanced';
    aiRecommendationsCard.innerHTML = `
      <div class="card-header">
        <i class="fas fa-robot"></i>
        <h2>AI Care Recommendations</h2>
      </div>
      <p>AI-generated care recommendations based on patient patterns.</p>
      <ul class="ai-recommendation-list">
        <li>Increase fluid intake monitoring for hydration management</li>
        <li>Schedule follow-up blood test within 2 weeks</li>
        <li>Consider adjustment to current calcium supplement regimen</li>
      </ul>
      <a class="card-link" href="#" id="view-ai-recommendations">View All Recommendations →</a>
    `;
    
    // Add the AI cards to the dashboard
    dashboardGrid.appendChild(aiPredictionCard);
    dashboardGrid.appendChild(aiRecommendationsCard);
  }
  
  // Add AI features specific to the family dashboard
  enhanceFamilyDashboard() {
    // Find the dashboard grid to add our AI cards
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (!dashboardGrid) return;
    
    // Add AI health insights card
    const aiInsightsCard = document.createElement('div');
    aiInsightsCard.className = 'dashboard-card ai-enhanced';
    aiInsightsCard.innerHTML = `
      <div class="card-header">
        <i class="fas fa-lightbulb"></i>
        <h2>AI Health Insights</h2>
      </div>
      <p>Personalized insights based on your loved one's health data.</p>
      <div class="ai-insights-preview">
        <div class="insight-item">
          <i class="fas fa-arrow-up" style="color:#2ecc71"></i>
          <span>Activity level has improved 15% this week</span>
        </div>
        <div class="insight-item">
          <i class="fas fa-exclamation-triangle" style="color:#f39c12"></i>
          <span>Medication adherence decreased slightly</span>
        </div>
        <div class="insight-item">
          <i class="fas fa-info-circle" style="color:#3498db"></i>
          <span>Sleep quality is consistent with normal patterns</span>
        </div>
      </div>
      <a class="card-link" href="#" id="view-ai-insights">View All Insights →</a>
    `;
    
    // Add AI care summary card
    const aiSummaryCard = document.createElement('div');
    aiSummaryCard.className = 'dashboard-card ai-enhanced';
    aiSummaryCard.innerHTML = `
      <div class="card-header">
        <i class="fas fa-chart-pie"></i>
        <h2>AI Health Summary</h2>
      </div>
      <p>AI-generated summary of overall health status.</p>
      <div class="health-summary">
        <div class="summary-score">
          <div class="score-circle" style="--percentage: 82;">
            <span>82</span>
          </div>
          <div class="score-label">Health Score</div>
        </div>
        <div class="summary-text">
          Health status is stable with positive trends in cardiovascular function and nutrition. 
          Medication regimen is effective with no significant adverse effects detected.
        </div>
      </div>
      <a class="card-link" href="#" id="view-health-summary">View Full Summary →</a>
    `;
    
    // Add the AI cards to the dashboard
    dashboardGrid.appendChild(aiInsightsCard);
    dashboardGrid.appendChild(aiSummaryCard);
    
    // Add styles for health score circle
    const style = document.createElement('style');
    style.textContent = `
      .score-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: conic-gradient(
          #2ecc71 0% calc(var(--percentage) * 1%),
          #ecf0f1 calc(var(--percentage) * 1%) 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      
      .score-circle::before {
        content: '';
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: white;
      }
      
      .score-circle span {
        position: relative;
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--primary);
      }
      
      .health-summary {
        display: flex;
        align-items: center;
        gap: 20px;
        margin: 15px 0;
      }
      
      .score-label {
        font-size: 0.9rem;
        color: var(--dark);
        text-align: center;
        margin-top: 5px;
      }
      
      .summary-text {
        font-size: 0.9rem;
        line-height: 1.5;
      }
      
      .ai-insights-preview {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 15px 0;
      }
      
      .insight-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.9rem;
      }
      
      .ai-recommendation-list {
        padding-left: 20px;
        margin: 15px 0;
        font-size: 0.9rem;
        line-height: 1.5;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Add AI notifications panel to display AI alerts and suggestions
  addAINotificationsPanel() {
    const notificationsPanelHTML = `
      <div class="ai-notifications-panel">
        <div class="notifications-header">
          <h3>AI Insights & Notifications</h3>
          <button class="close-notifications"><i class="fas fa-times"></i></button>
        </div>
        <div class="notifications-body">
          <div class="notification-item priority-high">
            <div class="notification-icon"><i class="fas fa-exclamation-circle"></i></div>
            <div class="notification-content">
              <div class="notification-title">Medication Alert</div>
              <div class="notification-text">Potential interaction detected between Lisinopril and new prescription.</div>
              <div class="notification-time">10 minutes ago</div>
            </div>
          </div>
          <div class="notification-item priority-medium">
            <div class="notification-icon"><i class="fas fa-bell"></i></div>
            <div class="notification-content">
              <div class="notification-title">Appointment Reminder</div>
              <div class="notification-text">Follow-up cardiology appointment tomorrow at 10:00 AM.</div>
              <div class="notification-time">1 hour ago</div>
            </div>
          </div>
          <div class="notification-item priority-low">
            <div class="notification-icon"><i class="fas fa-lightbulb"></i></div>
            <div class="notification-content">
              <div class="notification-title">Health Insight</div>
              <div class="notification-text">Sleep pattern analysis suggests improving evening routine for better rest.</div>
              <div class="notification-time">2 hours ago</div>
            </div>
          </div>
        </div>
        <div class="notifications-footer">
          <button class="view-all-notifications">View All Notifications</button>
        </div>
      </div>
      <button class="ai-notifications-button">
        <i class="fas fa-robot"></i>
        <span class="notifications-badge">3</span>
      </button>
    `;
    
    // Add styles for the notifications panel
    const style = document.createElement('style');
    style.textContent = `
      .ai-notifications-panel {
        position: fixed;
        top: 70px;
        right: -350px;
        width: 320px;
        max-height: 80vh;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        transition: right 0.3s ease;
        overflow: hidden;
      }
      
      .ai-notifications-panel.active {
        right: 20px;
      }
      
      .notifications-header {
        padding: 15px;
        background-color: var(--primary);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .notifications-header h3 {
        margin: 0;
        font-size: 1rem;
      }
      
      .close-notifications {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1rem;
      }
      
      .notifications-body {
        flex: 1;
        overflow-y: auto;
        padding: 10px 15px;
        max-height: 60vh;
      }
      
      .notification-item {
        display: flex;
        gap: 10px;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 10px;
        background-color: #f5f7fa;
        transition: all 0.3s ease;
      }
      
      .notification-item:hover {
        background-color: #edf0f4;
      }
      
      .notification-item.priority-high {
        border-left: 3px solid #e74c3c;
      }
      
      .notification-item.priority-medium {
        border-left: 3px solid #f39c12;
      }
      
      .notification-item.priority-low {
        border-left: 3px solid #3498db;
      }
      
      .notification-icon {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .priority-high .notification-icon {
        background-color: rgba(231, 76, 60, 0.1);
        color: #e74c3c;
      }
      
      .priority-medium .notification-icon {
        background-color: rgba(243, 156, 18, 0.1);
        color: #f39c12;
      }
      
      .priority-low .notification-icon {
        background-color: rgba(52, 152, 219, 0.1);
        color: #3498db;
      }
      
      .notification-content {
        flex: 1;
      }
      
      .notification-title {
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 3px;
      }
      
      .notification-text {
        font-size: 0.85rem;
        margin-bottom: 5px;
        line-height: 1.4;
      }
      
      .notification-time {
        font-size: 0.75rem;
        color: #777;
      }
      
      .notifications-footer {
        padding: 10px 15px;
        border-top: 1px solid #eee;
      }
      
      .view-all-notifications {
        width: 100%;
        padding: 8px;
        background-color: #f5f7fa;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .view-all-notifications:hover {
        background-color: #edf0f4;
      }
      
      .ai-notifications-button {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: var(--primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 999;
        transition: all 0.3s ease;
        border: none;
      }
      
      .ai-notifications-button:hover {
        transform: scale(1.1);
      }
      
      .notifications-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: var(--accent);
        color: white;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }
    `;
    
    document.head.appendChild(style);
    
    // Add the notifications panel to body
    const notificationsContainer = document.createElement('div');
    notificationsContainer.innerHTML = notificationsPanelHTML;
    document.body.appendChild(notificationsContainer);
  }
  
  // Setup event listeners for AI interactions
  setupEventListeners() {
    // Toggle notifications panel
    const notificationsButton = document.querySelector('.ai-notifications-button');
    const notificationsPanel = document.querySelector('.ai-notifications-panel');
    const closeNotifications = document.querySelector('.close-notifications');
    
    if (notificationsButton && notificationsPanel && closeNotifications) {
      notificationsButton.addEventListener('click', () => {
        notificationsPanel.classList.add('active');
      });
      
      closeNotifications.addEventListener('click', () => {
        notificationsPanel.classList.remove('active');
      });
    }
    
    // Handle AI-specific buttons and links
    document.querySelectorAll('[id^="view-ai-"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const feature = button.id.replace('view-ai-', '');
        this.handleAIFeatureClick(feature);
      });
    });
    
    // Modal close buttons
    document.querySelectorAll('.ai-modal-close, .close-modal').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.ai-modal-overlay').forEach(modal => {
          modal.classList.remove('active');
        });
      });
    });
  }
  
  // Handle clicks on AI feature links
  handleAIFeatureClick(feature) {
    this.updateAIStatus('working', `AI: Processing ${feature}...`);
    
    // Process different AI features
    switch(feature) {
      case 'predictions':
        this.showAIPredictions();
        break;
      case 'recommendations':
        this.showAIRecommendations();
        break;
      case 'insights':
        this.showAIInsights();
        break;
      default:
        // Fallback for unimplemented features
        setTimeout(() => {
          console.log(`Handling AI feature: ${feature}`);
          this.updateAIStatus('ready');
          alert(`AI ${feature} would be displayed here in a real application.`);
        }, 1000);
    }
  }
  
  // Show AI Predictions in modal
  showAIPredictions() {
    const modal = document.getElementById('ai-predictions-modal');
    const contentArea = document.getElementById('ai-predictions-content');
    
    if (!modal || !contentArea) return;
    
    // Generate prediction content
    const predictionsHTML = `
      <div class="ai-prediction-detail">
        <div class="ai-prediction-detail-header">
          <div class="ai-prediction-detail-title">Hospital Readmission Risk</div>
          <div class="ai-prediction-detail-value">12%</div>
        </div>
        <div class="ai-prediction-detail-meta">
          <span><i class="fas fa-chart-line"></i> Trend: Decreasing</span>
          <span><i class="fas fa-check-circle"></i> Confidence: 92%</span>
          <span><i class="fas fa-calendar-alt"></i> Horizon: 30 days</span>
        </div>
        <p>Patient shows low risk of hospital readmission in the next 30 days. The risk has been decreasing over the past two weeks with continued medication adherence.</p>
        <div class="ai-prediction-detail-factors">
          <h4>Key Factors Affecting Risk:</h4>
          <div class="ai-factor-item">
            <div class="ai-factor-impact negative">High Impact</div>
            <div>Recent surgery increases risk</div>
          </div>
          <div class="ai-factor-item">
            <div class="ai-factor-impact positive">Medium Impact</div>
            <div>Good medication adherence decreases risk</div>
          </div>
          <div class="ai-factor-item">
            <div class="ai-factor-impact negative">Medium Impact</div>
            <div>Age increases risk</div>
          </div>
          <div class="ai-factor-item">
            <div class="ai-factor-impact positive">Low Impact</div>
            <div>Strong social support decreases risk</div>
          </div>
        </div>
      </div>
      
      <div class="ai-prediction-detail">
        <div class="ai-prediction-detail-header">
          <div class="ai-prediction-detail-title">Medication Adherence</div>
          <div class="ai-prediction-detail-value">87%</div>
        </div>
        <div class="ai-prediction-detail-meta">
          <span><i class="fas fa-chart-line"></i> Trend: Stable</span>
          <span><i class="fas fa-check-circle"></i> Confidence: 89%</span>
          <span><i class="fas fa-calendar-alt"></i> Period: Last 30 days</span>
        </div>
        <p>Patient has maintained good medication adherence over the past month, with occasional missed doses primarily in the evening routine.</p>
        <div class="ai-prediction-detail-factors">
          <h4>Recommendations to Improve Adherence:</h4>
          <div class="ai-factor-item">
            <div class="ai-factor-impact neutral">Medium Priority</div>
            <div>Simplify morning medication routine</div>
          </div>
          <div class="ai-factor-item">
            <div class="ai-factor-impact negative">High Priority</div>
            <div>Enable reminder notifications</div>
          </div>
          <div class="ai-factor-item">
            <div class="ai-factor-impact positive">Low Priority</div>
            <div>Review side effects with doctor</div>
          </div>
        </div>
      </div>
      
      <div class="ai-prediction-detail">
        <div class="ai-prediction-detail-header">
          <div class="ai-prediction-detail-title">Recovery Trajectory</div>
          <div class="ai-prediction-detail-value">65%</div>
        </div>
        <div class="ai-prediction-detail-meta">
          <span><i class="fas fa-chart-line"></i> Trend: Improving</span>
          <span><i class="fas fa-check-circle"></i> Confidence: 78%</span>
          <span><i class="fas fa-calendar-alt"></i> Horizon: 30 days</span>
        </div>
        <p>Patient is on track for recovery with steady improvement in mobility and functional capacity. Current trajectory suggests continued positive progress.</p>
        <div class="ai-prediction-detail-factors">
          <h4>Expected Recovery Milestones:</h4>
          <div class="ai-factor-item">
            <div class="ai-factor-impact positive">82% Probability</div>
            <div>Day 7: Expected return to light activities</div>
          </div>
          <div class="ai-factor-item">
            <div class="ai-factor-impact positive">75% Probability</div>
            <div>Day 14: Expected 80% recovery of mobility</div>
          </div>
          <div class="ai-factor-item">
            <div class="ai-factor-impact neutral">68% Probability</div>
            <div>Day 21: Expected return to normal routine</div>
          </div>
        </div>
      </div>
      
      <div class="ai-prediction-detail">
        <div class="ai-prediction-detail-header">
          <div class="ai-prediction-detail-title">Critical Health Events Risk</div>
          <div class="ai-prediction-detail-value">Low</div>
        </div>
        <div class="ai-prediction-detail-meta">
          <span><i class="fas fa-chart-line"></i> Trend: Stable</span>
          <span><i class="fas fa-check-circle"></i> Confidence: 85%</span>
          <span><i class="fas fa-calendar-alt"></i> Horizon: 30 days</span>
        </div>
        <p>Patient shows low risk for critical health events in the next 30 days based on current vital signs, medication regimen, and health history.</p>
        <div class="ai-prediction-detail-factors">
          <h4>Potential Events to Monitor:</h4>
          <div class="ai-factor-item">
            <div class="ai-factor-impact positive">5% Risk</div>
            <div>Hypoglycemic episode (7-14 days)</div>
          </div>
          <div class="ai-factor-item">
            <div class="ai-factor-impact positive">3% Risk</div>
            <div>Adverse medication reaction (1-30 days)</div>
          </div>
        </div>
      </div>
    `;
    
    contentArea.innerHTML = predictionsHTML;
    modal.classList.add('active');
    this.updateAIStatus('ready');
  }
  
  // Show AI Recommendations in modal
  showAIRecommendations() {
    const modal = document.getElementById('ai-recommendations-modal');
    const contentArea = document.getElementById('ai-recommendations-content');
    
    if (!modal || !contentArea) return;
    
    // Generate recommendations content
    const recommendationsHTML = `
      <div class="ai-recommendation-detail">
        <div class="ai-prediction-detail-header">
          <div class="ai-prediction-detail-title">Fluid Intake Monitoring</div>
          <div><span class="ai-recommendation-priority medium">Medium Priority</span></div>
        </div>
        <div class="ai-recommendation-text">
          Increase monitoring of daily fluid intake to ensure adequate hydration. Aim for 2000-2500ml per day with emphasis on morning and early afternoon consumption.
        </div>
        <div class="ai-recommendation-rationale">
          <strong>AI Rationale:</strong> Recent vital signs and lab values indicate mild dehydration patterns. Improved hydration will support medication efficacy and kidney function.
        </div>
      </div>
      
      <div class="ai-recommendation-detail">
        <div class="ai-prediction-detail-header">
          <div class="ai-prediction-detail-title">Follow-up Blood Test</div>
          <div><span class="ai-recommendation-priority high">High Priority</span></div>
        </div>
        <div class="ai-recommendation-text">
          Schedule comprehensive metabolic panel within 2 weeks to monitor electrolyte balance and kidney function following medication adjustment.
        </div>
        <div class="ai-recommendation-rationale">
          <strong>AI Rationale:</strong> Previous test results showed borderline potassium levels. Recent medication changes may affect electrolyte balance. Early monitoring will allow for timely intervention if needed.
        </div>
      </div>
      
      <div class="ai-recommendation-detail">
        <div class="ai-prediction-detail-header">
          <div class="ai-prediction-detail-title">Calcium Supplement Adjustment</div>
          <div><span class="ai-recommendation-priority medium">Medium Priority</span></div>
        </div>
        <div class="ai-recommendation-text">
          Consider adjusting current calcium supplement dosage or timing. Recommend taking with dinner instead of breakfast and evaluating for potential interaction with other morning medications.
        </div>
        <div class="ai-recommendation-rationale">
          <strong>AI Rationale:</strong> Pattern analysis shows potential absorption issues when calcium is taken with current morning medication regimen. Time separation may improve efficacy.
        </div>
      </div>
      
      <div class="ai-recommendation-detail">
        <div class="ai-prediction-detail-header">
          <div class="ai-prediction-detail-title">Physical Activity Progression</div>
          <div><span class="ai-recommendation-priority low">Low Priority</span></div>
        </div>
        <div class="ai-recommendation-text">
          Gradually increase daily walking duration from current 15 minutes to 25-30 minutes over the next three weeks. Monitor heart rate response and adjust pace accordingly.
        </div>
        <div class="ai-recommendation-rationale">
          <strong>AI Rationale:</strong> Recovery trajectory analysis indicates readiness for increased activity. Gradual progression will support cardiovascular conditioning while minimizing strain.
        </div>
      </div>
      
      <div class="ai-recommendation-detail">
        <div class="ai-prediction-detail-header">
          <div class="ai-prediction-detail-title">Sleep Pattern Optimization</div>
          <div><span class="ai-recommendation-priority medium">Medium Priority</span></div>
        </div>
        <div class="ai-recommendation-text">
          Implement a consistent sleep schedule with bedtime between 10-11 PM. Consider moving evening medication administration to 30 minutes earlier to reduce nighttime disruptions.
        </div>
        <div class="ai-recommendation-rationale">
          <strong>AI Rationale:</strong> Sleep monitoring indicates frequent disruptions 2-3 hours after bedtime, correlating with medication timing. Adjusted schedule may improve sleep quality and daytime alertness.
        </div>
      </div>
    `;
    
    contentArea.innerHTML = recommendationsHTML;
    modal.classList.add('active');
    this.updateAIStatus('ready');
  }
}

// Initialize AI integration when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const aiIntegration = new AIIntegration();
  aiIntegration.initialize();
}); 