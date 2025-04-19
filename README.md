# MOOK Robotics Hub

MOOK Robotics Hub is an interactive, futuristic online encyclopedia about robotics. This project aims to create an engaging platform for robotics enthusiasts to discover and learn about various robots, their specifications, features, and latest news in the field of robotics.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [User Features](#user-features)
  - [Admin Features](#admin-features)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Adding Images](#adding-images)
- [Customization](#customization)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Interactive Robot Encyclopedia**: Detailed information about various robots including specifications, features, images, and videos.
- **User Authentication**: Simple account system (using local storage for demo purposes).
- **Search & Filter**: Advanced search functionality with filtering by categories and sorting options.
- **AI Assistant**: Interactive AI guide named MOOK to help users navigate the website and answer robotics questions.
- **Responsive Design**: Mobile-friendly interface that works across devices of all sizes.
- **Dark/Light Theme**: Toggle between dark and light modes for comfortable viewing.

## Getting Started

### Prerequisites

- A GitHub account (to fork/clone the repository)
- Basic understanding of HTML, CSS, and JavaScript

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

3. **Test locally (optional):**
   
   You can run the website locally using any simple web server, for example:
   
   - With Python: `python -m http.server` (Python 3) or `python -m SimpleHTTPServer` (Python 2)
   - With Node.js: Install `http-server` with `npm install -g http-server` and run `http-server`

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
   - For this demo version, accounts are stored in local storage

4. **Login to Your Account:**
   - Click the "Login" button
   - Enter your email and password
   - For demo/testing purposes, you can use:
     - Email: tgen.robotics@gmail.com
     - Password: Admin123!

5. **Use the AI Assistant:**
   - Click the "Ask MOOK" button to activate the AI assistant
   - Ask questions about robotics or how to navigate the website

6. **Subscribe to the Newsletter:**
   - Enter your email in the newsletter form at the bottom of the homepage
   - For demo purposes, this doesn't actually send emails

### Admin Features

1. **Access the Admin Dashboard:**
   - Login with the admin account (tgen.robotics@gmail.com / Admin123!)
   - Click the "Admin Dashboard" link in the footer
   
   Note: In this static version, admin functionality is limited, but the UI is in place for demonstration.

## Project Structure

```
mook-robotic-hub/
│
├── css/                        # Stylesheet files
│   ├── admin.css               # Admin dashboard styles
│   ├── encyclopedia.css        # Encyclopedia page styles
│   ├── robot-detail.css        # Robot detail page styles
│   ├── style.css               # Main stylesheet
│   └── theme.css               # Theme variables (light/dark)
│
├── js/                         # JavaScript files
│   ├── ai-assistant.js         # AI assistant functionality
│   ├── data.js                 # Static data for robots and news
│   ├── main.js                 # Main JavaScript functionality
│   ├── search.js               # Search functionality
│   └── static-services.js      # Service implementations
│
├── images/                     # Image assets
│   └── robots/                 # Robot images
│   └── news/                   # News images
│
├── robots/                     # Robot pages
│   ├── atlas.html              # Example robot detail page
│   └── index.html              # Encyclopedia main page
│
├── admin/                      # Admin dashboard pages
│
├── index.html                  # Homepage
├── search.html                 # Search results page
└── README.md                   # Project documentation
```

## Technologies Used

- **Frontend:**
  - HTML5
  - CSS3 (with CSS variables for theming)
  - JavaScript (ES6+)
  - Font Awesome (for icons)

- **Hosting:**
  - GitHub Pages

## Adding Images

To add images for robots and news articles:

1. Create the following directory structure in the `images` folder:
   - `images/robots/` - For robot images
   - `images/news/` - For news article images

2. Add images with the filenames referenced in the `data.js` file. For example:
   - `images/robots/atlas.jpg`
   - `images/robots/spot.jpg`
   - etc.

3. You can find royalty-free robot images from sites like:
   - [Unsplash](https://unsplash.com)
   - [Pexels](https://pexels.com)
   - [Pixabay](https://pixabay.com)

4. Make sure to optimize your images for web use to ensure fast loading times.

## Customization

### Adding New Robots

To add new robots to the encyclopedia:

1. Open `js/data.js`
2. Add a new robot object to the `ROBOTS_DATA` array following the existing format
3. Add corresponding images to the `images/robots/` directory

### Modifying Theme Colors

To change the theme colors:

1. Open `css/theme.css`
2. Modify the color variables in the `:root` selector for light theme
3. Modify the color variables in the `[data-theme="dark"]` selector for dark theme

## Future Improvements

For a more robust implementation, consider these future enhancements:

1. **Backend Integration**
   - Implement a proper backend with a database (e.g., Firebase, MongoDB)
   - Create secure user authentication
   - Add real admin functionality for content management

2. **Advanced Features**
   - Implement a more sophisticated AI assistant
   - Add user comments and ratings
   - Create a user profile page with saved/favorite robots

3. **Content Expansion**
   - Add more robot categories and entries
   - Create a timeline of robotics history
   - Include educational resources and tutorials

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

© 2025 MOOK Robotics Hub. All rights reserved.