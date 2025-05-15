// This file will be used as a common script to inject into all HTML pages
// to provide access to Electron and Desktop-specific features

document.addEventListener('DOMContentLoaded', () => {
  console.log('Renderer script loaded. Setting up application functionality...');
  
  // Add desktop app-specific features
  
  // Add notification support
  window.sendNotification = (title, body) => {
    if (window.electron) {
      const notification = new Notification(title, {
        body: body,
        icon: 'assets/icons/icon.png'
      });
      
      notification.onclick = () => {
        console.log('Notification clicked');
      };
    } else {
      // Fallback for when electron API is not available
      alert(`${title}: ${body}`);
    }
  };
  
  // Enhanced button functionality
  function setupButtonHandlers() {
    console.log('Setting up button handlers...');
    
    // Setup all buttons with a class that includes 'button'
    const allButtons = document.querySelectorAll('button, .login-button, .action-button, .export-button, .settings-button, .google-fit-button');
    
    if (allButtons.length > 0) {
      console.log(`Found ${allButtons.length} buttons to enhance`);
      
      allButtons.forEach(button => {
        // Add hover effect
        button.addEventListener('mouseover', () => {
          button.style.opacity = '0.9';
          button.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseout', () => {
          button.style.opacity = '1';
          button.style.transform = 'translateY(0)';
        });
        
        // Add click effect
        button.addEventListener('mousedown', () => {
          button.style.transform = 'translateY(1px)';
        });
        
        button.addEventListener('mouseup', () => {
          button.style.transform = 'translateY(-2px)';
        });
        
        // Handle specific button types
        const buttonText = button.innerText.toLowerCase();
        
        // Handle Google Fit sync button
        if (button.id === 'google-fit-button' || buttonText.includes('sync')) {
          button.addEventListener('click', (e) => {
            console.log('Google Fit sync button clicked');
            handleSyncButton(button);
          });
        }
        
        // Handle download buttons
        else if (buttonText.includes('download') || buttonText.includes('export')) {
          button.addEventListener('click', (e) => {
            console.log('Download button clicked');
            handleDownloadButton(button);
          });
        }
        
        // Handle login button
        else if (button.classList.contains('login-button')) {
          button.addEventListener('click', (e) => {
            console.log('Login button clicked');
            handleLoginButton(button);
          });
        }
        
        // Handle AI analysis buttons
        else if (button.classList.contains('ai-analyze-button')) {
          button.addEventListener('click', (e) => {
            console.log('AI analyze button clicked');
            handleAIAnalyzeButton(button);
          });
        }
        
        // Handle all other buttons
        else {
          button.addEventListener('click', (e) => {
            console.log(`Button clicked: ${buttonText}`);
            // Generic handler for other buttons
            window.sendNotification('MediAlert', `Action: ${buttonText} initiated`);
          });
        }
      });
    }
  }
  
  // Handle Google Fit sync functionality
  function handleSyncButton(button) {
    // Show syncing status if element exists
    const syncStatus = document.getElementById('sync-status');
    if (syncStatus) {
      syncStatus.className = 'sync-status syncing';
      syncStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing with Google Fit...';
    }
    
    // Simulate API call
    setTimeout(() => {
      if (syncStatus) {
        syncStatus.className = 'sync-status success';
        syncStatus.innerHTML = '<i class="fas fa-check-circle"></i> Successfully synced with Google Fit!';
      }
      
      // Show sync details if element exists
      const syncDetails = document.getElementById('sync-details');
      if (syncDetails) {
        syncDetails.classList.add('active');
      }
      
      // Update last sync time
      const lastSyncTime = document.getElementById('last-sync-time');
      if (lastSyncTime) {
        const now = new Date();
        lastSyncTime.textContent = now.toLocaleString();
      }
      
      // Update charts
      updateCharts();
      
      // Add activity to feed
      addActivityToFeed('Google Fit sync completed', 'Synced steps, heart rate, and activity data from Google Fit');
      
      window.sendNotification('MediAlert', 'Successfully synced with Google Fit!');
    }, 2000);
  }
  
  // Handle download buttons
  function handleDownloadButton(button) {
    if (window.electron && window.electron.files) {
      window.electron.files.showSaveDialog().then(filePath => {
        if (filePath) {
          console.log('File would be saved to:', filePath);
          window.sendNotification('MediAlert', 'Report downloaded successfully');
        }
      }).catch(err => {
        console.error('Error in file save dialog:', err);
        window.sendNotification('MediAlert', 'Error saving file');
      });
    } else {
      // Fallback for when electron is not available
      console.log('Download requested (simulated)');
      window.sendNotification('MediAlert', 'Download function simulated successfully');
    }
  }
  
  // Handle login buttons
  function handleLoginButton(button) {
    // Check if we're on login page
    if (window.location.href.includes('index.html')) {
      const username = document.querySelector('input[type="text"]');
      const password = document.querySelector('input[type="password"]');
      
      if (username && password) {
        if (username.value && password.value) {
          console.log('Login attempt with credentials');
          // Simulate login
          window.location.href = 'medical dashboard.html';
        } else {
          window.sendNotification('MediAlert', 'Please enter your credentials');
        }
      } else {
        // Generic button action
        console.log('Login button clicked but not on login form');
        window.sendNotification('MediAlert', 'Login action initiated');
      }
    } else {
      // For other types of login buttons not on the login page
      window.sendNotification('MediAlert', 'Action initiated');
    }
  }
  
  // Handle AI analyze buttons
  function handleAIAnalyzeButton(button) {
    const concern = document.getElementById('medical-concern');
    let concernText = '';
    
    if (concern) {
      concernText = concern.value.trim();
    }
    
    // Show thinking indicator if it exists
    const thinkingEl = document.querySelector('.ai-thinking');
    if (thinkingEl) {
      thinkingEl.style.display = 'flex';
    }
    
    // Use the electron API for AI analysis if available
    if (window.electron && window.electron.ai) {
      window.electron.ai.analyzeData({concern: concernText}).then(result => {
        console.log('AI analysis result:', result);
        showAIAnalysisResult(result);
      }).catch(err => {
        console.error('Error in AI analysis:', err);
        window.sendNotification('MediAlert', 'Error in AI analysis');
      });
    } else {
      // Fallback simulation
      console.log('AI analysis requested (simulated)');
      setTimeout(() => {
        // Simulate AI analysis result
        const analysisResult = {
          success: true,
          assessment: "Based on the symptoms described, this appears to be a general health concern.",
          specialist: "General Medicine",
          doctorName: "Dr. Robert Wilson",
          urgency: "Medium"
        };
        
        showAIAnalysisResult(analysisResult);
      }, 2000);
    }
  }
  
  // Show AI analysis result
  function showAIAnalysisResult(result) {
    // Hide thinking indicator if it exists
    const thinkingEl = document.querySelector('.ai-thinking');
    if (thinkingEl) {
      thinkingEl.style.display = 'none';
    }
    
    // Show recommendation if element exists
    const recommendationEl = document.querySelector('.ai-recommendation');
    if (recommendationEl) {
      recommendationEl.style.display = 'block';
      
      // Different format based on context
      if (result.insights) {
        // Format for nutrient analysis
        let insightsHtml = '<p><strong>AI Assessment:</strong></p><ul>';
        result.insights.forEach(insight => {
          insightsHtml += `<li class="${insight.type}">${insight.message}</li>`;
        });
        insightsHtml += '</ul>';
        recommendationEl.innerHTML = insightsHtml;
      } else {
        // Format for emergency assessment
        recommendationEl.innerHTML = `
          <p><strong>AI Assessment:</strong> ${result.assessment || 'Analysis complete'}</p>
          <p><strong>Recommended Specialist:</strong> ${result.specialist || 'N/A'} ${result.doctorName ? `(${result.doctorName})` : ''}</p>
          <p><strong>Urgency Level:</strong> <span style="color: ${getUrgencyColor(result.urgency)}; font-weight: bold;">${result.urgency || 'Medium'}</span></p>
        `;
      }
    }
    
    // Enable next button if it exists
    const nextBtn = document.getElementById('modal-next-button');
    if (nextBtn) {
      nextBtn.disabled = false;
    }
    
    // Show notification
    window.sendNotification('MediAlert', 'AI analysis completed');
  }
  
  // Get color for urgency level
  function getUrgencyColor(urgency) {
    switch (urgency) {
      case "High": return "#e74c3c";
      case "Medium": return "#f39c12";
      case "Low": return "#2ecc71";
      default: return "#3498db";
    }
  }
  
  // Add activity to feed
  function addActivityToFeed(title, description) {
    const activityFeed = document.querySelector('.activity-feed');
    if (!activityFeed) return;
    
    // Create new activity item
    const newActivity = document.createElement('div');
    newActivity.className = 'activity-item';
    
    // Get current time
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Set activity content
    newActivity.innerHTML = `
      <div class="activity-time">${timeString}</div>
      <div class="activity-content">
        <div class="activity-title status-normal">✅ ${title}</div>
        <div class="activity-description">${description}</div>
      </div>
    `;
    
    // Add to the beginning of the feed
    activityFeed.insertBefore(newActivity, activityFeed.firstChild);
  }
  
  // Update charts with new data
  function updateCharts() {
    // Update heart rate chart if it exists (defined globally in the page)
    if (typeof heartRateChart !== 'undefined') {
      const newHeartRateData = Array.from({length: 24}, (_, i) => {
        // More realistic heart rate pattern
        const baseRate = 65;
        const hour = i % 24;
        
        // Higher during day, lower at night
        if (hour >= 8 && hour <= 20) {
          return baseRate + 10 + Math.floor(Math.random() * 20);
        } else {
          return baseRate - 5 + Math.floor(Math.random() * 10);
        }
      });
      
      heartRateChart.data.datasets[0].data = newHeartRateData;
      heartRateChart.update();
      
      // Update the current heart rate value in stats
      const heartRateValue = document.querySelector('.stat-card:nth-child(1) .stat-value');
      if (heartRateValue) {
        heartRateValue.textContent = `${newHeartRateData[newHeartRateData.length - 1]} BPM`;
      }
    }
    
    // Update patient monitoring chart if it exists
    if (typeof patientMonitoringChart !== 'undefined') {
      // Update with some random fluctuations
      const criticalData = patientMonitoringChart.data.datasets[0].data.map(val => 
        Math.max(1, val + (Math.random() > 0.5 ? 1 : -1))
      );
      
      const stableData = patientMonitoringChart.data.datasets[1].data.map(val => 
        Math.max(10, val + (Math.random() > 0.5 ? 1 : -1) * 2)
      );
      
      const improvingData = patientMonitoringChart.data.datasets[2].data.map(val => 
        Math.max(1, val + (Math.random() > 0.5 ? 1 : -1))
      );
      
      patientMonitoringChart.data.datasets[0].data = criticalData;
      patientMonitoringChart.data.datasets[1].data = stableData;
      patientMonitoringChart.data.datasets[2].data = improvingData;
      patientMonitoringChart.update();
    }
  }
  
  // Setup any tab functionality
  function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button, .settings-tab, .alert-tab');
    
    if (tabButtons.length > 0) {
      console.log(`Found ${tabButtons.length} tab buttons to enhance`);
      
      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const targetTab = button.getAttribute('data-tab');
          if (!targetTab) return;
          
          // Determine tab context
          let tabButtonSelector, tabContentSelector;
          
          if (button.classList.contains('settings-tab')) {
            tabButtonSelector = '.settings-tab';
            tabContentSelector = '.settings-content';
          } else if (button.classList.contains('alert-tab')) {
            tabButtonSelector = '.alert-tab';
            tabContentSelector = '.alert-tab-content';
          } else {
            tabButtonSelector = '.tab-button';
            tabContentSelector = '.tab-content';
          }
          
          // Remove active class from all tabs in this context
          document.querySelectorAll(tabButtonSelector).forEach(btn => {
            btn.classList.remove('active');
          });
          
          // Add active class to clicked tab
          button.classList.add('active');
          
          // Hide all tab contents in this context
          document.querySelectorAll(tabContentSelector).forEach(content => {
            content.classList.remove('active');
          });
          
          // Find and show the target content
          let targetContent;
          
          if (button.classList.contains('settings-tab')) {
            targetContent = document.getElementById(targetTab + '-tab');
          } else if (button.classList.contains('alert-tab')) {
            targetContent = document.getElementById(targetTab + '-tab');
          } else {
            targetContent = document.getElementById(targetTab);
          }
          
          if (targetContent) {
            targetContent.classList.add('active');
          }
        });
      });
    }
  }
  
  // Setup toggle switches
  function setupToggleSwitches() {
    const toggleSwitches = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
    
    if (toggleSwitches.length > 0) {
      console.log(`Found ${toggleSwitches.length} toggle switches to enhance`);
      
      toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', () => {
          const settingName = toggle.id || 'setting';
          const status = toggle.checked ? 'enabled' : 'disabled';
          console.log(`Toggle changed: ${settingName} is now ${status}`);
          
          // Store setting in localStorage for persistence
          try {
            localStorage.setItem(settingName, toggle.checked);
          } catch (e) {
            console.error('Could not save setting to localStorage:', e);
          }
        });
        
        // Restore saved state if available
        try {
          const savedState = localStorage.getItem(toggle.id);
          if (savedState !== null) {
            toggle.checked = savedState === 'true';
          }
        } catch (e) {
          console.error('Could not restore setting from localStorage:', e);
        }
      });
    }
  }
  
  // Setup alert configuration panel
  function setupAlertConfig() {
    const configureAlertsBtn = document.getElementById('configure-alerts-btn');
    const alertConfigPanel = document.getElementById('alert-config-panel');
    const cancelAlertConfig = document.getElementById('cancel-alert-config');
    
    if (configureAlertsBtn && alertConfigPanel) {
      console.log('Setting up alert configuration panel');
      
      configureAlertsBtn.addEventListener('click', function() {
        alertConfigPanel.classList.add('active');
      });
      
      if (cancelAlertConfig) {
        cancelAlertConfig.addEventListener('click', function() {
          alertConfigPanel.classList.remove('active');
        });
      }
    }
    
    // Setup alert badge functionality
    const alertBadge = document.querySelector('.alert-badge');
    const alertLink = document.querySelector('.nav-alert-icon');
    
    if (alertBadge && alertLink) {
      alertLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // If we're on a page with alert configuration
        if (alertConfigPanel) {
          alertConfigPanel.classList.add('active');
          
          // Navigate to "Recent Alerts" section if it exists
          const recentAlerts = document.querySelector('.recent-alerts');
          if (recentAlerts) {
            recentAlerts.scrollIntoView({ behavior: 'smooth' });
          }
          
          // Reset notification count
          alertBadge.textContent = '0';
        } else {
          // Otherwise navigate to the medical dashboard
          window.location.href = 'medical dashboard.html';
        }
      });
    }
  }
  
  // Add system information to footer if it exists
  function enhanceFooter() {
    const footerElements = document.querySelectorAll('footer');
    if (footerElements.length > 0) {
      // Add a small text in the footer indicating it's the desktop app
      const copyrightDiv = footerElements[0].querySelector('.copyright');
      if (copyrightDiv) {
        // Only add if not already present
        if (!copyrightDiv.querySelector('.app-info')) {
          const appInfoPara = document.createElement('p');
          appInfoPara.className = 'app-info';
          appInfoPara.style.fontSize = '0.8rem';
          appInfoPara.style.marginTop = '5px';
          
          if (window.electron && window.electron.system) {
            appInfoPara.innerText = `Desktop App v1.0.0 - ${window.electron.system.os()}`;
          } else {
            appInfoPara.innerText = 'Desktop App v1.0.0';
          }
          
          copyrightDiv.appendChild(appInfoPara);
        }
      }
    }
  }
  
  // Transform links to use proper navigation
  function enhanceNavigation() {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('http')) {
        link.addEventListener('click', (e) => {
          console.log('Navigation requested to:', href);
          
          // Don't prevent default - let the browser/Electron handle it
          // This ensures that both the web and desktop versions work properly
        });
      }
    });
  }
  
  // Add a back button to all pages except dashboards
  function addBackButton() {
    // Skip if we're on a dashboard page or login page
    const currentPath = window.location.pathname.toLowerCase();
    if (currentPath.includes('dashboard') || 
        currentPath.includes('index.html') ||
        currentPath === '/' ||
        currentPath.endsWith('/')) {
      console.log('Not adding back button to dashboard/login page');
      return;
    }
    
    console.log('Adding back button to page:', currentPath);
    
    // Create the back button element
    const backButton = document.createElement('button');
    backButton.id = 'back-to-dashboard';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Dashboard';
    
    // Style the button
    Object.assign(backButton.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '9999',
      padding: '12px 20px',
      borderRadius: '4px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: 'bold',
      fontSize: '14px',
      transition: 'all 0.3s ease'
    });
    
    // Add hover styles
    backButton.addEventListener('mouseover', () => {
      backButton.style.backgroundColor = '#2980b9';
      backButton.style.transform = 'translateY(-2px)';
      backButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    });
    
    backButton.addEventListener('mouseout', () => {
      backButton.style.backgroundColor = '#3498db';
      backButton.style.transform = 'translateY(0)';
      backButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    });
    
    // Add click handler
    backButton.addEventListener('click', () => {
      console.log('Back button clicked, returning to dashboard');
      
      // Determine which dashboard to go back to
      // Check if we're in a medical staff context or family context
      let dashboardPath = 'medical dashboard.html';
      
      // Check if there are indicators that this is a family dashboard context
      const familyContext = document.body.innerHTML.toLowerCase().includes('family') || 
                            document.title.toLowerCase().includes('family');
      
      if (familyContext) {
        dashboardPath = 'family dashboard.html';
      }
      
      // Navigate back to the appropriate dashboard
      window.location.href = dashboardPath;
    });
    
    // Add to document
    document.body.appendChild(backButton);
  }
  
  // Initialize all functionality
  function initializeApp() {
    console.log('Initializing MediAlert application...');
    
    setupButtonHandlers();
    setupTabs();
    setupToggleSwitches();
    setupAlertConfig();
    enhanceFooter();
    enhanceNavigation();
    addBackButton();
    
    console.log('MediAlert application initialized successfully');
  }
  
  // Call the initialization function
  initializeApp();
}); 