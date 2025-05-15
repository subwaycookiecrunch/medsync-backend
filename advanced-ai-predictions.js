/**
 * Advanced AI Predictions Module for MediAlert
 * Provides sophisticated health forecasting and predictive analytics
 */

class AdvancedAIPredictions {
  constructor(options = {}) {
    this.options = {
      apiEndpoint: null,
      modelPrecision: 'high',
      predictionHorizon: 30, // days
      useLocalModel: true,
      ...options
    };
    
    this.predictionModels = {};
    this.patientData = null;
    this.predictionResults = {};
    this.modelReady = false;
    this.listeners = [];
    
    // Initialize with demo data if no API endpoint is provided
    if (!this.options.apiEndpoint) {
      this.initializeDemoData();
    }
  }
  
  /**
   * Initialize prediction system
   */
  async initialize() {
    console.log('Initializing advanced health prediction system...');
    
    // Simulate model loading (in a real system, would load TensorFlow.js models)
    await this.loadModels();
    
    // Set up event listeners for real-time data
    this.setupEventListeners();
    
    // Generate initial predictions
    this.generatePredictions();
    
    console.log('Advanced prediction system ready');
    this.modelReady = true;
    
    // Notify listeners that the model is ready
    this.notifyListeners('ready', {
      modelType: this.options.modelPrecision,
      predictionCount: Object.keys(this.predictionResults).length
    });
    
    return this;
  }
  
  /**
   * Load prediction models
   */
  async loadModels() {
    const models = [
      { name: 'vitalsTrend', displayName: 'Vital Signs Trend Model' },
      { name: 'readmissionRisk', displayName: 'Hospital Readmission Risk Model' },
      { name: 'medicationResponse', displayName: 'Medication Response Model' },
      { name: 'symptomProgression', displayName: 'Symptom Progression Model' },
    ];
    
    for (const model of models) {
      this.notifyListeners('modelLoading', { model: model.displayName, progress: 0 });
      
      // Simulate model loading with delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      
      this.predictionModels[model.name] = {
        loaded: true,
        lastUpdated: new Date(),
        accuracy: 0.80 + Math.random() * 0.15 // Simulate 80-95% accuracy
      };
      
      this.notifyListeners('modelLoading', { 
        model: model.displayName, 
        progress: 1,
        accuracy: this.predictionModels[model.name].accuracy.toFixed(2)
      });
      
      console.log(`Loaded ${model.displayName} with ${(this.predictionModels[model.name].accuracy * 100).toFixed(1)}% accuracy`);
    }
  }
  
