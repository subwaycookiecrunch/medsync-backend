/**
 * Pill Detection Module for MedSync
 * Uses computer vision to identify medications and verify patient adherence
 */

class PillDetection {
  constructor(options = {}) {
    this.options = {
      modelPath: 'models/pill-detection-model',
      minConfidence: 0.7,
      enableRealTimeDetection: true,
      apiKey: options.apiKey || null, // For cloud-based detection API
      enableCloudApi: options.apiKey ? true : false,
      enableMedicationVerification: true,
      enableAdherenceTracking: true,
      debug: false,
      ...options
    };
    
    this.isInitialized = false;
    this.isDetecting = false;
    this.currentStream = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.model = null;
    this.detectedMedications = [];
    this.listeners = [];
    this.medicationDatabase = {
      // Simplified medication database with common pills and their visual characteristics
      medications: [
        {
          name: "Lisinopril",
          dosages: ["10mg", "20mg", "40mg"],
          colors: ["white", "yellow", "pink"],
          shapes: ["round", "oval"],
          markings: ["10", "20", "40", "LUPIN", "WATSON"]
        },
        {
          name: "Metformin",
          dosages: ["500mg", "850mg", "1000mg"],
          colors: ["white", "yellow"],
          shapes: ["round", "oval"],
          markings: ["500", "850", "1000", "TEVA", "93"]
        },
        {
          name: "Aspirin",
          dosages: ["81mg", "325mg"],
          colors: ["orange", "white"],
          shapes: ["round"],
          markings: ["81", "325", "BAYER"]
        },
        {
          name: "Atorvastatin",
          dosages: ["10mg", "20mg", "40mg", "80mg"],
          colors: ["white", "yellow", "pink", "red"],
          shapes: ["oval", "round"],
          markings: ["10", "20", "40", "80", "PD", "LIPITOR"]
        }
      ]
    };
  }
  
  /**
   * Initialize the pill detection system
   */
  async initialize() {
    if (this.isInitialized) return true;
    
    // Create UI elements
    this.createUI();
    
    // Try to load TensorFlow.js if available
    if (typeof tf === 'undefined') {
      try {
        await this.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
        if (this.options.debug) {
          console.log('TensorFlow.js loaded');
        }
      } catch (err) {
        console.error('Failed to load TensorFlow.js:', err);
        // Fall back to cloud API only mode
        this.options.enableCloudApi = true;
      }
    }
    
    // Load model if using local detection
    if (!this.options.enableCloudApi && typeof tf !== 'undefined') {
      try {
        await this.loadModel();
      } catch (err) {
        console.error('Failed to load pill detection model:', err);
        // Fall back to cloud API
        this.options.enableCloudApi = true;
      }
    }
    
    this.isInitialized = true;
    
    if (this.options.enableRealTimeDetection) {
      this.startVideoStream();
    }
    
    return true;
  }
  
