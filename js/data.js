// Static data for MOOK Robotics Hub
// This replaces Firebase for a purely static implementation

// Robot data
const ROBOTS_DATA = [
  {
    id: "robot-001",
    name: "Atlas",
    slug: "atlas",
    description: "Humanoid robot designed for mobility and manipulation",
    manufacturer: "Boston Dynamics",
    year: 2013,
    features: [
      "3D printed hydraulic actuators",
      "28 degrees of freedom",
      "Advanced balance and coordination"
    ],
    specifications: {
      height: "1.5 meters",
      weight: "80 kg",
      powerSource: "Electric",
      batteryLife: "1 hour"
    },
    category: "Humanoid",
    featured: true,
    mainImage: "images/robots/atlas.jpg",
    gallery: ["images/robots/atlas-1.jpg", "images/robots/atlas-2.jpg"],
    content: "<p>Atlas is a bipedal humanoid robot primarily developed by Boston Dynamics with funding and oversight from DARPA. The robot was initially designed for a variety of search and rescue tasks, such as entering buildings, closing valves, and operating powered equipment in environments where humans could not survive.</p><p>The Atlas robot's control system coordinates motions of the arms, torso and legs to achieve whole-body mobile manipulation, greatly expanding its reach and workspace. Atlas uses sensors embedded in its body and legs to balance and LIDAR and stereo sensors in its head to avoid obstacles, assess the terrain, help with navigation and manipulate objects.</p>"
  },
  {
    id: "robot-002",
    name: "Spot",
    slug: "spot",
    description: "Agile mobile robot that navigates terrain with unprecedented mobility",
    manufacturer: "Boston Dynamics",
    year: 2015,
    features: [
      "360-degree perception",
      "Obstacle avoidance",
      "Autonomous navigation"
    ],
    specifications: {
      height: "0.84 meters",
      weight: "32.5 kg",
      powerSource: "Electric",
      batteryLife: "90 minutes"
    },
    category: "Quadruped",
    featured: true,
    mainImage: "images/robots/spot.jpg",
    gallery: ["images/robots/spot-1.jpg", "images/robots/spot-2.jpg"],
    content: "<p>Spot is a four-legged robot developed by Boston Dynamics. It is the company's first commercially available robot and is designed for industrial and commercial uses. Spot can navigate terrain that would be challenging for a wheeled robot, making it ideal for applications like remote inspection, data collection, and security.</p><p>The robot can be controlled remotely or can follow pre-programmed paths autonomously. It can carry payloads of up to 14 kg and can be equipped with a variety of sensors and cameras depending on the application.</p>"
  },
  {
    id: "robot-003",
    name: "Sophia",
    slug: "sophia",
    description: "Advanced humanoid robot with expressive face and conversational AI",
    manufacturer: "Hanson Robotics",
    year: 2016,
    features: [
      "Natural language processing",
      "Facial recognition",
      "Emotional expression"
    ],
    specifications: {
      height: "Variable",
      weight: "Not disclosed",
      powerSource: "Electric",
      batteryLife: "Not disclosed"
    },
    category: "Humanoid",
    featured: true,
    mainImage: "images/robots/sophia.jpg",
    gallery: ["images/robots/sophia-1.jpg", "images/robots/sophia-2.jpg"],
    content: "<p>Sophia is a social humanoid robot developed by Hanson Robotics. She was designed to respond to questions and has been interviewed around the world. The robot, modeled after actress Audrey Hepburn, is known for her human-like appearance and behavior compared to previous robotic variants.</p><p>Sophia uses artificial intelligence, visual data processing, and facial recognition. She also imitates human gestures and facial expressions and is able to answer certain questions and to make simple conversations on predefined topics.</p>"
  },
  {
    id: "robot-004",
    name: "Pepper",
    slug: "pepper",
    description: "Semi-humanoid robot designed for human interaction",
    manufacturer: "SoftBank Robotics",
    year: 2014,
    features: [
      "Emotion recognition",
      "Speech recognition",
      "Visual tracking"
    ],
    specifications: {
      height: "1.2 meters",
      weight: "28 kg",
      powerSource: "Electric",
      batteryLife: "12 hours"
    },
    category: "Humanoid",
    featured: false,
    mainImage: "images/robots/pepper.jpg",
    gallery: ["images/robots/pepper-1.jpg"],
    content: "<p>Pepper is a semi-humanoid robot manufactured by SoftBank Robotics. The robot is designed to be a genuine day-to-day companion, whose number one quality is his ability to perceive emotions.</p><p>Pepper can analyze facial expressions, body language and verbal cues to identify emotions and adapt its behavior accordingly. It's primarily used in retail, hospitality, and educational settings to provide information, assist customers, and create engaging interactive experiences.</p>"
  },
  {
    id: "robot-005",
    name: "NAO",
    slug: "nao",
    description: "Small programmable humanoid robot used in education and research",
    manufacturer: "SoftBank Robotics",
    year: 2008,
    features: [
      "25 degrees of freedom",
      "Voice recognition",
      "Face detection"
    ],
    specifications: {
      height: "58 cm",
      weight: "4.3 kg",
      powerSource: "Electric",
      batteryLife: "90 minutes"
    },
    category: "Humanoid",
    featured: false,
    mainImage: "images/robots/nao.jpg",
    gallery: [],
    content: "<p>NAO is an autonomous, programmable humanoid robot developed by SoftBank Robotics. Standing at just 58 cm tall, NAO is used in education, research, and healthcare settings worldwide.</p><p>The robot features advanced motion, vision, and audio capabilities, making it ideal for human-robot interaction research. It has become a standard platform in university robotics programs and is also used to assist children with autism in learning social and communication skills.</p>"
  }
];

