// Firebase configuration
const firebaseConfig = {
    // Replace with your Firebase config
    apiKey: "YOUR_API_KEY",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            // Redirect to home page after successful login
            window.location.href = 'index.html';
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

// Signup form handler
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = signupForm.name.value;
        const email = signupForm.email.value;
        const password = signupForm.password.value;
        const confirmPassword = signupForm.confirmPassword.value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        try {
            // Create user account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Add user profile to Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Redirect to home page after successful signup
            window.location.href = 'index.html';
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

// Auth state observer
auth.onAuthStateChanged(user => {
    const authButtons = document.querySelectorAll('.btn-login, .btn-signup');
    const bookButton = document.querySelector('.btn-book');
    
    if (user) {
        // User is signed in
        authButtons.forEach(button => button.style.display = 'none');
        if (bookButton) {
            bookButton.style.display = 'inline-flex';
        }
    } else {
        // User is signed out
        authButtons.forEach(button => button.style.display = 'inline-flex');
        if (bookButton) {
            bookButton.style.display = 'none';
        }
    }
});