  /**
   * Load TensorFlow.js model for pill detection
   */
  async loadModel() {
    try {
      // For the demo, we'll just simulate model loading
      // In a real implementation, you would load a trained model:
      // this.model = await tf.loadGraphModel(this.options.modelPath);
      
      // Simulate model loading delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.model = {
        // Mock model for demonstration
        detect: async (image) => {
          // Simulate detection delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Generate some random detections based on our medication database
          const detections = [];
          
          // Random number of pills (0-3)
          const numPills = Math.floor(Math.random() * 4);
          
          for (let i = 0; i < numPills; i++) {
            // Select random medication
            const medIdx = Math.floor(Math.random() * this.medicationDatabase.medications.length);
            const medication = this.medicationDatabase.medications[medIdx];
            
            // Select random attributes
            const dosageIdx = Math.floor(Math.random() * medication.dosages.length);
            const colorIdx = Math.floor(Math.random() * medication.colors.length);
            const shapeIdx = Math.floor(Math.random() * medication.shapes.length);
            const markingIdx = Math.floor(Math.random() * medication.markings.length);
            
            detections.push({
              class: medication.name,
              confidence: 0.7 + (Math.random() * 0.3), // 0.7-1.0 confidence
              dosage: medication.dosages[dosageIdx],
              color: medication.colors[colorIdx],
              shape: medication.shapes[shapeIdx],
              marking: medication.markings[markingIdx],
              box: {
                x: Math.random() * 0.7,
                y: Math.random() * 0.7,
                width: 0.1 + (Math.random() * 0.2),
                height: 0.1 + (Math.random() * 0.2)
              }
            });
          }
          
          return detections;
        }
      };
      
      if (this.options.debug) {
        console.log('Pill detection model loaded');
      }
      
      return true;
    } catch (error) {
      console.error('Error loading pill detection model:', error);
      return false;
    }
  }
  
  /**
   * Create UI elements for pill detection
   */
  createUI() {
    // Create main container for the camera view and controls
    const containerHTML = `
      <div class="pill-detection-modal">
        <div class="pill-detection-overlay"></div>
        <div class="pill-detection-container">
          <div class="pill-detection-header">
            <h3><i class="fas fa-pills"></i> Medication Scanner</h3>
            <div class="pill-detection-actions">
              <button class="pill-detection-minimize"><i class="fas fa-minus"></i></button>
              <button class="pill-detection-close"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <div class="pill-detection-content">
            <div class="pill-detection-sidebar">
              <div class="detection-instruction">
                <div class="instruction-icon">
                  <i class="fas fa-video"></i>
                </div>
                <div class="instruction-step">1. Position medication in view</div>
              </div>
              <div class="detection-instruction">
                <div class="instruction-icon">
                  <i class="fas fa-camera"></i>
                </div>
                <div class="instruction-step">2. Click scan to analyze</div>
              </div>
              <div class="detection-instruction">
                <div class="instruction-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="instruction-step">3. Verify results</div>
              </div>
              <div class="pill-detection-results">
                <h4>Detected Medications</h4>
                <div class="results-content">
                  <div class="no-pills-message">No medications detected yet</div>
                </div>
              </div>
            </div>
            <div class="pill-detection-main">
              <div class="pill-detection-canvas-wrapper">
                <video id="pill-detection-video" autoplay playsinline style="display: none;"></video>
                <canvas id="pill-detection-canvas"></canvas>
                <div class="pill-detection-guide-overlay">
                  <div class="scan-area"></div>
                  <div class="corner top-left"></div>
                  <div class="corner top-right"></div>
                  <div class="corner bottom-left"></div>
                  <div class="corner bottom-right"></div>
                </div>
                <div class="scan-line"></div>
              </div>
              <div class="pill-detection-controls">
                <button id="pill-detection-capture" class="primary-btn">
                  <i class="fas fa-camera"></i> Scan Medication
                </button>
                <button id="pill-detection-reset" class="secondary-btn">
                  <i class="fas fa-redo"></i> Reset
                </button>
              </div>
            </div>
          </div>
          <div class="pill-detection-footer">
            <div class="footer-status">Ready to scan</div>
            <div class="footer-info">MedSync AI Powered Pill Detection</div>
          </div>
        </div>
      </div>
    `;
    
    // Create pill detection toggle button
    const toggleButtonHTML = `
      <button class="pill-detection-toggle">
        <i class="fas fa-pills"></i>
      </button>
    `;
    
    // Create minimized view
    const minimizedViewHTML = `
      <div class="pill-detection-minimized">
        <div class="minimized-preview">
          <canvas id="pill-detection-mini-canvas"></canvas>
        </div>
        <div class="minimized-info">
          <div class="minimized-title">Medication Scanner</div>
          <button class="minimized-expand"><i class="fas fa-expand"></i></button>
        </div>
      </div>
    `;
    
    // Create styles
    const style = document.createElement('style');
    style.textContent = `
      /* Main Modal */
      .pill-detection-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1001;
      }
      
      .pill-detection-modal.active {
        display: flex;
      }
      
      .pill-detection-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
      }
      
      /* Main Container */
      .pill-detection-container {
        position: relative;
        width: 900px;
        height: 550px;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        z-index: 1002;
        display: flex;
        flex-direction: column;
      }
      
      /* Header */
      .pill-detection-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background-color: #3a87d2;
        color: white;
      }
      
      .pill-detection-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .pill-detection-actions {
        display: flex;
        gap: 10px;
      }
      
      .pill-detection-minimize, 
      .pill-detection-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
        font-size: 16px;
        transition: background-color 0.2s;
      }
      
      .pill-detection-minimize:hover, 
      .pill-detection-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      /* Content */
      .pill-detection-content {
        display: flex;
        flex-grow: 1;
        overflow: hidden;
      }
      
      /* Sidebar */
      .pill-detection-sidebar {
        width: 260px;
        background-color: #f8f9fa;
        border-right: 1px solid #e9ecef;
        padding: 20px;
        display: flex;
        flex-direction: column;
      }
      
      .detection-instruction {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e9ecef;
      }
      
      .instruction-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 36px;
        height: 36px;
        background-color: #3a87d2;
        color: white;
        border-radius: 50%;
        font-size: 16px;
      }
      
      .instruction-step {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
        padding-top: 8px;
      }
      
      .pill-detection-results {
        margin-top: auto;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      
      .pill-detection-results h4 {
        margin: 0;
        padding: 12px 15px;
        background-color: #f1f3f5;
        font-size: 15px;
        font-weight: 600;
        color: #495057;
        border-bottom: 1px solid #e9ecef;
      }
      
      .results-content {
        max-height: 220px;
        overflow-y: auto;
        padding: 15px;
      }
      
      .no-pills-message {
        color: #6c757d;
        font-size: 14px;
        font-style: italic;
        text-align: center;
        padding: 20px 0;
      }
      
      /* Main Area */
      .pill-detection-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px;
      }
      
      .pill-detection-canvas-wrapper {
        position: relative;
        flex: 1;
        background-color: #000;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      #pill-detection-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .pill-detection-guide-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      
      .scan-area {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 70%;
        height: 70%;
        border: 2px dashed rgba(255, 255, 255, 0.6);
        border-radius: 8px;
      }
      
      .corner {
        position: absolute;
        width: 20px;
        height: 20px;
        border-color: rgba(255, 255, 255, 0.8);
        border-style: solid;
        border-width: 0;
      }
      
      .top-left {
        top: 15%;
        left: 15%;
        border-top-width: 2px;
        border-left-width: 2px;
        border-top-left-radius: 4px;
      }
      
      .top-right {
        top: 15%;
        right: 15%;
        border-top-width: 2px;
        border-right-width: 2px;
        border-top-right-radius: 4px;
      }
      
      .bottom-left {
        bottom: 15%;
        left: 15%;
        border-bottom-width: 2px;
        border-left-width: 2px;
        border-bottom-left-radius: 4px;
      }
      
      .bottom-right {
        bottom: 15%;
        right: 15%;
        border-bottom-width: 2px;
        border-right-width: 2px;
        border-bottom-right-radius: 4px;
      }
      
      .scan-line {
        position: absolute;
        top: 15%;
        left: 15%;
        width: 70%;
        height: 2px;
        background: linear-gradient(to right, transparent, rgba(58, 135, 210, 0.8), transparent);
        opacity: 0;
        pointer-events: none;
      }
      
      .scanning .scan-line {
        animation: scanning 2s linear infinite;
        opacity: 1;
      }
      
      @keyframes scanning {
        0% { top: 15%; }
        50% { opacity: 0.5; }
        100% { top: 85%; opacity: 1; }
      }
      
      .pill-detection-controls {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 20px;
      }
      
      .primary-btn, .secondary-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: none;
      }
      
      .primary-btn {
        background-color: #3a87d2;
        color: white;
      }
      
      .primary-btn:hover {
        background-color: #2b75bc;
        box-shadow: 0 2px 8px rgba(58, 135, 210, 0.4);
      }
      
      .secondary-btn {
        background-color: #e9ecef;
        color: #495057;
      }
      
      .secondary-btn:hover {
        background-color: #dee2e6;
      }
      
      /* Footer */
      .pill-detection-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        background-color: #f8f9fa;
        border-top: 1px solid #e9ecef;
        font-size: 12px;
      }
      
      .footer-status {
        color: #3a87d2;
        font-weight: 500;
      }
      
      .footer-info {
        color: #6c757d;
      }
      
      /* Pill item card */
      .pill-item {
        background-color: #f8f9fa;
        border-radius: 6px;
        border-left: 4px solid #3a87d2;
        padding: 12px;
        margin-bottom: 10px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
      
      .pill-item:last-child {
        margin-bottom: 0;
      }
      
      .pill-confidence {
        float: right;
        font-size: 11px;
        background-color: #ebf5fe;
        padding: 2px 8px;
        border-radius: 12px;
        color: #3a87d2;
        font-weight: 500;
      }
      
      .pill-name {
        font-weight: 600;
        margin-bottom: 5px;
        color: #2c3e50;
        font-size: 14px;
      }
      
      .pill-details {
        font-size: 12px;
        color: #5a6a7f;
        line-height: 1.4;
      }
      
      .pill-attribute {
        color: #6c757d;
        font-weight: 500;
      }
      
      /* Toggle Button */
      .pill-detection-toggle {
        position: fixed;
        bottom: 20px;
        right: 90px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #3a87d2;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(58, 135, 210, 0.3);
        z-index: 999;
        border: none;
        transition: transform 0.2s, background-color 0.2s;
      }
      
      .pill-detection-toggle:hover {
        transform: scale(1.05);
        background-color: #2b75bc;
        box-shadow: 0 6px 16px rgba(58, 135, 210, 0.5);
      }
      
      /* Minimized View */
      .pill-detection-minimized {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 240px;
        border-radius: 8px;
        background-color: #fff;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        z-index: 1000;
        display: none;
        flex-direction: column;
      }
      
      .pill-detection-minimized.active {
        display: flex;
      }
      
      .minimized-preview {
        width: 100%;
        height: 160px;
        background-color: #000;
        position: relative;
      }
      
      #pill-detection-mini-canvas {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .minimized-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background-color: #3a87d2;
        color: white;
      }
      
      .minimized-title {
        font-size: 12px;
        font-weight: 500;
      }
      
      .minimized-expand {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 14px;
        padding: 4px;
        border-radius: 4px;
      }
      
      .minimized-expand:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    `;
    
    // Add elements to the DOM
    document.head.appendChild(style);
    
    // Add main container
    const containerDiv = document.createElement('div');
    containerDiv.innerHTML = containerHTML;
    document.body.appendChild(containerDiv);
    
    // Add toggle button
    const toggleButton = document.createElement('div');
    toggleButton.innerHTML = toggleButtonHTML;
    document.body.appendChild(toggleButton);
    
    // Add minimized view
    const minimizedView = document.createElement('div');
    minimizedView.innerHTML = minimizedViewHTML;
    document.body.appendChild(minimizedView);
    
    // Set up references to elements
    this.videoElement = document.getElementById('pill-detection-video');
    this.canvasElement = document.getElementById('pill-detection-canvas');
    this.miniCanvasElement = document.getElementById('pill-detection-mini-canvas');
    
    // Set up event listeners
    document.querySelector('.pill-detection-toggle').addEventListener('click', () => {
      document.querySelector('.pill-detection-modal').classList.add('active');
      this.startVideoStream();
      
      // Update footer status
      document.querySelector('.footer-status').textContent = 'Camera active - Ready to scan';
    });
    
    document.querySelector('.pill-detection-close').addEventListener('click', () => {
      document.querySelector('.pill-detection-modal').classList.remove('active');
      document.querySelector('.pill-detection-minimized').classList.remove('active');
      this.stopVideoStream();
      
      // Reset UI elements
      document.querySelector('.pill-detection-guide-overlay').classList.remove('scanning');
      document.querySelector('.results-content').innerHTML = '<div class="no-pills-message">No medications detected yet</div>';
    });
    
    document.querySelector('.pill-detection-minimize').addEventListener('click', () => {
      document.querySelector('.pill-detection-modal').classList.remove('active');
      document.querySelector('.pill-detection-minimized').classList.add('active');
      
      // Keep video stream running for minimized view
      this.updateMiniCanvas();
    });
    
    document.querySelector('.minimized-expand').addEventListener('click', () => {
      document.querySelector('.pill-detection-minimized').classList.remove('active');
      document.querySelector('.pill-detection-modal').classList.add('active');
    });
    
    document.getElementById('pill-detection-capture').addEventListener('click', () => {
      this.detectMedication();
      document.querySelector('.pill-detection-canvas-wrapper').classList.add('scanning');
      document.querySelector('.footer-status').textContent = 'Scanning medication...';
      
      setTimeout(() => {
        document.querySelector('.pill-detection-canvas-wrapper').classList.remove('scanning');
        document.querySelector('.footer-status').textContent = 'Scan complete';
      }, 2000);
    });
    
    document.getElementById('pill-detection-reset').addEventListener('click', () => {
      // Reset detection results
      document.querySelector('.results-content').innerHTML = '<div class="no-pills-message">No medications detected yet</div>';
      document.querySelector('.footer-status').textContent = 'Reset - Ready to scan';
    });
  }
  
  /**
   * Start video stream from camera
   */
  async startVideoStream() {
    if (!this.videoElement || this.currentStream) return;
    
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.currentStream = stream;
      this.videoElement.srcObject = stream;
      
      // Set canvas size to match video
      this.videoElement.onloadedmetadata = () => {
        this.canvasElement.width = this.videoElement.videoWidth;
        this.canvasElement.height = this.videoElement.videoHeight;
        
        // Draw video frame to canvas
        this.updateCanvas();
      };
      
      return true;
    } catch (error) {
      console.error('Error starting video stream:', error);
      return false;
    }
  }
  
  /**
   * Stop video stream
   */
  stopVideoStream() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
      this.videoElement.srcObject = null;
    }
  }
  
  /**
   * Update canvas with current video frame
   */
  updateCanvas() {
    if (!this.videoElement || !this.canvasElement) return;
    
    const ctx = this.canvasElement.getContext('2d');
    
    // Draw video frame to canvas
    if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
      ctx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
    }
    
    // Continue updating if actively streaming
    if (this.currentStream) {
      requestAnimationFrame(() => this.updateCanvas());
    }
  }
  
  /**
   * Detect medication in current camera view
   */
  async detectMedication() {
    if (!this.isInitialized || this.isDetecting) return;
    
    this.isDetecting = true;
    let detections = [];
    
    try {
      // Get current canvas image
      const ctx = this.canvasElement.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
      
      if (this.options.enableCloudApi && this.options.apiKey) {
        // Use cloud API for detection
        detections = await this.detectWithCloudApi(imageData);
      } else if (this.model) {
        // Use local model for detection
        const tensor = this.imageDataToTensor(imageData);
        detections = await this.model.detect(tensor);
        
        // Clean up tensor to prevent memory leak
        if (tensor && typeof tensor.dispose === 'function') {
          tensor.dispose();
        }
      }
      
      // Filter low confidence detections
      detections = detections.filter(d => d.confidence >= this.options.minConfidence);
      
      // Update UI with results
      this.displayDetections(detections);
      
      // Draw bounding boxes around detections
      this.drawDetections(detections);
      
      // Notify listeners
      if (detections.length > 0) {
        this.detectedMedications = detections;
        this.notifyListeners('medicationDetected', detections);
      }
      
      return detections;
    } catch (error) {
      console.error('Error detecting medication:', error);
      return [];
    } finally {
      this.isDetecting = false;
    }
  }
  
  /**
   * Use cloud API for pill detection
   */
  async detectWithCloudApi(imageData) {
    // Simulate API call for demo purposes
    // In a real implementation, you would:
    // 1. Convert imageData to base64 or blob
    // 2. Send to a cloud API (Google Cloud Vision, Azure Computer Vision, etc.)
    // 3. Parse the response and convert to our detection format
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Simulate API response
    return this.simulateApiDetection();
  }
  
  /**
   * Simulate API detection response for demo purposes
   */
  simulateApiDetection() {
    const detections = [];
    
    // Random number of pills (1-3)
    const numPills = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numPills; i++) {
      // Select random medication
      const medIdx = Math.floor(Math.random() * this.medicationDatabase.medications.length);
      const medication = this.medicationDatabase.medications[medIdx];
      
      // Select random attributes
      const dosageIdx = Math.floor(Math.random() * medication.dosages.length);
      const colorIdx = Math.floor(Math.random() * medication.colors.length);
      const shapeIdx = Math.floor(Math.random() * medication.shapes.length);
      const markingIdx = Math.floor(Math.random() * medication.markings.length);
      
      detections.push({
        class: medication.name,
        confidence: 0.8 + (Math.random() * 0.2), // 0.8-1.0 confidence for API
        dosage: medication.dosages[dosageIdx],
        color: medication.colors[colorIdx],
        shape: medication.shapes[shapeIdx],
        marking: medication.markings[markingIdx],
        box: {
          x: Math.random() * 0.7,
          y: Math.random() * 0.7,
          width: 0.1 + (Math.random() * 0.2),
          height: 0.1 + (Math.random() * 0.2)
        }
      });
    }
    
    return detections;
  }
  
  /**
   * Convert image data to tensor for model input
   */
  imageDataToTensor(imageData) {
    if (typeof tf === 'undefined') return null;
    
    // For demo purposes, we're simulating this conversion
    // In a real implementation, you would:
    // return tf.browser.fromPixels(imageData, 3)
    //   .expandDims(0)
    //   .toFloat()
    //   .div(255);
    
    return {
      // Mock tensor for demo
      shape: [1, imageData.height, imageData.width, 3],
      dispose: () => {}
    };
  }
  
  /**
   * Draw detection boxes on canvas
   */
  drawDetections(detections) {
    if (!this.canvasElement) return;
    
    const ctx = this.canvasElement.getContext('2d');
    const width = this.canvasElement.width;
    const height = this.canvasElement.height;
    
    // Clear previous drawings (but keep the image)
    // ctx.drawImage(this.videoElement, 0, 0, width, height);
    
    // Draw each detection
    detections.forEach(detection => {
      const x = detection.box.x * width;
      const y = detection.box.y * height;
      const boxWidth = detection.box.width * width;
      const boxHeight = detection.box.height * height;
      
      // Draw rectangle
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, boxWidth, boxHeight);
      
      // Draw label background
      ctx.fillStyle = 'rgba(46, 204, 113, 0.85)';
      const textWidth = ctx.measureText(`${detection.class} ${detection.dosage}`).width + 10;
      ctx.fillRect(x, y - 25, textWidth, 25);
      
      // Draw label text
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.fillText(`${detection.class} ${detection.dosage}`, x + 5, y - 8);
    });
  }
  
  /**
   * Display detection results in UI
   */
  displayDetections(detections) {
    const resultsElement = document.querySelector('.results-content');
    if (!resultsElement) return;
    
    if (detections.length === 0) {
      resultsElement.innerHTML = '<div class="no-pills-message">No medications detected. Try adjusting the camera or lighting.</div>';
      return;
    }
    
    let resultsHTML = '';
    
    detections.forEach(detection => {
      const confidencePct = Math.round(detection.confidence * 100);
      
      resultsHTML += `
        <div class="pill-item">
          <div class="pill-confidence">${confidencePct}% match</div>
          <div class="pill-name">${detection.class} ${detection.dosage}</div>
          <div class="pill-details">
            <span class="pill-attribute">Shape:</span> ${detection.shape}, <span class="pill-attribute">Color:</span> ${detection.color}
            ${detection.marking ? `<br><span class="pill-attribute">Marking:</span> ${detection.marking}` : ''}
          </div>
        </div>
      `;
    });
    
    resultsElement.innerHTML = resultsHTML;
    
    // Update footer status
    document.querySelector('.footer-status').textContent = `Detected ${detections.length} medication${detections.length > 1 ? 's' : ''}`;
    
    // Check against expected medications if available
    if (this.options.enableMedicationVerification) {
      this.verifyMedications(detections);
    }
  }
  
  /**
   * Verify detected medications against patient's prescription
   */
  verifyMedications(detections) {
    // This would connect to the patient's medication schedule
    // For demo purposes, we'll assume the medications are correct
    // and generate an adherence event
    
    if (this.options.enableAdherenceTracking) {
      // Create medication adherence event
      const adherenceEvent = {
        timestamp: new Date(),
        detected: detections.map(d => ({ name: d.class, dosage: d.dosage })),
        verified: true,
        method: "computer vision"
      };
      
      // Notify listeners about adherence event
      this.notifyListeners('medicationAdherence', adherenceEvent);
      
      if (this.options.debug) {
        console.log('Medication adherence event:', adherenceEvent);
      }
    }
  }
  
  /**
   * Register an event listener
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }
  
  /**
   * Remove an event listener
   */
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  /**
   * Notify all listeners of an event
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in pill detection listener:', error);
      }
    });
  }
  
  /**
   * Load a script dynamically
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  /**
   * Update mini canvas with current video frame
   */
  updateMiniCanvas() {
    if (!this.videoElement || !this.miniCanvasElement || !this.currentStream) return;
    
    const ctx = this.miniCanvasElement.getContext('2d');
    
    // Set size to match video
    this.miniCanvasElement.width = this.videoElement.videoWidth || 320;
    this.miniCanvasElement.height = this.videoElement.videoHeight || 240;
    
    // Function to continuously update the mini canvas
    const updateFrame = () => {
      if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
        ctx.drawImage(this.videoElement, 0, 0, this.miniCanvasElement.width, this.miniCanvasElement.height);
      }
      
      // Continue updating if minimized view is active
      if (document.querySelector('.pill-detection-minimized').classList.contains('active')) {
        requestAnimationFrame(updateFrame);
      }
    };
    
    // Start updating frames
    updateFrame();
  }
}

// Make available globally
window.PillDetection = PillDetection; 