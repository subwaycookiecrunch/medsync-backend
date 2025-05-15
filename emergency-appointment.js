class EmergencyAppointmentAI {
  constructor() {
    // Doctor schedules and availability (would typically come from a backend API)
    this.doctorSchedules = {
      "Dr. Sarah Johnson": {
        specialty: "Cardiology",
        schedule: {
          "Monday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          "Tuesday": ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
          "Wednesday": [],
          "Thursday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          "Friday": ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"],
          "Saturday": ["10:00", "11:00", "12:00"],
          "Sunday": []
        },
        booked: {
          "2025-05-17": ["10:00", "11:00"],
          "2025-05-18": ["09:00", "14:00"],
          "2025-05-19": ["10:00", "15:00"]
        },
        emergencySlots: ["11:00", "15:00"]
      },
      "Dr. Michael Chen": {
        specialty: "Neurology",
        schedule: {
          "Monday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          "Tuesday": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
          "Wednesday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          "Thursday": [],
          "Friday": ["08:00", "09:00", "10:00", "11:00", "12:00"],
          "Saturday": ["10:00", "11:00", "12:00"],
          "Sunday": []
        },
        booked: {
          "2025-05-17": ["09:00", "14:00"],
          "2025-05-18": ["10:00", "15:00"],
          "2025-05-19": ["11:00", "16:00"]
        },
        emergencySlots: ["10:00", "14:00"]
      },
      "Dr. Robert Wilson": {
        specialty: "General Medicine",
        schedule: {
          "Monday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
          "Tuesday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          "Wednesday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          "Thursday": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          "Friday": ["09:00", "10:00", "11:00", "12:00", "13:00"],
          "Saturday": [],
          "Sunday": ["10:00", "11:00", "12:00"]
        },
        booked: {
          "2025-05-17": ["10:00"],
          "2025-05-18": ["14:00"],
          "2025-05-19": ["09:00", "15:00"]
        },
        emergencySlots: ["11:00", "16:00"]
      }
    };
    
    // Treatment priority mapping
    this.treatmentPriorities = {
      "Cardiology": ["heart attack", "chest pain", "arrhythmia", "hypertension", "heart failure"],
      "Neurology": ["stroke", "seizure", "severe headache", "dizziness", "numbness"],
      "General Medicine": ["high fever", "respiratory distress", "severe pain", "dehydration", "infection"]
    };
  }

  // Initialize the emergency appointment system
  initialize() {
    this.addEmergencyButtonToReports();
    this.createEmergencyModal();
  }

  // Add emergency appointment button to reports
  addEmergencyButtonToReports() {
    // Add a button to each tab content section
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabContents.forEach(tab => {
      const emergencyButton = document.createElement('button');
      emergencyButton.className = 'emergency-button';
      emergencyButton.innerHTML = '<i class="fas fa-exclamation-circle"></i> Request Emergency Appointment';
      emergencyButton.addEventListener('click', () => this.openEmergencyModal());
      
      // Insert the button at the beginning of each tab
      tab.insertBefore(emergencyButton, tab.firstChild);
    });
    
    // Add styles for the emergency button
    const style = document.createElement('style');
    style.textContent = `
      .emergency-button {
        background-color: var(--accent);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: all 0.3s ease;
      }
      
      .emergency-button:hover {
        background-color: #c0392b;
        transform: scale(1.02);
      }
      
      .emergency-button i {
        font-size: 1.2rem;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Create the emergency appointment modal
  createEmergencyModal() {
    const modalHTML = `
      <div id="emergency-modal" class="emergency-modal">
        <div class="emergency-modal-content">
          <div class="emergency-modal-header">
            <h2><i class="fas fa-exclamation-circle"></i> Emergency Appointment Request</h2>
            <span class="close-modal">&times;</span>
          </div>
          <div class="emergency-modal-body">
            <div class="emergency-step" data-step="1">
              <h3>What is the medical concern?</h3>
              <textarea id="medical-concern" placeholder="Briefly describe the symptoms or medical concern..."></textarea>
              <button class="ai-analyze-button">Analyze with AI <i class="fas fa-robot"></i></button>
              <div class="ai-thinking" style="display: none;">
                <i class="fas fa-spinner fa-spin"></i> AI analyzing your concern...
              </div>
              <div class="ai-recommendation" style="display: none;"></div>
            </div>
            
            <div class="emergency-step" data-step="2" style="display: none;">
              <h3>AI Recommended Specialist</h3>
              <div id="recommended-doctor" class="recommended-doctor">
                <div class="doctor-info">
                  <div class="doctor-avatar">
                    <i class="fas fa-user-md"></i>
                  </div>
                  <div class="doctor-details">
                    <h4 id="doctor-name">Dr. Name</h4>
                    <p id="doctor-specialty">Specialty</p>
                  </div>
                </div>
                <p id="ai-explanation" class="ai-explanation"></p>
              </div>
              <div class="appointment-options">
                <h4>Available Emergency Appointments</h4>
                <div id="appointment-slots" class="appointment-slots"></div>
              </div>
            </div>
            
            <div class="emergency-step" data-step="3" style="display: none;">
              <div class="confirmation-message">
                <i class="fas fa-check-circle"></i>
                <h3>Appointment Confirmed!</h3>
                <p id="confirmation-details"></p>
                <div class="booking-tips">
                  <h4>Preparation Tips:</h4>
                  <ul id="preparation-tips"></ul>
                </div>
              </div>
            </div>
          </div>
          <div class="emergency-modal-footer">
            <button id="modal-back-button" style="display: none;">Back</button>
            <button id="modal-next-button" disabled>Next</button>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to the page
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Add styles for the modal
    const style = document.createElement('style');
    style.textContent = `
      .emergency-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        justify-content: center;
        align-items: center;
      }
      
      .emergency-modal.active {
        display: flex;
        animation: fadeIn 0.3s;
      }
      
      .emergency-modal-content {
        background-color: white;
        border-radius: 10px;
        width: 90%;
        max-width: 700px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }
      
      .emergency-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background-color: var(--accent);
        color: white;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
      }
      
      .emergency-modal-header h2 {
        font-size: 1.5rem;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .close-modal {
        font-size: 2rem;
        cursor: pointer;
      }
      
      .emergency-modal-body {
        padding: 20px;
      }
      
      .emergency-modal-footer {
        padding: 15px 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        border-top: 1px solid #e0e0e0;
      }
      
      .emergency-modal-footer button {
        padding: 10px 20px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-weight: 600;
      }
      
      #modal-back-button {
        background-color: #f1f1f1;
        color: var(--primary);
      }
      
      #modal-next-button {
        background-color: var(--secondary);
        color: white;
      }
      
      #modal-next-button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
      
      .emergency-step h3 {
        margin-bottom: 15px;
        color: var(--primary);
      }
      
      #medical-concern {
        width: 100%;
        height: 120px;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
        margin-bottom: 15px;
        font-family: inherit;
        resize: none;
      }
      
      .ai-analyze-button {
        background-color: var(--secondary);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .ai-thinking {
        margin-top: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--secondary);
        font-style: italic;
      }
      
      .ai-recommendation {
        margin-top: 15px;
        padding: 15px;
        background-color: #f1f8ff;
        border-radius: 8px;
        border-left: 4px solid var(--secondary);
      }
      
      .recommended-doctor {
        background-color: #f9f9f9;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
      }
      
      .doctor-info {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 10px;
      }
      
      .doctor-avatar {
        width: 60px;
        height: 60px;
        background-color: var(--secondary);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
      }
      
      .doctor-details h4 {
        margin: 0 0 5px 0;
        color: var(--primary);
      }
      
      .doctor-details p {
        margin: 0;
        color: #7f8c8d;
      }
      
      .ai-explanation {
        color: #7f8c8d;
        font-style: italic;
      }
      
      .appointment-options h4 {
        margin-bottom: 10px;
        color: var(--primary);
      }
      
      .appointment-slots {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
        margin-bottom: 20px;
      }
      
      .appointment-slot {
        padding: 10px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .appointment-slot:hover:not(.selected) {
        background-color: #f5f5f5;
      }
      
      .appointment-slot.selected {
        background-color: var(--secondary);
        color: white;
        border-color: var(--secondary);
      }
      
      .appointment-day {
        font-weight: 600;
        display: block;
        margin-bottom: 5px;
      }
      
      .appointment-time {
        font-size: 0.9rem;
      }
      
      .confirmation-message {
        text-align: center;
        padding: 20px;
      }
      
      .confirmation-message i {
        font-size: 4rem;
        color: var(--success);
        margin-bottom: 15px;
      }
      
      .confirmation-message h3 {
        color: var(--success);
        margin-bottom: 15px;
      }
      
      #confirmation-details {
        font-size: 1.1rem;
        margin-bottom: 20px;
      }
      
      .booking-tips {
        text-align: left;
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
      }
      
      .booking-tips h4 {
        margin-bottom: 10px;
        color: var(--primary);
      }
      
      .booking-tips ul {
        padding-left: 20px;
      }
      
      .booking-tips li {
        margin-bottom: 5px;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    
    document.head.appendChild(style);
    
    // Set up event handlers
    this.setupModalEventHandlers();
  }

  // Set up event handlers for the modal
  setupModalEventHandlers() {
    const modal = document.getElementById('emergency-modal');
    const closeBtn = document.querySelector('.close-modal');
    const analyzeBtn = document.querySelector('.ai-analyze-button');
    const nextBtn = document.getElementById('modal-next-button');
    const backBtn = document.getElementById('modal-back-button');
    const medicalConcern = document.getElementById('medical-concern');
    
    // Close modal when clicking X
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
    
    // Enable next button when text is entered
    medicalConcern.addEventListener('input', () => {
      nextBtn.disabled = medicalConcern.value.trim() === '';
    });
    
    // Analyze button functionality
    analyzeBtn.addEventListener('click', () => {
      const concern = medicalConcern.value.trim();
      if (concern === '') return;
      
      // Show thinking indicator
      document.querySelector('.ai-thinking').style.display = 'flex';
      
      // Simulate AI analysis (would be an actual API call in production)
      setTimeout(() => {
        const analysisResult = this.analyzeEmergencyRequest(concern);
        
        // Hide thinking indicator and show recommendation
        document.querySelector('.ai-thinking').style.display = 'none';
        const recommendationEl = document.querySelector('.ai-recommendation');
        recommendationEl.style.display = 'block';
        recommendationEl.innerHTML = `
          <p><strong>AI Assessment:</strong> ${analysisResult.assessment}</p>
          <p><strong>Recommended Specialist:</strong> ${analysisResult.specialist} (${analysisResult.doctorName})</p>
          <p><strong>Urgency Level:</strong> <span style="color: ${this.getUrgencyColor(analysisResult.urgency)}; font-weight: bold;">${analysisResult.urgency}</span></p>
        `;
        
        // Enable the next button
        nextBtn.disabled = false;
        
        // Store analysis for next steps
        this.currentAnalysis = analysisResult;
      }, 2000);
    });
    
    // Next button functionality
    nextBtn.addEventListener('click', () => {
      const currentStep = document.querySelector('.emergency-step[style="display: block;"]') || 
                          document.querySelector('.emergency-step:not([style="display: none;"])');
      const currentStepNum = parseInt(currentStep.getAttribute('data-step'));
      const nextStepNum = currentStepNum + 1;
      const nextStep = document.querySelector(`.emergency-step[data-step="${nextStepNum}"]`);
      
      if (nextStep) {
        currentStep.style.display = 'none';
        nextStep.style.display = 'block';
        
        if (nextStepNum === 2) {
          this.populateAppointmentOptions();
          backBtn.style.display = 'block';
          nextBtn.disabled = true;
        } else if (nextStepNum === 3) {
          this.showConfirmation();
          backBtn.style.display = 'none';
          nextBtn.textContent = 'Close';
        } else if (nextStepNum > 3) {
          modal.classList.remove('active');
          this.resetEmergencyModal();
        }
      }
    });
    
    // Back button functionality
    backBtn.addEventListener('click', () => {
      const currentStep = document.querySelector('.emergency-step[style="display: block;"]');
      const currentStepNum = parseInt(currentStep.getAttribute('data-step'));
      const prevStepNum = currentStepNum - 1;
      const prevStep = document.querySelector(`.emergency-step[data-step="${prevStepNum}"]`);
      
      if (prevStep) {
        currentStep.style.display = 'none';
        prevStep.style.display = 'block';
        
        if (prevStepNum === 1) {
          backBtn.style.display = 'none';
          nextBtn.disabled = false;
        }
      }
    });
  }

  // Open the emergency modal
  openEmergencyModal() {
    const modal = document.getElementById('emergency-modal');
    modal.classList.add('active');
  }

  // Reset the modal to initial state
  resetEmergencyModal() {
    // Hide all steps except the first one
    document.querySelectorAll('.emergency-step').forEach((step, index) => {
      step.style.display = index === 0 ? 'block' : 'none';
    });
    
    // Reset form fields
    document.getElementById('medical-concern').value = '';
    document.querySelector('.ai-recommendation').style.display = 'none';
    
    // Reset buttons
    document.getElementById('modal-back-button').style.display = 'none';
    document.getElementById('modal-next-button').disabled = true;
    document.getElementById('modal-next-button').textContent = 'Next';
    
    // Clear selected appointment
    this.selectedAppointment = null;
  }

  // Analyze the emergency request (simulating AI)
  analyzeEmergencyRequest(concern) {
    concern = concern.toLowerCase();
    let specialist = "General Medicine";
    let doctorName = "Dr. Robert Wilson";
    let urgency = "Medium";
    let assessment = "Based on the symptoms described, this appears to be a general health concern.";
    
    // Check for cardiac symptoms
    if (concern.includes("chest pain") || concern.includes("heart") || 
        concern.includes("pressure") || concern.includes("palpitation") ||
        concern.includes("shortness of breath") || concern.includes("dizziness")) {
      specialist = "Cardiology";
      doctorName = "Dr. Sarah Johnson";
      urgency = "High";
      assessment = "The symptoms described suggest potential cardiac issues that should be evaluated promptly.";
    }
    
    // Check for neurological symptoms
    else if (concern.includes("headache") || concern.includes("numbness") || 
             concern.includes("tingling") || concern.includes("vision") ||
             concern.includes("speech") || concern.includes("confusion") ||
             concern.includes("seizure") || concern.includes("stroke")) {
      specialist = "Neurology";
      doctorName = "Dr. Michael Chen";
      urgency = "High";
      assessment = "The symptoms described suggest potential neurological issues that require prompt evaluation.";
    }
    
    return {
      specialist,
      doctorName,
      urgency,
      assessment
    };
  }

  // Get color for urgency level
  getUrgencyColor(urgency) {
    switch (urgency) {
      case "High": return "#e74c3c";
      case "Medium": return "#f39c12";
      case "Low": return "#2ecc71";
      default: return "#3498db";
    }
  }

  // Populate appointment options
  populateAppointmentOptions() {
    const doctorName = this.currentAnalysis.doctorName;
    const doctorData = this.doctorSchedules[doctorName];
    
    // Update doctor info in UI
    document.getElementById('doctor-name').textContent = doctorName;
    document.getElementById('doctor-specialty').textContent = doctorData.specialty;
    document.getElementById('ai-explanation').textContent = 
      `AI selected this specialist based on your symptoms related to ${doctorData.specialty.toLowerCase()}.`;
    
    // Generate appointment slots
    const slotsContainer = document.getElementById('appointment-slots');
    slotsContainer.innerHTML = '';
    
    // Get next 3 available days
    const availableDays = this.getNextAvailableDays(doctorName, 3);
    
    availableDays.forEach(dayInfo => {
      dayInfo.times.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'appointment-slot';
        slot.innerHTML = `
          <span class="appointment-day">${dayInfo.displayDate}</span>
          <span class="appointment-time">${this.formatTime(time)}</span>
        `;
        
        // Add data attributes for selection
        slot.dataset.date = dayInfo.date;
        slot.dataset.time = time;
        slot.dataset.doctor = doctorName;
        
        // Add click handler
        slot.addEventListener('click', () => {
          // Deselect any previously selected slot
          document.querySelectorAll('.appointment-slot.selected').forEach(el => {
            el.classList.remove('selected');
          });
          
          // Select this slot
          slot.classList.add('selected');
          
          // Store selection and enable next button
          this.selectedAppointment = {
            date: dayInfo.date,
            displayDate: dayInfo.displayDate,
            time: time,
            displayTime: this.formatTime(time),
            doctor: doctorName
          };
          
          document.getElementById('modal-next-button').disabled = false;
        });
        
        slotsContainer.appendChild(slot);
      });
    });
  }

  // Get next available days for appointments
  getNextAvailableDays(doctorName, count) {
    const doctorData = this.doctorSchedules[doctorName];
    const result = [];
    const today = new Date();
    let currentDate = new Date();
    
    while (result.length < count) {
      const dayName = this.getDayName(currentDate);
      const dateString = this.formatDate(currentDate);
      
      // Skip if no schedule for this day
      if (doctorData.schedule[dayName] && doctorData.schedule[dayName].length > 0) {
        // Get booked slots for this date
        const bookedSlots = doctorData.booked[dateString] || [];
        
        // Find available emergency slots
        const availableSlots = doctorData.schedule[dayName].filter(time => {
          return doctorData.emergencySlots.includes(time) && !bookedSlots.includes(time);
        });
        
        if (availableSlots.length > 0) {
          result.push({
            date: dateString,
            displayDate: this.formatDisplayDate(currentDate),
            day: dayName,
            times: availableSlots
          });
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Safety check to prevent infinite loop
      if (result.length === 0 && currentDate > new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)) {
        break;
      }
    }
    
    return result;
  }

  // Show confirmation details
  showConfirmation() {
    if (!this.selectedAppointment) return;
    
    const confirmationDetails = document.getElementById('confirmation-details');
    confirmationDetails.innerHTML = `
      Your emergency appointment with <strong>${this.selectedAppointment.doctor}</strong> has been confirmed for 
      <strong>${this.selectedAppointment.displayDate} at ${this.selectedAppointment.displayTime}</strong>.
    `;
    
    const tipsList = document.getElementById('preparation-tips');
    tipsList.innerHTML = `
      <li>Arrive 15 minutes before your appointment time.</li>
      <li>Bring any relevant medical records or test results.</li>
      <li>Make a list of your current medications.</li>
      <li>Write down your symptoms and when they started.</li>
      <li>Bring your insurance information.</li>
    `;
    
    // In a real application, would send this to the backend
    console.log("Appointment booked:", this.selectedAppointment);
  }

  // Helper function to get day name
  getDayName(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  // Helper function to format date
  formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  // Helper function to format display date
  formatDisplayDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  }

  // Helper function to format time
  formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hourInt = parseInt(hours);
    
    if (hourInt < 12) {
      return `${hourInt === 0 ? 12 : hourInt}:${minutes} AM`;
    } else {
      return `${hourInt === 12 ? 12 : hourInt - 12}:${minutes} PM`;
    }
  }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
  const emergencyAI = new EmergencyAppointmentAI();
  emergencyAI.initialize();
});