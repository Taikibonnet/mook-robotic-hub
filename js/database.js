// Database Service for MOOK Robotics Hub
// This file manages all database operations for robots, news, and other content

import { 
    db, 
    storage,
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from './firebase-config.js';

// Robot Database Operations
export const robotService = {
    // Get all robots
    async getAllRobots() {
        try {
            const robotsCollection = collection(db, "robots");
            const robotSnapshot = await getDocs(robotsCollection);
            return robotSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting robots:", error);
            throw error;
        }
    },
    
    // Get featured robots
    async getFeaturedRobots(count = 3) {
        try {
            const robotsCollection = collection(db, "robots");
            const featuredQuery = query(
                robotsCollection,
                where("featured", "==", true),
                limit(count)
            );
            const robotSnapshot = await getDocs(featuredQuery);
            return robotSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting featured robots:", error);
            throw error;
        }
    },
    
    // Get a single robot by ID
    async getRobotById(robotId) {
        try {
            const robotDoc = await getDoc(doc(db, "robots", robotId));
            if (robotDoc.exists()) {
                return {
                    id: robotDoc.id,
                    ...robotDoc.data()
                };
            } else {
                throw new Error("Robot not found");
            }
        } catch (error) {
            console.error("Error getting robot:", error);
            throw error;
        }
    },
    
    // Get a robot by slug (URL-friendly name)
    async getRobotBySlug(slug) {
        try {
            const robotsCollection = collection(db, "robots");
            const slugQuery = query(
                robotsCollection,
                where("slug", "==", slug)
            );
            const robotSnapshot = await getDocs(slugQuery);
            
            if (robotSnapshot.empty) {
                throw new Error("Robot not found");
            }
            
            const robotDoc = robotSnapshot.docs[0];
            return {
                id: robotDoc.id,
                ...robotDoc.data()
            };
        } catch (error) {
            console.error("Error getting robot by slug:", error);
            throw error;
        }
    },
    
    // Search robots by keyword
    async searchRobots(keyword) {
        try {
            // This is a basic implementation - full-text search would require additional services
            // For production, consider using Algolia or similar search service
            const robotsCollection = collection(db, "robots");
            const robotSnapshot = await getDocs(robotsCollection);
            const allRobots = robotSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Simple client-side search by name and description
            const lowercaseKeyword = keyword.toLowerCase();
            return allRobots.filter(robot => 
                robot.name.toLowerCase().includes(lowercaseKeyword) ||
                robot.description.toLowerCase().includes(lowercaseKeyword) ||
                (robot.features && robot.features.some(feature => 
                    feature.toLowerCase().includes(lowercaseKeyword)
                ))
            );
        } catch (error) {
            console.error("Error searching robots:", error);
            throw error;
        }
    },
    
    // Add a new robot
    async addRobot(robotData, mainImage, galleryImages = [], videoFile = null) {
        try {
            // Create a slug from the robot name
            const slug = this.createSlug(robotData.name);
            
            // Check if slug already exists
            try {
                await this.getRobotBySlug(slug);
                throw new Error("A robot with this name already exists");
            } catch (error) {
                // If error is "Robot not found", we can continue
                if (error.message !== "Robot not found") {
                    throw error;
                }
            }
            
            // Upload main image
            let mainImageUrl = "";
            if (mainImage) {
                mainImageUrl = await this.uploadImage(mainImage, `robots/${slug}/main`);
            }
            
            // Upload gallery images
            const galleryUrls = [];
            if (galleryImages.length > 0) {
                for (let i = 0; i < galleryImages.length; i++) {
                    const url = await this.uploadImage(galleryImages[i], `robots/${slug}/gallery/${i}`);
                    galleryUrls.push(url);
                }
            }
            
            // Upload video
            let videoUrl = "";
            if (videoFile) {
                videoUrl = await this.uploadVideo(videoFile, `robots/${slug}/video`);
            }
            
            // Prepare robot data
            const robotWithMedia = {
                ...robotData,
                slug,
                mainImage: mainImageUrl,
                gallery: galleryUrls,
                video: videoUrl,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Add to Firestore
            const docRef = await addDoc(collection(db, "robots"), robotWithMedia);
            return {
                id: docRef.id,
                ...robotWithMedia
            };
        } catch (error) {
            console.error("Error adding robot:", error);
            throw error;
        }
    },
    
    // Update an existing robot
    async updateRobot(robotId, robotData, mainImage = null, newGalleryImages = [], videoFile = null) {
        try {
            // Get existing robot data
            const existingRobot = await this.getRobotById(robotId);
            const slug = existingRobot.slug;
            
            // Handle main image update
            let mainImageUrl = existingRobot.mainImage;
            if (mainImage) {
                // Delete old image if it exists
                if (existingRobot.mainImage) {
                    await this.deleteImage(existingRobot.mainImage);
                }
                // Upload new image
                mainImageUrl = await this.uploadImage(mainImage, `robots/${slug}/main`);
            }
            
            // Handle gallery images
            let galleryUrls = [...(existingRobot.gallery || [])];
            if (newGalleryImages.length > 0) {
                for (let i = 0; i < newGalleryImages.length; i++) {
                    const url = await this.uploadImage(
                        newGalleryImages[i], 
                        `robots/${slug}/gallery/${galleryUrls.length + i}`
                    );
                    galleryUrls.push(url);
                }
            }
            
            // Handle video update
            let videoUrl = existingRobot.video || "";
            if (videoFile) {
                // Delete old video if it exists
                if (existingRobot.video) {
                    await this.deleteVideo(existingRobot.video);
                }
                // Upload new video
                videoUrl = await this.uploadVideo(videoFile, `robots/${slug}/video`);
            }
            
            // Prepare updated robot data
            const updatedRobot = {
                ...robotData,
                slug,
                mainImage: mainImageUrl,
                gallery: galleryUrls,
                video: videoUrl,
                updatedAt: new Date().toISOString()
            };
            
            // Update in Firestore
            await updateDoc(doc(db, "robots", robotId), updatedRobot);
            
            return {
                id: robotId,
                ...updatedRobot
            };
        } catch (error) {
            console.error("Error updating robot:", error);
            throw error;
        }
    },
    
    // Delete a robot
    async deleteRobot(robotId) {
        try {
            // Get robot data to delete associated media
            const robot = await this.getRobotById(robotId);
            
            // Delete main image
            if (robot.mainImage) {
                await this.deleteImage(robot.mainImage);
            }
            
            // Delete gallery images
            if (robot.gallery && robot.gallery.length > 0) {
                for (const imageUrl of robot.gallery) {
                    await this.deleteImage(imageUrl);
                }
            }
            
            // Delete video
            if (robot.video) {
                await this.deleteVideo(robot.video);
            }
            
            // Delete from Firestore
            await deleteDoc(doc(db, "robots", robotId));
            
            return true;
        } catch (error) {
            console.error("Error deleting robot:", error);
            throw error;
        }
    },
    
    // Delete a specific gallery image
    async deleteGalleryImage(robotId, imageUrl) {
        try {
            // Get robot data
            const robot = await this.getRobotById(robotId);
            
            // Remove image from gallery array
            const updatedGallery = robot.gallery.filter(url => url !== imageUrl);
            
            // Update robot document
            await updateDoc(doc(db, "robots", robotId), {
                gallery: updatedGallery,
                updatedAt: new Date().toISOString()
            });
            
            // Delete the image file
            await this.deleteImage(imageUrl);
            
            return updatedGallery;
        } catch (error) {
            console.error("Error deleting gallery image:", error);
            throw error;
        }
    },
    
    // Utility: Create a URL-friendly slug from a name
    createSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')      // Replace spaces with hyphens
            .replace(/--+/g, '-')      // Replace multiple hyphens with a single hyphen
            .trim();
    },
    
    // Utility: Upload an image to Firebase Storage
    async uploadImage(imageFile, path) {
        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, imageFile);
            return await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }
    },
    
    // Utility: Delete an image from Firebase Storage
    async deleteImage(imageUrl) {
        try {
            const imageRef = ref(storage, this.getStoragePathFromUrl(imageUrl));
            await deleteObject(imageRef);
            return true;
        } catch (error) {
            console.error("Error deleting image:", error);
            throw error;
        }
    },
    
    // Utility: Upload a video to Firebase Storage
    async uploadVideo(videoFile, path) {
        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, videoFile);
            return await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error("Error uploading video:", error);
            throw error;
        }
    },
    
    // Utility: Delete a video from Firebase Storage
    async deleteVideo(videoUrl) {
        try {
            const videoRef = ref(storage, this.getStoragePathFromUrl(videoUrl));
            await deleteObject(videoRef);
            return true;
        } catch (error) {
            console.error("Error deleting video:", error);
            throw error;
        }
    },
    
    // Utility: Extract storage path from download URL
    getStoragePathFromUrl(url) {
        // This is a simplified version - might need adjustment based on actual URL format
        const baseUrl = "https://firebasestorage.googleapis.com/v0/b/mook-robotics-hub.appspot.com/o/";
        let path = url.replace(baseUrl, "");
        // Remove query parameters
        const queryIndex = path.indexOf("?");
        if (queryIndex !== -1) {
            path = path.substring(0, queryIndex);
        }
        // Replace URL encoding
        return decodeURIComponent(path);
    }
};

