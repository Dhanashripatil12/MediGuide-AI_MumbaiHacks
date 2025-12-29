# MediGuide AI - Setup and Run Instructions

## Project Architecture

This is a **full-stack application** with three main parts:

1. **Frontend (React + Vite)** - `g:\mumbai hacks\medi`
   - React components with routing
   - Tailwind CSS styling
   - Multi-language support

2. **Backend (Python Flask)** - `g:\mumbai hacks\New folder\medi-guide-full`
   - RESTful API server
   - AI-powered medicine identification
   - User authentication
   - SQLite database (`mg.db`)

3. **Database Schemas (JSON)** - `g:\mumbai hacks\medi\entities`
   - JSON Schema definitions for database models
   - Used for validation and documentation
   - Types: Doctor, Prescription, MedicalProfile, EmergencyContact, PillIdentification

## Fixed Issues ✅

1. **File Extensions**: All component files were missing extensions (.jsx, .js). Fixed by adding proper extensions:
   - Pages: `.jsx` extension
   - Components: `.jsx` extension
   - Entities: `.js` extension
   - Utilities: `.js` extension

2. **Project Configuration**: Created necessary config files:
   - `package.json` - Node.js dependencies
   - `vite.config.js` - Vite bundler configuration
   - `tailwind.config.js` - Tailwind CSS configuration
   - `index.html` - HTML entry point
   - `src/main.jsx` - React app entry point
   - `src/App.jsx` - Main app component with routing

3. **Missing Dependencies**: Created essential UI components and utilities:
   - UI components (Button, Card, Badge, Alert, Sidebar)
   - Utils file with routing utilities
   - Base44 client mock for development

## Prerequisites

### For Backend (Python Flask) - ✅ Ready to Run
Python is already installed (v3.14.0) ✅

### For Frontend (React)
You need to install **Node.js**:
1. Download from: https://nodejs.org/
2. Install the LTS version (includes npm)
3. Restart your terminal

## Database Information

The project uses **SQLite** database (`mg.db`) with the following tables:
- `users` - User accounts with authentication
- `history` - Medicine identification history
- `medicines` - Medicine information and details

**Entity Schemas** (in `entities/` folder):
- `Doctor.js` - Doctor information schema
- `Prescription.js` - Prescription upload schema
- `MedicalProfile.js` - User medical profile schema
- `EmergencyContact.js` - Emergency contact schema
- `PillIdentification.js` - AI pill identification schema

These JSON schemas define the structure for database records and API validation.

## Running the Project

### Option 1: Run the Backend (Python Flask)

Since Node.js is not yet installed, you can run the Python backend:

\`\`\`powershell
# Navigate to the backend folder
cd "g:\\mumbai hacks\\New folder\\medi-guide-full"

# Install Python dependencies (if venv exists)
.\\venv\\Scripts\\Activate.ps1
pip install -r requirements.txt

# Run the Flask app
python app.py
\`\`\`

### Option 2: Install Node.js and Run the Frontend

1. **Install Node.js**:
   - Visit https://nodejs.org/
   - Download and install the LTS version
   - Restart your terminal

2. **Install Dependencies**:
\`\`\`powershell
cd "g:\\mumbai hacks\\medi"
npm install
\`\`\`

3. **Run Development Server**:
\`\`\`powershell
npm run dev
\`\`\`

The app will open at `https://medi-guide-ai-copy-0e833717.base44.app/`

## Project Features

- 🏥 **Dashboard**: Overview of your health information
- 💊 **Pill Identifier**: AI-powered medicine recognition
- 👨‍⚕️ **Doctor Search**: Find nearby doctors
- 🚨 **Emergency**: Quick access to emergency services
- ⚙️ **Settings**: Customize your preferences
- 🗣️ **Multi-language Support**: English, Hindi, Marathi
- 🎤 **Voice Navigation**: Navigate using voice commands

## Development Notes

- The project uses **Vite** as the build tool
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- Layout includes sidebar navigation with voice control

## Next Steps

1. Install Node.js from https://nodejs.org/
2. Run `npm install` in the medi folder
3. Run `npm run dev` to start the development server

## Troubleshooting

If you encounter any issues:
- Make sure Node.js is properly installed: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and run `npm install` again
