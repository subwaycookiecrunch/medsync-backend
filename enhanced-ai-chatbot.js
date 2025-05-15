class EnhancedAIChatbot {
  constructor(options = {}) {
    this.options = {
      role: 'medical', // 'medical' or 'family'
      apiKey: options.apiKey || null, // OpenAI API key
      model: options.model || 'gpt-3.5-turbo', // Default model
      userName: 'User',
      userRole: 'Staff',
      ...options
    };
    
    this.chatHistory = [];
    this.isProcessing = false;
    this.capabilities = {
      medicalData: true,
      prescriptionInfo: this.options.role === 'medical',
      appointmentScheduling: true,
      emergencyResponse: true,
      nutritionAnalysis: true,
      medicationReminders: true
    };
    
    // Demo medical data (in a real app, this would come from a backend)
    this.medicalData = {
      vitals: {
        heartRate: 72,
        bloodPressure: "120/80",
        temperature: 98.6,
        oxygenSaturation: 98
      },
      medications: [
        { name: "Lisinopril", dosage: "10mg", schedule: "Once daily", purpose: "Blood pressure" },
        { name: "Metformin", dosage: "500mg", schedule: "Twice daily", purpose: "Diabetes" },
        { name: "Aspirin", dosage: "81mg", schedule: "Once daily", purpose: "Heart health" }
      ],
      appointments: [
        { doctor: "Dr. Johnson", specialty: "Cardiology", date: "2023-06-15", time: "10:00 AM" },
        { doctor: "Dr. Smith", specialty: "Primary Care", date: "2023-07-02", time: "2:30 PM" }
      ],
      alerts: [
        { type: "medication", message: "Metformin refill needed", urgency: "medium" },
        { type: "appointment", message: "Lab work due before next visit", urgency: "low" }
      ]
    };
    
    this.initialize();
  }
  
  initialize() {
    // Create and add chatbot HTML to the page
    this.createChatbotUI();
    this.attachEventListeners();
    
    // Add initial greeting message
    const greeting = this.options.role === 'medical' 
      ? `Hello Dr. ${this.options.userName}! I'm your MediAlert AI assistant. How can I help you with patient care today?`
      : `Hello ${this.options.userName}! I'm your MediAlert AI assistant. How can I help you monitor your loved one's health today?`;
    
    setTimeout(() => {
      this.addMessage(greeting, 'bot');
    }, 500);
  }
  
  createChatbotUI() {
    const chatbotHTML = `
      <div class="enhanced-ai-chatbot">
        <div class="chatbot-button">
          <i class="fas fa-robot"></i>
        </div>
        <div class="chatbot-panel">
          <div class="chatbot-header">
            <div class="chatbot-title">
              <i class="fas fa-robot"></i>
              <h3>MediAlert AI Assistant</h3>
              <div class="ai-badge">AI</div>
            </div>
            <div class="chatbot-controls">
              <button class="minimize-chat"><i class="fas fa-minus"></i></button>
              <button class="close-chat"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <div class="chatbot-body">
            <div class="messages-container"></div>
          </div>
          <div class="chatbot-suggestions">
            <div class="suggestion" data-query="What are the current vitals?">Current vitals</div>
            <div class="suggestion" data-query="When is the next appointment?">Next appointment</div>
            <div class="suggestion" data-query="Show medication schedule">Medications</div>
            <div class="suggestion" data-query="Are there any alerts?">Alerts</div>
          </div>
          <div class="chatbot-input">
            <textarea placeholder="Ask me anything..." rows="1"></textarea>
            <button class="send-message">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
          <div class="chatbot-footer">
            <span>Powered by MediAlert AI</span>
          </div>
        </div>
      </div>
    `;
    
    // Add CSS styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .enhanced-ai-chatbot {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        font-family: 'Segoe UI', Tahoma, sans-serif;
      }
      
      .chatbot-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #3498db;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
      }
      
      .chatbot-button i {
        font-size: 24px;
      }
      
      .chatbot-button:hover {
        transform: scale(1.1);
      }
      
      .chatbot-panel {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 350px;
        height: 500px;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        display: none;
        flex-direction: column;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .chatbot-panel.active {
        display: flex;
      }
      
      .chatbot-header {
        padding: 15px;
        background-color: #3498db;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .chatbot-title {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .chatbot-title h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .chatbot-controls {
        display: flex;
        gap: 10px;
      }
      
      .chatbot-controls button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 5px;
        font-size: 14px;
      }
      
      .ai-badge {
        background-color: #2ecc71;
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: bold;
      }
      
      .chatbot-body {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
      }
      
      .messages-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .message {
        max-width: 80%;
        padding: 10px 15px;
        border-radius: 18px;
        position: relative;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .bot-message {
        background-color: #f0f2f5;
        color: #333;
        border-bottom-left-radius: 5px;
        align-self: flex-start;
      }
      
      .user-message {
        background-color: #3498db;
        color: white;
        border-bottom-right-radius: 5px;
        align-self: flex-end;
      }
      
      .message-time {
        font-size: 10px;
        color: #888;
        margin-top: 5px;
        text-align: right;
      }
      
      .chatbot-suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 10px 15px;
        border-top: 1px solid #eee;
      }
      
      .suggestion {
        background-color: #f0f2f5;
        padding: 8px 12px;
        border-radius: 18px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .suggestion:hover {
        background-color: #e4e6ea;
      }
      
      .chatbot-input {
        padding: 15px;
        border-top: 1px solid #eee;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .chatbot-input textarea {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 8px 15px;
        resize: none;
        outline: none;
        font-family: inherit;
        max-height: 100px;
        transition: all 0.3s;
      }
      
      .chatbot-input textarea:focus {
        border-color: #3498db;
      }
      
      .chatbot-input button {
        background-color: #3498db;
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .chatbot-input button:hover {
        background-color: #2980b9;
      }
      
      .chatbot-footer {
        padding: 10px;
        text-align: center;
        font-size: 11px;
        color: #888;
        border-top: 1px solid #eee;
      }
      
      /* Elements for rich messages */
      .data-card {
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 10px;
        margin: 5px 0;
        overflow: hidden;
      }
      
      .data-card-header {
        background-color: #f5f7fa;
        padding: 8px 12px;
        font-weight: bold;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .data-card-body {
        padding: 10px;
      }
      
      .data-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-size: 13px;
      }
      
      .data-label {
        color: #777;
      }
      
      .data-value {
        font-weight: 500;
      }
      
      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
      }
      
      .typing-dot {
        width: 8px;
        height: 8px;
        background-color: #bbb;
        border-radius: 50%;
        opacity: 0.8;
        animation: typing-dot 1.4s infinite ease-in-out both;
      }
      
      .typing-dot:nth-child(1) { animation-delay: 0s; }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      
      @keyframes typing-dot {
        0%, 80%, 100% { transform: scale(0.7); }
        40% { transform: scale(1); opacity: 1; }
      }
    `;
    
    document.head.appendChild(styleElement);
    
    // Add HTML to body
    const chatbotContainer = document.createElement('div');
    chatbotContainer.innerHTML = chatbotHTML;
    document.body.appendChild(chatbotContainer);
    
    // Cache DOM elements
    this.elements = {
      chatbotButton: document.querySelector('.chatbot-button'),
      chatbotPanel: document.querySelector('.chatbot-panel'),
      closeButton: document.querySelector('.close-chat'),
      minimizeButton: document.querySelector('.minimize-chat'),
      messagesContainer: document.querySelector('.messages-container'),
      textarea: document.querySelector('.chatbot-input textarea'),
      sendButton: document.querySelector('.chatbot-input button'),
      suggestions: document.querySelectorAll('.suggestion')
    };
  }
  
  attachEventListeners() {
    // Toggle chatbot panel
    this.elements.chatbotButton.addEventListener('click', () => {
      this.elements.chatbotPanel.classList.add('active');
      this.elements.textarea.focus();
    });
    
    // Close chatbot
    this.elements.closeButton.addEventListener('click', () => {
      this.elements.chatbotPanel.classList.remove('active');
    });
    
    // Minimize chatbot
    this.elements.minimizeButton.addEventListener('click', () => {
      this.elements.chatbotPanel.classList.remove('active');
    });
    
    // Send message on button click
    this.elements.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });
    
    // Send message on Enter key (but allow Shift+Enter for new line)
    this.elements.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
      
      // Auto-resize textarea
      this.autoResizeTextarea();
    });
    
    // Handle suggestion clicks
    this.elements.suggestions.forEach(suggestion => {
      suggestion.addEventListener('click', () => {
        const query = suggestion.getAttribute('data-query');
        this.elements.textarea.value = query;
        this.sendMessage();
      });
    });
  }
  
  sendMessage() {
    const message = this.elements.textarea.value.trim();
    if (!message || this.isProcessing) return;
    
    // Add user message to chat
    this.addMessage(message, 'user');
    
    // Clear textarea and reset height
    this.elements.textarea.value = '';
    this.elements.textarea.style.height = 'auto';
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Process message and get response
    this.processUserMessage(message);
  }
  
  processUserMessage(message) {
    this.isProcessing = true;
    
    // Add the message to chat history for context
    if (this.chatHistory.length === 0) {
      // Add system message for context
      this.chatHistory.push({
        role: 'system',
        content: `You are a medical assistant in the MedSync healthcare application. ${
          this.options.role === 'medical' 
            ? 'You are helping medical staff monitor patients.'
            : 'You are helping family members monitor their loved ones.'
        } You have access to vital signs, medications, appointments, and health alerts.`
      });
    }
    
    // Add user message to history
    this.chatHistory.push({
      role: 'user',
      content: message
    });
    
    // If we have an API key, use the OpenAI API
    if (this.options.apiKey) {
      this.useOpenAIForResponse(message);
    } else {
      // Fallback to predefined responses
      setTimeout(() => {
        const response = this.generateFallbackResponse(message);
        this.hideTypingIndicator();
        this.addMessage(response.text, 'bot', response.extras);
        this.isProcessing = false;
      }, 1000 + Math.random() * 1000);
    }
  }
  
  async useOpenAIForResponse(message) {
    try {
      // Prepare message data for specific queries
      let specificData = null;
      const lowerMessage = message.toLowerCase();
      
      // Add relevant data to the query
      if (lowerMessage.includes('vital') || lowerMessage.includes('heart rate') || 
          lowerMessage.includes('blood pressure') || lowerMessage.includes('temperature')) {
        specificData = this.medicalData.vitals;
      }
      else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || 
               lowerMessage.includes('pill') || lowerMessage.includes('prescription')) {
        specificData = this.medicalData.medications;
      }
      else if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || 
               lowerMessage.includes('doctor') || lowerMessage.includes('visit')) {
        specificData = this.medicalData.appointments;
      }
      else if (lowerMessage.includes('alert') || lowerMessage.includes('warning') || 
               lowerMessage.includes('notification')) {
        specificData = this.medicalData.alerts;
      }
      
      // If we have specific data to include
      if (specificData) {
        this.chatHistory.push({
          role: 'system',
          content: `Current data: ${JSON.stringify(specificData)}`
        });
      }
      
      // Ensure we don't exceed token limits (keep only last 10 messages)
      if (this.chatHistory.length > 12) {
        // Keep system message and trim the rest
        const systemMessage = this.chatHistory[0];
        this.chatHistory = [systemMessage, ...this.chatHistory.slice(-9)];
      }
      
      // Make API request to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.options.apiKey}`
        },
        body: JSON.stringify({
          model: this.options.model,
          messages: this.chatHistory,
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      // Add AI response to chat history
      this.chatHistory.push({
        role: 'assistant',
        content: aiResponse
      });
      
      // Process response to check for extras/cards
      const responseObj = this.processAIResponse(aiResponse, message);
      
      this.hideTypingIndicator();
      this.addMessage(responseObj.text, 'bot', responseObj.extras);
      this.isProcessing = false;
      
    } catch (error) {
      console.error('Error with OpenAI API:', error);
      
      // Fallback to predefined responses
      const response = this.generateFallbackResponse(message);
      this.hideTypingIndicator();
      this.addMessage(response.text, 'bot', response.extras);
      this.isProcessing = false;
    }
  }
  
  processAIResponse(aiResponse, originalMessage) {
    // Check if we need to add any visual cards based on the content
    const lowerMessage = originalMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    // Check for data display needs
    if ((lowerMessage.includes('vital') || lowerResponse.includes('vital')) && 
        !lowerResponse.includes("don't have vital") && !lowerResponse.includes("don't have the vital")) {
      return {
        text: aiResponse,
        extras: {
          type: 'vitals',
          data: {
            heartRate: { value: this.medicalData.vitals.heartRate, unit: 'BPM' },
            bloodPressure: { value: this.medicalData.vitals.bloodPressure, unit: 'mmHg' },
            temperature: { value: this.medicalData.vitals.temperature, unit: '°F' },
            oxygenSaturation: { value: this.medicalData.vitals.oxygenSaturation, unit: '%' }
          }
        }
      };
    }
    else if ((lowerMessage.includes('medication') || lowerResponse.includes('medication') || 
              lowerMessage.includes('pill') || lowerResponse.includes('pill')) && 
             !lowerResponse.includes("don't have medication") && !lowerResponse.includes("don't have the medication")) {
      return {
        text: aiResponse,
        extras: {
          type: 'medications',
          data: this.medicalData.medications
        }
      };
    }
    else if ((lowerMessage.includes('appointment') || lowerResponse.includes('appointment')) && 
             !lowerResponse.includes("don't have appointment") && !lowerResponse.includes("don't have the appointment")) {
      return {
        text: aiResponse,
        extras: {
          type: 'appointments',
          data: this.medicalData.appointments
        }
      };
    }
    else if ((lowerMessage.includes('alert') || lowerResponse.includes('alert')) && 
             !lowerResponse.includes("no alert")) {
      return {
        text: aiResponse,
        extras: {
          type: 'alerts',
          data: this.medicalData.alerts
        }
      };
    }
    
    // Default: just return the text
    return {
      text: aiResponse,
      extras: null
    };
  }
  
  generateFallbackResponse(message) {
    // Original response generation logic (renamed from generateResponse)
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('vital') || lowerMessage.includes('heart rate') || 
        lowerMessage.includes('blood pressure') || lowerMessage.includes('temperature')) {
      return this.getVitalsResponse();
    } 
    else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || 
             lowerMessage.includes('pill') || lowerMessage.includes('prescription')) {
      return this.getMedicationsResponse();
    }
    else if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || 
             lowerMessage.includes('doctor') || lowerMessage.includes('visit')) {
      return this.getAppointmentsResponse();
    }
    else if (lowerMessage.includes('alert') || lowerMessage.includes('warning') || 
             lowerMessage.includes('notification')) {
      return this.getAlertsResponse();
    }
    else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || 
             lowerMessage.includes('capabilities')) {
      return this.getCapabilitiesResponse();
    }
    else if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || 
             lowerMessage.includes('critical')) {
      return this.getEmergencyResponse();
    }
    else if (lowerMessage.includes('analysis') || lowerMessage.includes('report') || 
             lowerMessage.includes('interpret')) {
      return this.getAnalysisResponse();
    }
    else {
      // Generic response
      const genericResponses = [
        "I'm here to help with medical monitoring and health information. Could you ask about vitals, medications, appointments, or alerts?",
        "I can provide information about patient vitals, medications, upcoming appointments, and alerts. What would you like to know?",
        "I'm your MedSync assistant. I can help with health monitoring, medication schedules, and appointment information. How can I assist you?",
        "I didn't quite understand that. I can help with vitals, medications, appointments, alerts, and emergency assistance. What do you need?"
      ];
      
      return {
        text: genericResponses[Math.floor(Math.random() * genericResponses.length)],
        extras: null
      };
    }
  }
  
  getVitalsResponse() {
    const vitals = this.medicalData.vitals;
    
    return {
      text: "Here are the current vital signs:",
      extras: {
        type: 'vitals',
        data: {
          heartRate: { value: vitals.heartRate, unit: 'BPM' },
          bloodPressure: { value: vitals.bloodPressure, unit: 'mmHg' },
          temperature: { value: vitals.temperature, unit: '°F' },
          oxygenSaturation: { value: vitals.oxygenSaturation, unit: '%' }
        }
      }
    };
  }
  
  getMedicationsResponse() {
    return {
      text: "Here are the current medications:",
      extras: {
        type: 'medications',
        data: this.medicalData.medications
      }
    };
  }
  
  getAppointmentsResponse() {
    return {
      text: "Here are the upcoming appointments:",
      extras: {
        type: 'appointments',
        data: this.medicalData.appointments
      }
    };
  }
  
  getAlertsResponse() {
    if (this.medicalData.alerts.length === 0) {
      return {
        text: "There are no active alerts at this time.",
        extras: null
      };
    }
    
    return {
      text: "Here are the current alerts:",
      extras: {
        type: 'alerts',
        data: this.medicalData.alerts
      }
    };
  }
  
  getCapabilitiesResponse() {
    return {
      text: "I can help you with the following:",
      extras: {
        type: 'capabilities',
        data: [
          "📊 Monitor vital signs and health metrics",
          "💊 Track medications and schedules",
          "📅 Manage doctor appointments",
          "🚨 Monitor health alerts and notifications",
          "🏥 Provide emergency assistance",
          "📈 Analyze health trends and reports",
          "🥗 Provide nutrition recommendations"
        ]
      }
    };
  }
  
  getEmergencyResponse() {
    return {
      text: "Do you need emergency assistance? Here are the emergency options:",
      extras: {
        type: 'emergency',
        data: {
          options: [
            { text: "Contact emergency services", action: "emergency_services" },
            { text: "Contact primary doctor", action: "contact_doctor" },
            { text: "Schedule urgent appointment", action: "urgent_appointment" }
          ]
        }
      }
    };
  }
  
  getAnalysisResponse() {
    return {
      text: "Here's a quick analysis of the health data:",
      extras: {
        type: 'analysis',
        data: {
          trends: "Vital signs are stable with heart rate showing normal variation throughout the day.",
          recommendations: "Continue current medication regimen. Consider increasing fluid intake to improve hydration levels.",
          concerns: "Slight elevation in evening blood pressure readings. Monitor for the next 3 days."
        }
      }
    };
  }
  
  showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'bot-message typing-indicator';
    typingIndicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    
    this.elements.messagesContainer.appendChild(typingIndicator);
    this.scrollToBottom();
  }
  
  hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  addMessage(text, sender, extras = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    // Add timestamp
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Basic text
    messageDiv.innerHTML = `
      <div class="message-content">${text}</div>
      <div class="message-time">${time}</div>
    `;
    
    // Add to messages container
    this.elements.messagesContainer.appendChild(messageDiv);
    
    // If there are extras, render them
    if (extras) {
      this.renderExtras(extras, messageDiv);
    }
    
    // Scroll to bottom
    this.scrollToBottom();
    
    // Add to chat history
    this.chatHistory.push({
      sender: sender,
      text: text,
      extras: extras,
      timestamp: now
    });
  }
  
  renderExtras(extras, messageDiv) {
    const extrasContainer = document.createElement('div');
    extrasContainer.className = 'message-extras';
    
    switch (extras.type) {
      case 'vitals':
        extrasContainer.innerHTML = this.renderVitalsCard(extras.data);
        break;
      case 'medications':
        extrasContainer.innerHTML = this.renderMedicationsCard(extras.data);
        break;
      case 'appointments':
        extrasContainer.innerHTML = this.renderAppointmentsCard(extras.data);
        break;
      case 'alerts':
        extrasContainer.innerHTML = this.renderAlertsCard(extras.data);
        break;
      case 'capabilities':
        extrasContainer.innerHTML = this.renderCapabilitiesList(extras.data);
        break;
      case 'emergency':
        extrasContainer.innerHTML = this.renderEmergencyOptions(extras.data);
        break;
      case 'analysis':
        extrasContainer.innerHTML = this.renderAnalysisCard(extras.data);
        break;
    }
    
    messageDiv.querySelector('.message-content').appendChild(extrasContainer);
  }
  
  renderVitalsCard(vitals) {
    return `
      <div class="data-card">
        <div class="data-card-header">
          <span>Vital Signs</span>
          <span class="data-timestamp">Now</span>
        </div>
        <div class="data-card-body">
          <div class="data-item">
            <span class="data-label">Heart Rate:</span>
            <span class="data-value">${vitals.heartRate.value} ${vitals.heartRate.unit}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Blood Pressure:</span>
            <span class="data-value">${vitals.bloodPressure.value} ${vitals.bloodPressure.unit}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Temperature:</span>
            <span class="data-value">${vitals.temperature.value} ${vitals.temperature.unit}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Oxygen Saturation:</span>
            <span class="data-value">${vitals.oxygenSaturation.value} ${vitals.oxygenSaturation.unit}</span>
          </div>
        </div>
      </div>
    `;
  }
  
  renderMedicationsCard(medications) {
    let medicationsHTML = '';
    
    medications.forEach(med => {
      medicationsHTML += `
        <div class="data-item">
          <span class="data-label">${med.name} (${med.dosage}):</span>
          <span class="data-value">${med.schedule}</span>
        </div>
      `;
    });
    
    return `
      <div class="data-card">
        <div class="data-card-header">
          <span>Medications</span>
        </div>
        <div class="data-card-body">
          ${medicationsHTML}
        </div>
      </div>
    `;
  }
  
  renderAppointmentsCard(appointments) {
    let appointmentsHTML = '';
    
    appointments.forEach(apt => {
      // Format date
      const date = new Date(apt.date);
      const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      appointmentsHTML += `
        <div class="data-item">
          <span class="data-label">${apt.doctor} (${apt.specialty}):</span>
          <span class="data-value">${formattedDate}, ${apt.time}</span>
        </div>
      `;
    });
    
    return `
      <div class="data-card">
        <div class="data-card-header">
          <span>Upcoming Appointments</span>
        </div>
        <div class="data-card-body">
          ${appointmentsHTML}
        </div>
      </div>
    `;
  }
  
  renderAlertsCard(alerts) {
    let alertsHTML = '';
    
    alerts.forEach(alert => {
      const urgencyClass = alert.urgency === 'high' ? 'urgent' : 
                         alert.urgency === 'medium' ? 'warning' : 'normal';
      
      alertsHTML += `
        <div class="data-item ${urgencyClass}">
          <span class="data-label">${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}:</span>
          <span class="data-value">${alert.message}</span>
        </div>
      `;
    });
    
    return `
      <div class="data-card">
        <div class="data-card-header">
          <span>Active Alerts</span>
        </div>
        <div class="data-card-body">
          ${alertsHTML}
        </div>
      </div>
    `;
  }
  
  renderCapabilitiesList(capabilities) {
    let capabilitiesHTML = '';
    
    capabilities.forEach(capability => {
      capabilitiesHTML += `<div class="capability-item">${capability}</div>`;
    });
    
    return `
      <div class="capabilities-list">
        ${capabilitiesHTML}
      </div>
    `;
  }
  
  renderEmergencyOptions(data) {
    let optionsHTML = '';
    
    data.options.forEach(option => {
      optionsHTML += `
        <button class="emergency-option" data-action="${option.action}">
          ${option.text}
        </button>
      `;
    });
    
    return `
      <div class="emergency-options">
        ${optionsHTML}
      </div>
    `;
  }
  
  renderAnalysisCard(analysis) {
    return `
      <div class="data-card">
        <div class="data-card-header">
          <span>Health Analysis</span>
        </div>
        <div class="data-card-body">
          <div class="data-item">
            <span class="data-label">Trends:</span>
            <span class="data-value">${analysis.trends}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Recommendations:</span>
            <span class="data-value">${analysis.recommendations}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Concerns:</span>
            <span class="data-value">${analysis.concerns}</span>
          </div>
        </div>
      </div>
    `;
  }
  
  scrollToBottom() {
    this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
  }
  
  autoResizeTextarea() {
    const textarea = this.elements.textarea;
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
  }
}

// Initialize the enhanced AI chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the family dashboard
  const isFamilyDashboard = window.location.href.includes('family') || 
                           document.title.includes('Family');
  
  // Only initialize on family dashboard
  if (isFamilyDashboard) {
    // Determine user role based on the current page
    const isMedicalStaff = window.location.href.includes('medical') || 
                           document.title.includes('Medical') || 
                           document.title.includes('Staff');
    
    // Create chatbot with appropriate role
    const chatbot = new EnhancedAIChatbot({
      role: isMedicalStaff ? 'medical' : 'family',
      userName: isMedicalStaff ? 'Dr. Smith' : 'John',
      userRole: isMedicalStaff ? 'Medical Staff' : 'Family Member'
    });
  }
}); 