  /**
   * Set up event listeners for data streams
   */
  setupEventListeners() {
    // In a real app, we would listen to real-time data streams
    // For demo purposes, we'll update predictions periodically
    
    setInterval(() => {
      if (this.modelReady) {
        // Update predictions every 5 minutes with slight changes
        this.updatePredictions();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Listen for new patient data (simulated)
    setInterval(() => {
      if (this.modelReady) {
        // Simulate new data point arriving
        this.simulateNewDataPoint();
      }
    }, 30 * 1000); // Every 30 seconds
  }
  
  /**
   * Generate initial predictions
   */
  generatePredictions() {
    if (!this.patientData) {
      console.error('No patient data available for predictions');
      return;
    }
    
    // Generate readmission risk prediction
    this.predictionResults.readmissionRisk = {
      current: 0.12, // 12% risk
      trend: 'decreasing',
      confidence: 0.92,
      horizon: `${this.options.predictionHorizon} days`,
      factors: [
        { name: 'Recent surgery', impact: 'high', direction: 'increases risk' },
        { name: 'Medication adherence', impact: 'medium', direction: 'decreases risk' },
        { name: 'Age', impact: 'medium', direction: 'increases risk' },
        { name: 'Social support', impact: 'low', direction: 'decreases risk' }
      ]
    };
    
    // Generate medication adherence prediction
    this.predictionResults.medicationAdherence = {
      current: 0.87, // 87% adherence
      trend: 'stable',
      confidence: 0.89,
      horizon: `${this.options.predictionHorizon} days`,
      recommendations: [
        { text: 'Simplify morning medication routine', priority: 'medium' },
        { text: 'Enable reminder notifications', priority: 'high' },
        { text: 'Review side effects with doctor', priority: 'low' }
      ]
    };
    
    // Generate recovery trajectory
    this.predictionResults.recoveryTrajectory = {
      current: 0.65, // 65% recovered
      trend: 'improving',
      confidence: 0.78,
      horizon: `${this.options.predictionHorizon} days`,
      milestones: [
        { day: 7, event: 'Expected return to light activities', probability: 0.82 },
        { day: 14, event: 'Expected 80% recovery of mobility', probability: 0.75 },
        { day: 21, event: 'Expected return to normal routine', probability: 0.68 }
      ]
    };
    
    // Generate critical events prediction
    this.predictionResults.criticalEvents = {
      riskLevel: 'low',
      trend: 'stable',
      confidence: 0.85,
      horizon: `${this.options.predictionHorizon} days`,
      potentialEvents: [
        { 
          type: 'Hypoglycemic episode', 
          probability: 0.05, 
          timeframe: '7-14 days',
          preventionSteps: ['Monitor glucose levels after exercise', 'Adjust insulin timing']
        },
        { 
          type: 'Adverse medication reaction', 
          probability: 0.03, 
          timeframe: '1-30 days',
          preventionSteps: ['Watch for listed side effects', 'Report symptoms immediately']
        }
      ]
    };
    
    console.log('Generated initial predictions:', Object.keys(this.predictionResults));
    this.notifyListeners('predictionsUpdated', this.predictionResults);
  }
  
  /**
   * Update predictions with new data
   */
  updatePredictions() {
    // In a real app, this would process new data and update the prediction models
    // For demo purposes, we'll make small random changes to existing predictions
    
    // Update readmission risk with slight variation
    if (this.predictionResults.readmissionRisk) {
      const currentRisk = this.predictionResults.readmissionRisk.current;
      const newRisk = Math.max(0.01, Math.min(0.99, currentRisk + (Math.random() * 0.04 - 0.02)));
      
      this.predictionResults.readmissionRisk.current = newRisk;
      this.predictionResults.readmissionRisk.trend = 
        newRisk < currentRisk ? 'decreasing' : 
        newRisk > currentRisk ? 'increasing' : 'stable';
      
      // Slightly adjust confidence
      this.predictionResults.readmissionRisk.confidence = 
        Math.max(0.7, Math.min(0.98, this.predictionResults.readmissionRisk.confidence + (Math.random() * 0.04 - 0.02)));
    }
    
    // Update medication adherence with slight variation
    if (this.predictionResults.medicationAdherence) {
      const currentAdherence = this.predictionResults.medicationAdherence.current;
      const newAdherence = Math.max(0.4, Math.min(0.99, currentAdherence + (Math.random() * 0.06 - 0.03)));
      
      this.predictionResults.medicationAdherence.current = newAdherence;
      this.predictionResults.medicationAdherence.trend = 
        newAdherence < currentAdherence ? 'decreasing' : 
        newAdherence > currentAdherence ? 'improving' : 'stable';
    }
    
    console.log('Updated predictions with new data');
    this.notifyListeners('predictionsUpdated', this.predictionResults);
  }
  
  /**
   * Simulate new data point arriving
   */
  simulateNewDataPoint() {
    // Simulate a new vital sign measurement
    const newDataPoint = {
      timestamp: new Date(),
      heartRate: 65 + Math.floor(Math.random() * 20),
      bloodPressure: {
        systolic: 110 + Math.floor(Math.random() * 20),
        diastolic: 70 + Math.floor(Math.random() * 10)
      },
      oxygenSaturation: 95 + Math.floor(Math.random() * 4),
      temperature: 98.2 + (Math.random() * 1.4),
      activity: Math.floor(Math.random() * 100)
    };
    
    if (!this.patientData.vitalSigns) {
      this.patientData.vitalSigns = [];
    }
    
    // Add to patient data array
    this.patientData.vitalSigns.push(newDataPoint);
    
    // Keep only the last 1000 data points
    if (this.patientData.vitalSigns.length > 1000) {
      this.patientData.vitalSigns.shift();
    }
    
    // Check if this data point triggers any alerts
    this.checkForAlerts(newDataPoint);
    
    // Notify that new data is available
    this.notifyListeners('newDataPoint', newDataPoint);
  }
  
  /**
   * Check if a data point should trigger alerts
   */
  checkForAlerts(dataPoint) {
    const alerts = [];
    
    // Check heart rate thresholds
    if (dataPoint.heartRate > 100) {
      alerts.push({
        type: 'highHeartRate',
        severity: dataPoint.heartRate > 120 ? 'high' : 'medium',
        value: dataPoint.heartRate,
        message: `Elevated heart rate detected (${dataPoint.heartRate} BPM)`
      });
    } else if (dataPoint.heartRate < 50) {
      alerts.push({
        type: 'lowHeartRate',
        severity: dataPoint.heartRate < 45 ? 'high' : 'medium',
        value: dataPoint.heartRate,
        message: `Low heart rate detected (${dataPoint.heartRate} BPM)`
      });
    }
    
    // Check blood pressure
    if (dataPoint.bloodPressure.systolic > 140 || dataPoint.bloodPressure.diastolic > 90) {
      alerts.push({
        type: 'highBloodPressure',
        severity: (dataPoint.bloodPressure.systolic > 160 || dataPoint.bloodPressure.diastolic > 100) ? 'high' : 'medium',
        value: `${dataPoint.bloodPressure.systolic}/${dataPoint.bloodPressure.diastolic}`,
        message: `Elevated blood pressure (${dataPoint.bloodPressure.systolic}/${dataPoint.bloodPressure.diastolic} mmHg)`
      });
    }
    
    // Check oxygen saturation
    if (dataPoint.oxygenSaturation < 92) {
      alerts.push({
        type: 'lowOxygen',
        severity: dataPoint.oxygenSaturation < 90 ? 'high' : 'medium',
        value: dataPoint.oxygenSaturation,
        message: `Low oxygen saturation (${dataPoint.oxygenSaturation}%)`
      });
    }
    
    // If we found any alerts, notify listeners
    if (alerts.length > 0) {
      console.log('Health alerts detected:', alerts);
      this.notifyListeners('alerts', alerts);
    }
  }
  
  /**
   * Generate health score based on all available data
   */
  generateHealthScore() {
    if (!this.patientData || !this.modelReady) {
      return { score: null, confidence: 0, factors: [] };
    }
    
    // In a real app, this would use a complex algorithm
    // For demo, we'll create a weighted score
    
    // Base score starts at 70 (out of 100)
    let score = 70;
    let confidence = 0.75;
    
    // Factors that affect the score
    const factors = [];
    
    // Readmission risk reduces score
    if (this.predictionResults.readmissionRisk) {
      const risk = this.predictionResults.readmissionRisk.current;
      score -= risk * 20; // Reduce score by up to 20 points based on risk
      
      factors.push({
        name: 'Readmission Risk',
        impact: -(risk * 20).toFixed(1),
        description: `${(risk * 100).toFixed(0)}% risk of readmission`
      });
    }
    
    // Medication adherence improves score
    if (this.predictionResults.medicationAdherence) {
      const adherence = this.predictionResults.medicationAdherence.current;
      score += adherence * 15; // Add up to 15 points based on adherence
      
      factors.push({
        name: 'Medication Adherence',
        impact: '+' + (adherence * 15).toFixed(1),
        description: `${(adherence * 100).toFixed(0)}% adherence to medication schedule`
      });
    }
    
    // Recovery trajectory improves score
    if (this.predictionResults.recoveryTrajectory) {
      const recovery = this.predictionResults.recoveryTrajectory.current;
      score += recovery * 10; // Add up to 10 points based on recovery
      
      factors.push({
        name: 'Recovery Trajectory',
        impact: '+' + (recovery * 10).toFixed(1),
        description: `${(recovery * 100).toFixed(0)}% recovery progress`
      });
    }
    
    // Critical events risk reduces score
    if (this.predictionResults.criticalEvents) {
      const riskLevel = this.predictionResults.criticalEvents.riskLevel;
      let riskImpact = 0;
      
      switch (riskLevel) {
        case 'high': riskImpact = -15; break;
        case 'medium': riskImpact = -10; break;
        case 'low': riskImpact = -5; break;
        default: riskImpact = 0;
      }
      
      score += riskImpact;
      
      factors.push({
        name: 'Critical Events Risk',
        impact: riskImpact,
        description: `${riskLevel} risk of critical health events`
      });
    }
    
    // Add recent vital signs impact
    if (this.patientData.vitalSigns && this.patientData.vitalSigns.length > 0) {
      const latestVitals = this.patientData.vitalSigns[this.patientData.vitalSigns.length - 1];
      let vitalsImpact = 0;
      
      // Heart rate within normal range
      if (latestVitals.heartRate >= 60 && latestVitals.heartRate <= 100) {
        vitalsImpact += 2;
      } else {
        vitalsImpact -= 3;
      }
      
      // Blood pressure within normal range
      if (latestVitals.bloodPressure.systolic < 140 && latestVitals.bloodPressure.diastolic < 90) {
        vitalsImpact += 2;
      } else {
        vitalsImpact -= 3;
      }
      
      // Oxygen saturation good
      if (latestVitals.oxygenSaturation >= 95) {
        vitalsImpact += 2;
      } else {
        vitalsImpact -= 3;
      }
      
      score += vitalsImpact;
      
      factors.push({
        name: 'Current Vital Signs',
        impact: vitalsImpact > 0 ? '+' + vitalsImpact : vitalsImpact,
        description: vitalsImpact > 0 ? 'Vital signs within healthy ranges' : 'Some vital signs outside optimal ranges'
      });
    }
    
    // Ensure score is in valid range
    score = Math.round(Math.max(0, Math.min(100, score)));
    
    return {
      score,
      confidence,
      factors,
      lastUpdated: new Date()
    };
  }
  
  /**
   * Analyze progression of health indicators over time
   */
  analyzeProgression(timeframe = '30d') {
    if (!this.patientData || !this.patientData.vitalSigns || this.patientData.vitalSigns.length < 2) {
      return null;
    }
    
    // Filter data points based on timeframe
    const now = new Date();
    let startTime;
    
    switch (timeframe) {
      case '7d': 
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d': 
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default: 
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const filteredData = this.patientData.vitalSigns.filter(point => 
      new Date(point.timestamp) >= startTime
    );
    
    if (filteredData.length < 2) {
      return null;
    }
    
    // Analyze first and last data points for trends
    const firstPoint = filteredData[0];
    const lastPoint = filteredData[filteredData.length - 1];
    
    const trends = {
      heartRate: {
        start: firstPoint.heartRate,
        end: lastPoint.heartRate,
        change: lastPoint.heartRate - firstPoint.heartRate,
        percentChange: ((lastPoint.heartRate - firstPoint.heartRate) / firstPoint.heartRate * 100).toFixed(1),
        direction: lastPoint.heartRate > firstPoint.heartRate ? 'increasing' : 
                  lastPoint.heartRate < firstPoint.heartRate ? 'decreasing' : 'stable'
      },
      bloodPressure: {
        systolic: {
          start: firstPoint.bloodPressure.systolic,
          end: lastPoint.bloodPressure.systolic,
          change: lastPoint.bloodPressure.systolic - firstPoint.bloodPressure.systolic,
          percentChange: ((lastPoint.bloodPressure.systolic - firstPoint.bloodPressure.systolic) / 
                         firstPoint.bloodPressure.systolic * 100).toFixed(1),
          direction: lastPoint.bloodPressure.systolic > firstPoint.bloodPressure.systolic ? 'increasing' : 
                    lastPoint.bloodPressure.systolic < firstPoint.bloodPressure.systolic ? 'decreasing' : 'stable'
        },
        diastolic: {
          start: firstPoint.bloodPressure.diastolic,
          end: lastPoint.bloodPressure.diastolic,
          change: lastPoint.bloodPressure.diastolic - firstPoint.bloodPressure.diastolic,
          percentChange: ((lastPoint.bloodPressure.diastolic - firstPoint.bloodPressure.diastolic) / 
                         firstPoint.bloodPressure.diastolic * 100).toFixed(1),
          direction: lastPoint.bloodPressure.diastolic > firstPoint.bloodPressure.diastolic ? 'increasing' : 
                    lastPoint.bloodPressure.diastolic < firstPoint.bloodPressure.diastolic ? 'decreasing' : 'stable'
        }
      },
      oxygenSaturation: {
        start: firstPoint.oxygenSaturation,
        end: lastPoint.oxygenSaturation,
        change: lastPoint.oxygenSaturation - firstPoint.oxygenSaturation,
        percentChange: ((lastPoint.oxygenSaturation - firstPoint.oxygenSaturation) / 
                       firstPoint.oxygenSaturation * 100).toFixed(1),
        direction: lastPoint.oxygenSaturation > firstPoint.oxygenSaturation ? 'increasing' : 
                  lastPoint.oxygenSaturation < firstPoint.oxygenSaturation ? 'decreasing' : 'stable'
      }
    };
    
    // Generate insight messages based on trends
    const insights = [];
    
    // Heart rate insights
    if (Math.abs(trends.heartRate.change) > 10) {
      insights.push({
        parameter: 'Heart Rate',
        trend: trends.heartRate.direction,
        message: `Heart rate has ${trends.heartRate.direction} by ${Math.abs(trends.heartRate.change)} BPM (${Math.abs(trends.heartRate.percentChange)}%) over the last ${timeframe.replace('d', ' days')}.`,
        significance: Math.abs(trends.heartRate.change) > 20 ? 'high' : 'medium'
      });
    }
    
    // Blood pressure insights
    if (Math.abs(trends.bloodPressure.systolic.change) > 10) {
      insights.push({
        parameter: 'Blood Pressure (Systolic)',
        trend: trends.bloodPressure.systolic.direction,
        message: `Systolic blood pressure has ${trends.bloodPressure.systolic.direction} by ${Math.abs(trends.bloodPressure.systolic.change)} mmHg (${Math.abs(trends.bloodPressure.systolic.percentChange)}%) over the last ${timeframe.replace('d', ' days')}.`,
        significance: Math.abs(trends.bloodPressure.systolic.change) > 15 ? 'high' : 'medium'
      });
    }
    
    // Oxygen saturation insights
    if (Math.abs(trends.oxygenSaturation.change) > 2) {
      insights.push({
        parameter: 'Oxygen Saturation',
        trend: trends.oxygenSaturation.direction,
        message: `Oxygen saturation has ${trends.oxygenSaturation.direction} by ${Math.abs(trends.oxygenSaturation.change)}% over the last ${timeframe.replace('d', ' days')}.`,
        significance: Math.abs(trends.oxygenSaturation.change) > 4 ? 'high' : 'medium'
      });
    }
    
    return {
      timeframe,
      dataPoints: filteredData.length,
      startDate: firstPoint.timestamp,
      endDate: lastPoint.timestamp,
      trends,
      insights
    };
  }
  
  /**
   * Initialize demo data for predictions
   */
  initializeDemoData() {
    this.patientData = {
      demographics: {
        age: 67,
        gender: 'Male',
        height: 175, // cm
        weight: 82    // kg
      },
      conditions: [
        { name: 'Type 2 Diabetes', diagnosed: '2018-05-12', status: 'Active' },
        { name: 'Hypertension', diagnosed: '2015-11-03', status: 'Active' },
        { name: 'Coronary Artery Disease', diagnosed: '2020-02-18', status: 'Active' }
      ],
      medications: [
        { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', startDate: '2018-05-15' },
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', startDate: '2015-11-10' },
        { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', startDate: '2020-02-20' }
      ],
      vitalSigns: []
    };
    
    // Generate some historical vital signs data
    const now = new Date();
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now.getTime() - (100 - i) * 6 * 60 * 60 * 1000);
      
      this.patientData.vitalSigns.push({
        timestamp,
        heartRate: 65 + Math.floor(Math.random() * 20),
        bloodPressure: {
          systolic: 110 + Math.floor(Math.random() * 20),
          diastolic: 70 + Math.floor(Math.random() * 10)
        },
        oxygenSaturation: 95 + Math.floor(Math.random() * 4),
        temperature: 98.2 + (Math.random() * 1.4),
        activity: Math.floor(Math.random() * 100)
      });
    }
    
    console.log('Initialized demo patient data with 100 historical data points');
  }
  
  /**
   * Add a listener for prediction events
   */
  addListener(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
      return true;
    }
    return false;
  }
  
  /**
   * Remove a listener
   */
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * Notify all listeners of an event
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (e) {
        console.error('Error in prediction listener:', e);
      }
    });
  }
  
  /**
   * Get all current predictions
   */
  getPredictions() {
    return {
      ...this.predictionResults,
      healthScore: this.generateHealthScore(),
      progression: this.analyzeProgression(),
      lastUpdated: new Date()
    };
  }
  
  /**
   * Get the health score only
   */
  getHealthScore() {
    return this.generateHealthScore();
  }
}

// Make available globally
window.AdvancedAIPredictions = AdvancedAIPredictions; 