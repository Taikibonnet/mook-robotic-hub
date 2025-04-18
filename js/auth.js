// Authentication JavaScript for MOOK Robotics Hub
// This file handles user authentication (login, signup, logout) using Firebase

import { 
    auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    db,
    doc,
    setDoc,
    getDoc
} from './firebase-config.js';

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const closeBtns = document.querySelectorAll('.close-modal');
const logoutBtn = document.getElementById('logout-btn');
const userDisplay = document.getElementById('user-display');
const adminLink = document.getElementById('admin-link');

// Show/Hide modals
function showModal(modal) {
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
}

function hideModal(modal) {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Toggle between login and signup modals
function toggleModals() {
    const isLoginVisible = loginModal.style.display === 'flex';
    if (isLoginVisible) {
        hideModal(loginModal);
        showModal(signupModal);
    } else {
        hideModal(signupModal);
        showModal(loginModal);
    }
}

// Event Listeners
if (loginBtn) {
    loginBtn.addEventListener('click', () => showModal(loginModal));
}

if (signupBtn) {
    signupBtn.addEventListener('click', () => showModal(signupModal));
}

if (switchToSignup) {
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModals();
    });
}

if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModals();
    });
}

// Close modal when clicking the close button or outside the modal
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        hideModal(loginModal);
        hideModal(signupModal);
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        hideModal(loginModal);
    }
    if (e.target === signupModal) {
        hideModal(signupModal);
    }
});

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('login-error') || document.createElement('p');
        
        if (!document.getElementById('login-error')) {
            errorElement.id = 'login-error';
            errorElement.classList.add('error-message');
            loginForm.insertBefore(errorElement, loginForm.querySelector('.form-footer'));
        }
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            hideModal(loginModal);
            // Clear form
            loginForm.reset();
            errorElement.textContent = '';
        } catch (error) {
            console.error('Login error:', error);
            errorElement.textContent = getAuthErrorMessage(error.code);
        }
    });
}

// Handle signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const errorElement = document.getElementById('signup-error') || document.createElement('p');
        
        if (!document.getElementById('signup-error')) {
            errorElement.id = 'signup-error';
            errorElement.classList.add('error-message');
            signupForm.insertBefore(errorElement, signupForm.querySelector('.form-footer'));
        }
        
        // Validate password match
        if (password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            return;
        }
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Create user profile in Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                name: name,
                email: email,
                createdAt: new Date().toISOString(),
                role: 'user' // Default role
            });
            
            hideModal(signupModal);
            // Clear form
            signupForm.reset();
            errorElement.textContent = '';
        } catch (error) {
            console.error('Signup error:', error);
            errorElement.textContent = getAuthErrorMessage(error.code);
        }
    });
}

// Handle logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
}

// Error message helper
function getAuthErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        default:
            return 'An error occurred. Please try again.';
    }
}

// Auth state observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.email);
        
        // Update UI for authenticated user
        if (loginBtn && signupBtn) {
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';
        }
        
        if (userDisplay) {
            // Get user data from Firestore
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    userDisplay.innerHTML = `
                        <span class="user-name">${userData.name}</span>
                        <button id="logout-btn" class="btn btn-secondary">Logout</button>
                    `;
                    
                    // Add logout event listener to the new button
                    document.getElementById('logout-btn').addEventListener('click', async () => {
                        try {
                            await signOut(auth);
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    });
                    
                    // Show admin link if user is an admin
                    if (userData.role === 'admin' && adminLink) {
                        adminLink.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Error getting user data:', error);
            }
        }
        
        // Dispatch event for other components to react to auth state change
        document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
        
    } else {
        // User is signed out
        console.log('User is signed out');
        
        // Update UI for unauthenticated user
        if (loginBtn && signupBtn) {
            loginBtn.style.display = 'block';
            signupBtn.style.display = 'block';
        }
        
        if (userDisplay) {
            userDisplay.innerHTML = '';
        }
        
        if (adminLink) {
            adminLink.style.display = 'none';
        }
        
        // Dispatch event for other components to react to auth state change
        document.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
});

// Special function to check if the current user is an admin
export async function isAdmin() {
    const user = auth.currentUser;
    if (!user) return false;
    
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            return userDoc.data().role === 'admin';
        }
        return false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Create admin user if none exists (used in setup)
export async function setupAdminUser(email, password) {
    try {
        // Check if user exists
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
            .catch(async () => {
                // If login fails, create the user
                return await createUserWithEmailAndPassword(auth, email, password);
            });
        
        // Set or update user as admin
        await setDoc(doc(db, "users", userCredential.user.uid), {
            name: "Administrator",
            email: email,
            role: 'admin',
            createdAt: new Date().toISOString()
        }, { merge: true });
        
        return userCredential.user;
    } catch (error) {
        console.error('Error setting up admin user:', error);
        throw error;
    }
}

// Initialize admin detection
document.addEventListener('DOMContentLoaded', async () => {
    // Create admin account if specified in the requirements
    // This would typically be part of a setup process, not in production code
    // For this example, we use the admin credentials provided in the requirements
    if (window.location.pathname.includes('admin/') || window.location.pathname.includes('setup.html')) {
        try {
            const adminEmail = 'tgen.robotics@gmail.com';
            const adminPassword = 'Admin123!';
            await setupAdminUser(adminEmail, adminPassword);
        } catch (error) {
            console.error('Admin setup error:', error);
        }
    }
});