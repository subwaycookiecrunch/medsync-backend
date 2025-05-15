# MedSync Healthcare Monitoring System

MedSync is an advanced healthcare monitoring system with AI-powered features designed to help families and medical professionals monitor patient health.

## Easy Installation (Windows)

### Automatic Setup (Recommended)

1. Download the MedSync installer package
2. Right-click on `install-medsync.ps1` and select "Run with PowerShell"
3. The installer will automatically:
   - Install required dependencies (Node.js, etc.)
   - Configure the application
   - Create desktop and start menu shortcuts
   - Set up AI features based on your hardware capabilities

### Manual Installation

If the automatic installation doesn't work, follow these steps:

1. Install [Node.js](https://nodejs.org/) (version 16.x or higher)
2. Open PowerShell in the MedSync directory
3. Run `npm install` to install dependencies
4. Run `npm run first-run` to configure the application
5. Start the application with `npm start` or `npm run web`

## Features

### Family Dashboard

- Real-time health monitoring
- Medication tracking with pill detection (webcam required)
- Voice assistant for health inquiries (microphone required)
- AI-powered chat assistant
- Nutrition monitoring and analysis
- Emergency alerts and notifications

### Medical Staff Dashboard

- Advanced patient monitoring tools
- Detailed health analytics
- Medical parameter configuration
- Alert management system
- Patient records and history
- Comprehensive reporting tools

## System Requirements

- **Operating System**: Windows 10 or 11
- **Processor**: Intel Core i3 or equivalent (i5 or better recommended for AI features)
- **Memory**: 4GB RAM minimum (8GB or more recommended)
- **Storage**: 500MB free disk space
- **Optional Hardware**:
  - Webcam (for pill detection and vision monitoring)
  - Microphone (for voice assistant)

## Troubleshooting

If you encounter any issues during installation or usage:

1. Check if your system meets the minimum requirements
2. Try running `npm install` manually to reinstall dependencies
3. Make sure your webcam and microphone are working properly for AI features
4. Review the logs in `%APPDATA%\MedSync\logs` for error messages

## Privacy and Security

- All patient data is stored locally on your computer
- AI features can be disabled in settings
- No data is sent to external servers without explicit permission
- API keys (if used) are stored securely in your user profile

## License

MedSync is licensed under the MIT License. See the LICENSE file for details.

## Support

For support, please contact the MedSync support team or open an issue on our GitHub repository. 