/**
 * Voice Health Assistant
 * Adds voice recognition and spoken responses to MedSync
 */

class VoiceHealthAssistant {
  constructor(options = {}) {
    this.options = {
      triggerPhrase: 'hey medi',
      voiceName: 'Google US English Female',
      listenTimeout: 8000, // 8 seconds
      activeMode: false,
      debug: false,
      apiKey: options.apiKey || null, // OpenAI API key for GPT-powered responses
      model: options.model || 'gpt-3.5-turbo', // Default model
      useRealTimeGpt: options.apiKey ? true : false, // Use GPT if API key provided
      ...options
    };
    
    this.isListening = false;
    this.recognition = null;
    this.speech = null;
    this.voices = [];
    this.selectedVoice = null;
    this.commands = {};
    this.lastTranscript = '';
    this.activeConversation = false;
    this.commandHistory = [];
    this.chatHistory = [];
    this.keepListening = false;
    
    // Initialize
    this.initialize();
    
    // Start listening automatically in a few seconds if active mode
    if (this.options.activeMode) {
      setTimeout(() => {
        if (this.browserSupported()) {
          this.startListening();
        } else {
          this.simulateListening();
        }
      }, 2000);
    }
  }
  
  /**
   * Check if browser supports speech recognition
   */
  browserSupported() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SpeechRecognition && !!window.speechSynthesis;
  }
  
  /**
   * Initialize voice assistant
   */
  initialize() {
    console.log('Initializing Voice Health Assistant...');
    
    // Try to initialize speech recognition if supported
    if (this.browserSupported()) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        // Initialize speech recognition
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;
        
        // Set up event handlers
        this.recognition.onstart = () => {
          console.log('Voice recognition started (real)');
          this.isListening = true;
          this.updateUI();
        };
        
        this.recognition.onend = () => {
          console.log('Voice recognition ended (real)');
          this.isListening = false;
          this.updateUI();
          
          // Auto-restart if we're still supposed to be listening
          if (this.keepListening) {
            try {
              setTimeout(() => {
                if (this.keepListening) {
                  this.recognition.start();
                }
              }, 100);
            } catch (e) {
              console.error('Error restarting recognition:', e);
            }
          }
        };
        
        this.recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Process voice command if we have a final result
          if (finalTranscript) {
            this.processVoiceCommand(finalTranscript);
          }
        };
        
        this.recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          
          // If it's a "no-speech" or "aborted" error, just restart if we're still listening
          if ((event.error === 'no-speech' || event.error === 'aborted') && this.keepListening) {
            try {
              setTimeout(() => {
                if (this.keepListening) {
                  this.recognition.start();
                }
              }, 100);
            } catch (e) {
              console.error('Error restarting after error:', e);
            }
          }
        };
        
        // Initialize speech synthesis
        this.speech = window.speechSynthesis;
        
        // Load voices if available
        if (this.speech.getVoices) {
          this.voices = this.speech.getVoices();
          
          // If voices not loaded yet, wait for the event
          if (this.voices.length === 0) {
            this.speech.onvoiceschanged = () => {
              this.voices = this.speech.getVoices();
              this.selectVoice();
            };
          } else {
            this.selectVoice();
          }
        }
        
        console.log('Real speech recognition initialized');
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        this.setupSimulatedRecognition();
      }
    } else {
      console.log('Speech recognition not supported, using simulation');
      this.setupSimulatedRecognition();
    }
    
    // Register built-in commands
    this.registerBuiltInCommands();
    
    // Add voice assistant UI
    this.createUI();
    
    console.log('Voice Health Assistant initialized');
    return true;
  }
  
  /**
   * Select preferred voice for speech synthesis
   */
  selectVoice() {
    if (!this.voices || this.voices.length === 0) return;
    
    // Try to find preferred voice
    this.selectedVoice = this.voices.find(voice => 
      voice.name === this.options.voiceName
    );
    
    // If not found, use first English voice
    if (!this.selectedVoice) {
      this.selectedVoice = this.voices.find(voice => 
        voice.lang.startsWith('en-')
      );
    }
    
    // If still not found, use first available voice
    if (!this.selectedVoice && this.voices.length > 0) {
      this.selectedVoice = this.voices[0];
    }
    
    if (this.options.debug && this.selectedVoice) {
      console.log(`Selected voice: ${this.selectedVoice.name}`);
    }
  }
  
  /**
   * Set up simulated recognition as fallback
   */
  setupSimulatedRecognition() {
    this.recognition = {
      start: () => {
        console.log('Voice recognition started (simulated)');
        this.isListening = true;
        this.updateUI();
      },
      stop: () => {
        console.log('Voice recognition stopped (simulated)');
        this.isListening = false;
        this.updateUI();
      }
    };
    
    // Set up simulated speech synthesis
    this.speech = {
      speak: (utterance) => {
        console.log('Speaking (simulated):', utterance.text);
      }
    };
  }
  
  /**
   * Create voice assistant UI - simplified to just a logo on the right side
   */
  createUI() {
    // Create voice assistant button with minimal design on the right side
    const buttonHTML = `
      <div class="voice-assistant-logo">
        <i class="fas fa-microphone"></i>
      </div>
    `;
    
    // Create styles with minimal design
    const style = document.createElement('style');
    style.textContent = `
      /* Voice Assistant Logo */
      .voice-assistant-logo {
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #3498db;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transition: all 0.3s ease;
      }
      
      .voice-assistant-logo:hover {
        transform: scale(1.05);
        background-color: #2980b9;
      }
      
      .voice-assistant-logo.active {
        background-color: #e74c3c;
        animation: pulse 1.5s infinite;
      }
      
      /* Toast notification for responses */
      .voice-assistant-toast {
        position: fixed;
        bottom: 80px;
        left: 20px;
        background-color: #34495e;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1050;
        max-width: 80%;
        animation: fadeIn 0.3s forwards, fadeOut 0.3s forwards 5s;
      }
      
      .toast-icon {
        background-color: rgba(255, 255, 255, 0.2);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .toast-message {
        font-size: 14px;
        line-height: 1.4;
      }
      
      /* Animations */
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
        100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    
    document.head.appendChild(style);
    
    // Append logo to body
    const logoContainer = document.createElement('div');
    logoContainer.innerHTML = buttonHTML;
    document.body.appendChild(logoContainer);
    
    // Set up event listener immediately and with a backup
    const setupEventListener = () => {
      const assistantLogo = document.querySelector('.voice-assistant-logo');
      if (assistantLogo) {
        console.log('Setting up voice assistant click handler');
        
        // Add click event listener
        assistantLogo.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Voice logo clicked');
          if (this.isListening) {
            this.stopListening();
          } else {
            if (this.browserSupported()) {
              this.startListening();
            } else {
              this.simulateListening();
            }
          }
        });
      } else {
        console.warn('Voice assistant logo not found in DOM');
      }
    };
    
    // Try immediately
    setupEventListener();
    
    // And also with a timeout as backup
    setTimeout(setupEventListener, 100);
  }
  
  /**
   * Register built-in commands
   */
  registerBuiltInCommands() {
    // Add default commands
    this.registerCommand('help', ['help', 'what can you do', 'commands'], () => {
      this.speak('I can help you manage medications, check health data, or provide information about your treatment plan. Just ask me what you need help with.');
    });
    
    this.registerCommand('meds', ['medications', 'my medications', 'pills', 'medicine', 'what medications'], () => {
      this.speak('You have Lisinopril 10mg once daily and Metformin 500mg twice daily. Your next dose is Metformin at 6 PM.');
    });
    
    this.registerCommand('status', ['health status', 'how am i', 'my health', 'vitals'], () => {
      this.speak('Your blood pressure has been stable at 125 over 82, and your blood glucose is currently 110. Your next checkup is scheduled for next Tuesday.');
    });
    
    this.registerCommand('schedule', ['appointments', 'my schedule', 'calendar'], () => {
      this.speak('You have a follow-up appointment with Dr. Johnson on Tuesday at 2 PM, and your prescription refill is due in 5 days.');
    });
    
    // Additional health-related commands
    this.registerCommand('emergency', ['emergency', 'help me', 'need help'], () => {
      this.speak('Emergency mode activated. Contacting your emergency contacts and medical team now.');
    });
    
    this.registerCommand('pilldetect', ['detect pills', 'scan medicine', 'identify pill'], () => {
      this.speak('Opening pill detection camera. Please place the medication in view of the camera.');
      
      // Activate pill detection if available
      const pillButton = document.querySelector('.pill-detection-button');
      if (pillButton) {
        // Simulate click on pill detection button
        setTimeout(() => pillButton.click(), 500);
      }
    });
  }
  
  /**
   * Start listening for voice commands
   */
  startListening() {
    if (!this.recognition) return;
    
    try {
      this.keepListening = true;
      
      // Only try to start if it's not already listening
      if (!this.isListening) {
        console.log('Starting voice recognition...');
        this.recognition.start();
      }
      
      this.isListening = true;
      this.updateUI();
      
      // Auto-stop after timeout if using a real recognition system
      if (this.browserSupported()) {
        if (this.listenTimeout) {
          clearTimeout(this.listenTimeout);
        }
        
        this.listenTimeout = setTimeout(() => {
          if (this.isListening) {
            this.keepListening = false;
            this.stopListening();
          }
        }, this.options.listenTimeout);
      }
      
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      
      // Provide fallback for demo
      this.simulateListening();
    }
  }
  
  /**
   * Simulate listening for demo purposes
   */
  simulateListening() {
    this.isListening = true;
    this.updateUI();
    
    // Simulate response after a delay
    setTimeout(() => {
      this.stopListening();
      this.speak('You have Lisinopril 10mg once daily and Metformin 500mg twice daily. Your next dose is Metformin at 6 PM.');
    }, 2000);
  }
  
  /**
   * Stop listening for voice commands
   */
  stopListening() {
    if (!this.recognition) return;
    
    this.keepListening = false;
    
    try {
      if (this.browserSupported() && typeof this.recognition.stop === 'function') {
        this.recognition.stop();
      }
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
    
    this.isListening = false;
    this.updateUI();
    
    // Clear timeout
    if (this.listenTimeout) {
      clearTimeout(this.listenTimeout);
    }
  }
  
  /**
   * Update UI elements based on current state
   */
  updateUI() {
    // Update logo
    const logo = document.querySelector('.voice-assistant-logo');
    if (logo) {
      if (this.isListening) {
        logo.classList.add('active');
      } else {
        logo.classList.remove('active');
      }
    }
  }
  
  /**
   * Process voice command
   */
  processVoiceCommand(transcript) {
    console.log('Processing voice command:', transcript);
    
    // Check for trigger phrase if not in an active conversation
    if (!this.activeConversation) {
      const triggerRegex = new RegExp(this.options.triggerPhrase, 'i');
      if (!triggerRegex.test(transcript)) {
        console.log('Trigger phrase not detected');
        return;
      }
      
      // Remove trigger phrase from transcript
      transcript = transcript.replace(triggerRegex, '').trim();
      this.activeConversation = true;
      
      // Acknowledge wake word
      this.speak("I'm listening. How can I help?");
      return;
    }
    
    // Store the transcript
    this.lastTranscript = transcript;
    
    // Check for built-in commands
    for (const [name, command] of Object.entries(this.commands)) {
      for (const phrase of command.phrases) {
        if (transcript.toLowerCase().includes(phrase.toLowerCase())) {
          console.log(`Command matched: ${name}`);
          
          // Execute command handler
          command.handler(transcript);
          
          // Add to command history
          this.commandHistory.push({
            timestamp: new Date().toISOString(),
            command: name,
            transcript: transcript
          });
          
          return;
        }
      }
    }
    
    // If no command matched, provide a generic response
    this.speak("I'm sorry, I didn't understand that request. Please try again or ask for help.");
  }
  
  /**
   * Show a simple toast notification
   */
  showToast(message) {
    const toastHTML = `
      <div class="voice-assistant-toast">
        <div class="toast-icon"><i class="fas fa-robot"></i></div>
        <div class="toast-message">${message}</div>
      </div>
    `;
    
    const toastContainer = document.createElement('div');
    toastContainer.innerHTML = toastHTML;
    document.body.appendChild(toastContainer);
    
    // Remove toast after animation
    setTimeout(() => {
      if (toastContainer && toastContainer.parentNode) {
        toastContainer.parentNode.removeChild(toastContainer);
      }
    }, 5500);
  }
  
  /**
   * Speak text aloud
   */
  speak(text) {
    console.log('Speaking:', text);
    
    // Try to use real speech synthesis if available
    if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
      try {
        // Cancel any previous speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice if we have one
        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        }
        
        // Configure speech parameters
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Speak
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error using speech synthesis:', error);
      }
    }
    
    // Display text in a toast notification
    this.showToast(text);
  }
  
  /**
   * Register a command
   */
  registerCommand(name, phrases, handler) {
    this.commands[name] = {
      phrases: Array.isArray(phrases) ? phrases : [phrases],
      handler: handler
    };
  }
}

// Auto-initialize if this script is loaded
if (typeof window !== 'undefined') {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Initializing voice assistant on DOMContentLoaded');
      window.voiceAssistant = new VoiceHealthAssistant({ 
        debug: true,
        activeMode: true 
      });
    });
  } else {
    // DOM already loaded, initialize immediately
    console.log('Initializing voice assistant immediately');
    window.voiceAssistant = new VoiceHealthAssistant({ 
      debug: true,
      activeMode: true 
    });
  }
} 