// News data
const NEWS_DATA = [
  {
    id: "news-001",
    title: "Advances in Soft Robotics",
    slug: "advances-in-soft-robotics",
    content: "<p>New materials enable robots with unprecedented flexibility and adaptability, paving the way for applications in healthcare, search and rescue, and more. Researchers have developed a new type of soft actuator that mimics natural muscle movement, allowing for more human-like motion in robotic systems.</p><p>This breakthrough could lead to prosthetics that move more naturally and robots that can navigate complex environments with ease.</p>",
    publishDate: "2025-04-10T12:00:00Z",
    author: "Dr. Sarah Chen",
    category: "Research",
    image: "images/news/soft-robotics.jpg"
  },
  {
    id: "news-002",
    title: "Robots in Healthcare",
    slug: "robots-in-healthcare",
    content: "<p>How medical robots are transforming surgery and patient care across hospitals worldwide. From surgical assistants to automated medication dispensing, robots are helping healthcare professionals provide better care with greater precision and efficiency.</p><p>Recent studies have shown that robot-assisted surgeries can lead to shorter recovery times and reduced complications in certain procedures.</p>",
    publishDate: "2025-04-05T14:30:00Z",
    author: "Michael Rodriguez",
    category: "Healthcare",
    image: "images/news/healthcare-robots.jpg"
  },
  {
    id: "news-003",
    title: "AI Revolution in Robotics",
    slug: "ai-revolution-in-robotics",
    content: "<p>The latest advancements in robot intelligence and decision-making are creating more autonomous and capable machines. Neural network architectures specifically designed for robotic control are enabling robots to learn complex tasks with minimal human supervision.</p><p>These developments are particularly promising for industrial applications where robots need to adapt to changing conditions and work alongside human colleagues safely.</p>",
    publishDate: "2025-03-28T09:15:00Z",
    author: "Alex Patel",
    category: "Artificial Intelligence",
    image: "images/news/ai-robotics.jpg"
  }
];

// AI Assistant responses
const ASSISTANT_RESPONSES = [
  {
    keyword: "about",
    response: "MOOK Robotics Hub is an interactive encyclopedia dedicated to all things robotics. We provide information on various robots, from industrial to humanoid, with detailed specifications, features, and media content."
  },
  {
    keyword: "navigation",
    response: "You can navigate our site using the main menu at the top. The 'Encyclopedia' section contains all our robot entries, or you can use the search bar to find specific robots or topics."
  },
  {
    keyword: "account",
    response: "Creating an account allows you to save your favorite robots, receive updates on new entries, and customize your experience. Simply click the 'Sign Up' button in the top right corner."
  },
  {
    keyword: "contact",
    response: "You can contact us through the 'Contact' link in the footer, or email us directly at info@mookrobotics.com."
  },
  {
    keyword: "robot",
    response: "Our encyclopedia features various robots categorized by type, manufacturer, and capabilities. You can browse all robots in the Encyclopedia section or search for specific ones using the search bar."
  },
  {
    keyword: "humanoid",
    response: "Humanoid robots are designed to resemble the human body structure. Examples in our database include Atlas, Sophia, and NAO. You can find these in the 'Humanoid' category in our encyclopedia."
  },
  {
    keyword: "news",
    response: "We regularly publish news articles about the latest developments in robotics. Check out our News section for recent articles on research breakthroughs, applications, and industry trends."
  }
];

// User data (for demo purposes)
const USERS_DATA = [
  {
    id: "admin-001",
    email: "tgen.robotics@gmail.com",
    password: "Admin123!",
    name: "Administrator",
    role: "admin",
    createdAt: "2025-01-01T00:00:00Z"
  }
];

// Export the data for use in other modules
export { ROBOTS_DATA, NEWS_DATA, ASSISTANT_RESPONSES, USERS_DATA };