// News Database Operations
export const newsService = {
    // Get all news articles
    async getAllNews() {
        try {
            const newsCollection = collection(db, "news");
            const newsQuery = query(
                newsCollection,
                orderBy("publishDate", "desc")
            );
            const newsSnapshot = await getDocs(newsQuery);
            return newsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting news:", error);
            throw error;
        }
    },
    
    // Get recent news
    async getRecentNews(count = 3) {
        try {
            const newsCollection = collection(db, "news");
            const recentQuery = query(
                newsCollection,
                orderBy("publishDate", "desc"),
                limit(count)
            );
            const newsSnapshot = await getDocs(recentQuery);
            return newsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting recent news:", error);
            throw error;
        }
    },
    
    // Get a single news article by ID
    async getNewsById(newsId) {
        try {
            const newsDoc = await getDoc(doc(db, "news", newsId));
            if (newsDoc.exists()) {
                return {
                    id: newsDoc.id,
                    ...newsDoc.data()
                };
            } else {
                throw new Error("News article not found");
            }
        } catch (error) {
            console.error("Error getting news article:", error);
            throw error;
        }
    },
    
    // Get news by slug
    async getNewsBySlug(slug) {
        try {
            const newsCollection = collection(db, "news");
            const slugQuery = query(
                newsCollection,
                where("slug", "==", slug)
            );
            const newsSnapshot = await getDocs(slugQuery);
            
            if (newsSnapshot.empty) {
                throw new Error("News article not found");
            }
            
            const newsDoc = newsSnapshot.docs[0];
            return {
                id: newsDoc.id,
                ...newsDoc.data()
            };
        } catch (error) {
            console.error("Error getting news by slug:", error);
            throw error;
        }
    },
    
    // Add a news article
    async addNews(newsData, image = null) {
        try {
            // Create a slug from the title
            const slug = this.createSlug(newsData.title);
            
            // Check if slug already exists
            try {
                await this.getNewsBySlug(slug);
                throw new Error("A news article with this title already exists");
            } catch (error) {
                // If error is "News article not found", we can continue
                if (error.message !== "News article not found") {
                    throw error;
                }
            }
            
            // Upload image if provided
            let imageUrl = "";
            if (image) {
                imageUrl = await this.uploadImage(image, `news/${slug}/image`);
            }
            
            // Prepare news data
            const newsWithImage = {
                ...newsData,
                slug,
                image: imageUrl,
                publishDate: newsData.publishDate || new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Add to Firestore
            const docRef = await addDoc(collection(db, "news"), newsWithImage);
            return {
                id: docRef.id,
                ...newsWithImage
            };
        } catch (error) {
            console.error("Error adding news:", error);
            throw error;
        }
    },
    
    // Update a news article
    async updateNews(newsId, newsData, image = null) {
        try {
            // Get existing news data
            const existingNews = await this.getNewsById(newsId);
            const slug = existingNews.slug;
            
            // Handle image update
            let imageUrl = existingNews.image;
            if (image) {
                // Delete old image if it exists
                if (existingNews.image) {
                    await this.deleteImage(existingNews.image);
                }
                // Upload new image
                imageUrl = await this.uploadImage(image, `news/${slug}/image`);
            }
            
            // Prepare updated news data
            const updatedNews = {
                ...newsData,
                slug,
                image: imageUrl,
                updatedAt: new Date().toISOString()
            };
            
            // Update in Firestore
            await updateDoc(doc(db, "news", newsId), updatedNews);
            
            return {
                id: newsId,
                ...updatedNews
            };
        } catch (error) {
            console.error("Error updating news:", error);
            throw error;
        }
    },
    
    // Delete a news article
    async deleteNews(newsId) {
        try {
            // Get news data to delete associated media
            const news = await this.getNewsById(newsId);
            
            // Delete image if it exists
            if (news.image) {
                await this.deleteImage(news.image);
            }
            
            // Delete from Firestore
            await deleteDoc(doc(db, "news", newsId));
            
            return true;
        } catch (error) {
            console.error("Error deleting news:", error);
            throw error;
        }
    },
    
    // Utility: Create a URL-friendly slug from a title
    createSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')      // Replace spaces with hyphens
            .replace(/--+/g, '-')      // Replace multiple hyphens with a single hyphen
            .trim();
    },
    
    // Use the same media utilities as robotService
    uploadImage: robotService.uploadImage,
    deleteImage: robotService.deleteImage,
    getStoragePathFromUrl: robotService.getStoragePathFromUrl
};

