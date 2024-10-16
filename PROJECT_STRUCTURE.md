# Project Structure

```
├── public              # Static files (images, fonts, etc.)
│
├── src
│   ├── assets          # Project assets (images, icons, etc.)
│   ├── components      # Reusable UI components
│   │  ├── AiRobot.jsx          # Component to interact with an AI robot
│   │  ├── CallOpenAI.jsx       # Component to handle OpenAI API calls
│   │  ├── CusService.jsx       # Customer service chat interface
│   │  ├── Header.jsx           # Application header with navigation
│   │  ├── Loading.jsx          # Loading spinner component
│   │  ├── PopUp.jsx            # Pop-up modal for notifications
│   │  └── ProtectedLayout.jsx  # Layout wrapper to protect routes based on auth status
│   ├── contexts        # Contexts for state management
│   │  └── AuthContext.jsx      # Context for handling user authentication
│   ├── pages           # Application pages
│   │  ├── Appointment        # Appointment booking page
│   │  ├── DoctorProfile      # Page for displaying doctor profile information
│   │  ├── Registration       # Patient registration page
│   │  ├── CancelRegistration # Page to cancel appointments
│   │  ├── ClassSchedule      # Page to display doctor's class schedule
│   │  ├── ControlProgress    # Progress control and status page
│   │  ├── Login              # User login page
│   │  ├── Progress           # Progress tracking page
│   │  └── NotFound           # 404 error page for undefined routes
│   ├── styles
│   │  └── GlobalStyles.jsx   # Global styles for the entire application
│   ├── api.js          # API service functions to interact with backend
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Entry point for the React application
│
index.html              # Homepage, entry point for the web app
│
├── .gitignore          # Files to ignore in Git
├── package.json        # Project dependencies and scripts
├── vite.config.js      # Vite configuration file
├── .eslintrc.cjs       # ESLint configuration for code linting
├── firebase.json       # Firebase project configuration
├── yarn.lock           # Yarn lockfile for consistent package installations
└── README.md           # Project documentation
```