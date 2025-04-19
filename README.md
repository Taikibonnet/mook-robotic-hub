# MOOK Robotics Hub

MOOK Robotics Hub is an interactive, futuristic online encyclopedia about robotics. This project aims to create an engaging platform for robotics enthusiasts to discover and learn about various robots, their specifications, features, and latest news in the field of robotics.

![MOOK Robotics Hub](https://raw.githubusercontent.com/Taikibonnet/mook-robotic-hub/main/images/mook-preview.png)

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Firebase Setup](#firebase-setup)
- [Usage](#usage)
  - [User Features](#user-features)
  - [Admin Features](#admin-features)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Interactive Robot Encyclopedia**: Detailed information about various robots including specifications, features, images, and videos.
- **User Authentication**: Account creation and login functionality for users to save favorites and receive updates.
- **Search & Filter**: Advanced search functionality with filtering by categories and sorting options.
- **AI Assistant**: Interactive AI guide named MOOK to help users navigate the website and answer robotics questions.
- **Admin Dashboard**: Content management system for administrators to add, edit, and delete robot information and news articles.
- **Responsive Design**: Mobile-friendly interface that works across devices of all sizes.
- **Dark/Light Theme**: Toggle between dark and light modes for comfortable viewing.

## Getting Started

### Prerequisites

- A GitHub account
- Basic understanding of HTML, CSS, and JavaScript
- Firebase account (for database and authentication)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Taikibonnet/mook-robotic-hub.git
cd mook-robotic-hub
```

2. **Set up GitHub Pages:**

   - Go to your repository settings on GitHub
   - Scroll down to the GitHub Pages section
   - Select the main branch as the source
   - Save the settings

   Your website will be published at `https://[your-username].github.io/mook-robotic-hub/`

### Firebase Setup

1. **Create a Firebase project:**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup steps
   - Enable Authentication, Firestore Database, and Storage

2. **Set up Firebase Authentication:**

   - In the Firebase console, go to Authentication > Sign-in method
   - Enable Email/Password authentication

3. **Set up Firestore Database:**

   - Go to Firestore Database > Create database
   - Start in production mode
   - Choose a location close to your target audience

4. **Set up Firebase Storage:**

   - Go to Storage > Get started
   - Follow the setup instructions

5. **Get your Firebase configuration:**

   - Go to Project Settings > Your apps
   - Click the web icon (</>) to add a web app
   - Register your app with a nickname
   - Copy the firebaseConfig object

6. **Update Firebase configuration in the project:**

   - Open `index.html`, `search.html`, and any other HTML files with Firebase integration
   - Replace the placeholder firebaseConfig with your actual configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

7. **Initialize the admin account:**

   - Use the credentials provided in your project setup:
     - Email: tgen.robotics@gmail.com
     - Password: Admin123!
   - Navigate to the website and log in with these credentials
   - The system will automatically set up the admin account

## Usage

### User Features

1. **Browse the Encyclopedia:**
   - Navigate to the "Encyclopedia" section to view all robots
   - Click on individual robot cards to see detailed information

2. **Search for Robots:**
   - Use the search bar at the top of the page to find specific robots
   - Apply filters and sorting options on the search results page

3. **Create an Account:**
   - Click the "Sign Up" button to create a new account
   - Fill in the required information
   - Verify your email if prompted

4. **Login to Your Account:**
   - Click the "Login" button
   - Enter your email and password
   - Access your personalized features

5. **Use the AI Assistant:**
   - Click the "Ask MOOK" button to activate the AI assistant
   - Ask questions about robotics or how to navigate the website

6. **Subscribe to the Newsletter:**
   - Enter your email in the newsletter form at the bottom of the homepage
   - Receive updates on new robots and news articles

### Admin Features

1. **Access the Admin Dashboard:**
   - Login with an admin account
   - Click the "Admin Dashboard" link in the footer

2. **Manage Robots:**
   - Add new robots with detailed information, images, and videos
   - Edit existing robot entries
   - Delete robots from the database

3. **Manage News:**
   - Add new news articles
   - Edit existing articles
   - Delete news articles

4. **Initialize Database:**
   - Use the "Initialize Database" button to populate the database with sample data
   - This is useful for testing or when setting up a new instance

## Project Structure

```
mook-robotic-hub/
│
├── admin/                      # Admin dashboard files
│   ├── add-robot.html          # Form for adding/editing robots
│   └── dashboard.html          # Main admin dashboard
│
├── css/                        # Stylesheet files
│   ├── admin.css               # Admin dashboard styles
│   ├── encyclopedia.css        # Encyclopedia page styles
│   ├── robot-detail.css        # Robot detail page styles
│   ├── style.css               # Main stylesheet
│   └── theme.css               # Theme variables (light/dark)
│
├── js/                         # JavaScript files
│   ├── admin.js                # Admin functionality
│   ├── ai-assistant.js         # AI assistant functionality
│   ├── auth.js                 # Authentication functionality
│   ├── database.js             # Database operations
│   ├── encyclopedia.js         # Encyclopedia page functionality
│   ├── firebase-config.js      # Firebase configuration
│   ├── main.js                 # Main JavaScript functionality
│   ├── robot-detail.js         # Robot detail page functionality
│   └── search.js               # Search functionality
│
├── robots/                     # Robot pages
│   ├── atlas.html              # Example robot detail page
│   └── index.html              # Encyclopedia main page
│
├── images/                     # Image assets
│
├── index.html                  # Homepage
├── search.html                 # Search results page
├── about.html                  # About page
└── README.md                   # Project documentation
```

## Technologies Used

- **Frontend:**
  - HTML5
  - CSS3 (with CSS variables for theming)
  - JavaScript (ES6+)
  - Font Awesome (for icons)

- **Backend & Database:**
  - Firebase Authentication (user management)
  - Firebase Firestore (database)
  - Firebase Storage (image and video storage)

- **Hosting:**
  - GitHub Pages

## Future Improvements

Here are some potential enhancements for future development:

1. **Mobile Application:** 
   - Develop a companion mobile app using React Native or Flutter
   - Implement offline functionality for browsing robots without internet

2. **Advanced AI Features:**
   - Implement more sophisticated AI assistant functionality
   - Add robot recognition from images

3. **Community Features:**
   - User comments and discussions
   - User-contributed robot entries (with admin approval)
   - Rating system for robots

4. **Interactive 3D Models:**
   - Add WebGL-based 3D models of robots that users can interact with
   - Virtual reality (VR) and augmented reality (AR) experiences

5. **Content Expansion:**
   - Historical timeline of robotics
   - Educational resources and tutorials
   - Job board for robotics professionals

## Getting Started with Development

If you want to contribute to the development of MOOK Robotics Hub, follow these steps:

1. Fork the repository
2. Clone your forked repository to your local machine
3. Make your changes
4. Test your changes locally
5. Commit and push your changes to your fork
6. Create a pull request to the main repository

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Owner: [Taikibonnet](https://github.com/Taikibonnet)

Project Link: [https://github.com/Taikibonnet/mook-robotic-hub](https://github.com/Taikibonnet/mook-robotic-hub)

---

© 2025 MOOK Robotics Hub. All rights reserved.