// AI Assistant Database Operations
export const assistantService = {
    // Get predefined responses
    async getResponses() {
        try {
            const responsesCollection = collection(db, "assistantResponses");
            const responsesSnapshot = await getDocs(responsesCollection);
            return responsesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting assistant responses:", error);
            throw error;
        }
    },
    
    // Log user questions for improvement
    async logQuestion(question, response) {
        try {
            await addDoc(collection(db, "assistantLogs"), {
                question,
                response,
                timestamp: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error("Error logging assistant question:", error);
            throw error;
        }
    },
    
    // Add a predefined response
    async addResponse(keyword, response) {
        try {
            const docRef = await addDoc(collection(db, "assistantResponses"), {
                keyword,
                response,
                createdAt: new Date().toISOString()
            });
            return {
                id: docRef.id,
                keyword,
                response
            };
        } catch (error) {
            console.error("Error adding assistant response:", error);
            throw error;
        }
    }
};

// Initialize database with sample data if empty
export async function initializeDatabase() {
    try {
        // Check if robots collection is empty
        const robotsCollection = collection(db, "robots");
        const robotSnapshot = await getDocs(robotsCollection);
        
        if (robotSnapshot.empty) {
            console.log("Initializing database with sample robots...");
            
            // Add sample robots
            const sampleRobots = [
                {
                    name: "Atlas",
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
                    content: "<p>Atlas is a bipedal humanoid robot primarily developed by Boston Dynamics with funding and oversight from DARPA. The robot was initially designed for a variety of search and rescue tasks, such as entering buildings, closing valves, and operating powered equipment in environments where humans could not survive.</p><p>The Atlas robot's control system coordinates motions of the arms, torso and legs to achieve whole-body mobile manipulation, greatly expanding its reach and workspace. Atlas uses sensors embedded in its body and legs to balance and LIDAR and stereo sensors in its head to avoid obstacles, assess the terrain, help with navigation and manipulate objects.</p>"
                },
                {
                    name: "Spot",
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
                    content: "<p>Spot is a four-legged robot developed by Boston Dynamics. It is the company's first commercially available robot and is designed for industrial and commercial uses. Spot can navigate terrain that would be challenging for a wheeled robot, making it ideal for applications like remote inspection, data collection, and security.</p><p>The robot can be controlled remotely or can follow pre-programmed paths autonomously. It can carry payloads of up to 14 kg and can be equipped with a variety of sensors and cameras depending on the application.</p>"
                },
                {
                    name: "Sophia",
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
                    content: "<p>Sophia is a social humanoid robot developed by Hanson Robotics. She was designed to respond to questions and has been interviewed around the world. The robot, modeled after actress Audrey Hepburn, is known for her human-like appearance and behavior compared to previous robotic variants.</p><p>Sophia uses artificial intelligence, visual data processing, and facial recognition. She also imitates human gestures and facial expressions and is able to answer certain questions and to make simple conversations on predefined topics.</p>"
                }
            ];
            
            for (const robot of sampleRobots) {
                await addDoc(collection(db, "robots"), {
                    ...robot,
                    slug: robot.name.toLowerCase().replace(/\s+/g, '-'),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            
            console.log("Sample robots added successfully!");
        }
        
        // Check if news collection is empty
        const newsCollection = collection(db, "news");
        const newsSnapshot = await getDocs(newsCollection);
        
        if (newsSnapshot.empty) {
            console.log("Initializing database with sample news...");
            
            // Add sample news
            const sampleNews = [
                {
                    title: "Advances in Soft Robotics",
                    content: "<p>New materials enable robots with unprecedented flexibility and adaptability, paving the way for applications in healthcare, search and rescue, and more. Researchers have developed a new type of soft actuator that mimics natural muscle movement, allowing for more human-like motion in robotic systems.</p><p>This breakthrough could lead to prosthetics that move more naturally and robots that can navigate complex environments with ease.</p>",
                    publishDate: "2025-04-10T12:00:00Z",
                    author: "Dr. Sarah Chen",
                    category: "Research"
                },
                {
                    title: "Robots in Healthcare",
                    content: "<p>How medical robots are transforming surgery and patient care across hospitals worldwide. From surgical assistants to automated medication dispensing, robots are helping healthcare professionals provide better care with greater precision and efficiency.</p><p>Recent studies have shown that robot-assisted surgeries can lead to shorter recovery times and reduced complications in certain procedures.</p>",
                    publishDate: "2025-04-05T14:30:00Z",
                    author: "Michael Rodriguez",
                    category: "Healthcare"
                },
                {
                    title: "AI Revolution in Robotics",
                    content: "<p>The latest advancements in robot intelligence and decision-making are creating more autonomous and capable machines. Neural network architectures specifically designed for robotic control are enabling robots to learn complex tasks with minimal human supervision.</p><p>These developments are particularly promising for industrial applications where robots need to adapt to changing conditions and work alongside human colleagues safely.</p>",
                    publishDate: "2025-03-28T09:15:00Z",
                    author: "Alex Patel",
                    category: "Artificial Intelligence"
                }
            ];
            
            for (const news of sampleNews) {
                await addDoc(collection(db, "news"), {
                    ...news,
                    slug: news.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').trim(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            
            console.log("Sample news added successfully!");
        }
        
        // Initialize assistant responses
        const responsesCollection = collection(db, "assistantResponses");
        const responsesSnapshot = await getDocs(responsesCollection);
        
        if (responsesSnapshot.empty) {
            console.log("Initializing database with assistant responses...");
            
            // Add sample responses
            const sampleResponses = [
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
                }
            ];
            
            for (const response of sampleResponses) {
                await addDoc(collection(db, "assistantResponses"), {
                    ...response,
                    createdAt: new Date().toISOString()
                });
            }
            
            console.log("Sample assistant responses added successfully!");
        }
        
        return true;
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
}