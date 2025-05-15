const fs = require('fs');
const path = require('path');

// Get all HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

console.log('Found HTML files:', htmlFiles);

// Inject renderer.js script into each HTML file
htmlFiles.forEach(file => {
  console.log(`Processing ${file}...`);
  
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if renderer.js is already included
    if (content.includes('renderer.js')) {
      console.log(`  renderer.js already included in ${file}`);
      return;
    }
    
    // Find the closing body tag
    const bodyCloseIndex = content.lastIndexOf('</body>');
    
    if (bodyCloseIndex === -1) {
      console.log(`  Warning: Could not find </body> tag in ${file}`);
      return;
    }
    
    // Insert renderer.js script before closing body tag
    const updatedContent = 
      content.slice(0, bodyCloseIndex) + 
      '\n  <script src="renderer.js"></script>\n  ' +
      content.slice(bodyCloseIndex);
    
    // Write the updated content back to the file
    fs.writeFileSync(file, updatedContent, 'utf8');
    console.log(`  Updated ${file} successfully`);
  } catch (error) {
    console.error(`  Error processing ${file}:`, error.message);
  }
});

console.log('HTML files update complete.'); 